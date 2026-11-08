#!/usr/bin/env bash

set -Eeuo pipefail

DEPLOY_BUCKET=${1:-}
RELEASE_SHA=${2:-}
AWS_REGION=${AWS_REGION:-ap-northeast-2}
DEPLOY_ROOT=${DEPLOY_ROOT:-/home/ubuntu/sopum-map-deploy}
DEPLOY_USER=${DEPLOY_USER:-ubuntu}
DEPLOY_HOME=${DEPLOY_HOME:-/home/ubuntu}
RELEASES_DIR=${RELEASES_DIR:-${DEPLOY_ROOT}/releases}
CURRENT_LINK=${CURRENT_LINK:-${DEPLOY_ROOT}/current}
SHARED_ENV_FILE=${SHARED_ENV_FILE:-${DEPLOY_ROOT}/shared/.env}
NODE_BIN_DIR=${NODE_BIN_DIR:-/home/ubuntu/.nvm/versions/node/v24.22.1/bin}
PM2_BIN=${PM2_BIN:-${NODE_BIN_DIR}/pm2}
PM2_HOME_DIR=${PM2_HOME_DIR:-${DEPLOY_HOME}/.pm2}
PM2_APP_NAME=${PM2_APP_NAME:-sopum-api}
AWS_BIN=${AWS_BIN:-aws}
CURL_BIN=${CURL_BIN:-curl}
RUNUSER_BIN=${RUNUSER_BIN:-runuser}
HEALTH_URL=${HEALTH_URL:-http://127.0.0.1:4000/api/health}
HEALTH_ATTEMPTS=${HEALTH_ATTEMPTS:-15}
HEALTH_DELAY_SECONDS=${HEALTH_DELAY_SECONDS:-2}

download_dir=""
staging_dir=""
previous_release=""
prepared_release=""

# 배포 도중 만든 임시 다운로드와 스테이징 디렉터리를 정리한다.
cleanup() {
  if [[ -n "${download_dir}" && -d "${download_dir}" ]]; then
    rm -rf "${download_dir}"
  fi

  if [[ -n "${staging_dir}" && -d "${staging_dir}" ]]; then
    rm -rf "${staging_dir}"
  fi
}

trap cleanup EXIT

# 배포가 현재 서버 구조에서 안전하게 시작될 수 있는지 확인한다.
validate_inputs() {
  [[ -n "${DEPLOY_BUCKET}" ]] || {
    echo "DEPLOY_BUCKET is required" >&2
    return 1
  }

  [[ "${RELEASE_SHA}" =~ ^[0-9a-f]{40}$ ]] || {
    echo "RELEASE_SHA must be a 40-character lowercase hexadecimal SHA" >&2
    return 1
  }

  [[ -f "${SHARED_ENV_FILE}" ]] || {
    echo "Shared environment file is missing: ${SHARED_ENV_FILE}" >&2
    return 1
  }

  [[ "${HEALTH_ATTEMPTS}" =~ ^[1-9][0-9]*$ ]] || {
    echo "HEALTH_ATTEMPTS must be a positive integer" >&2
    return 1
  }
}

# S3 아티팩트와 체크섬을 내려받아 파일 무결성을 확인한다.
download_and_verify_release() {
  local s3_prefix="s3://${DEPLOY_BUCKET}/releases/${RELEASE_SHA}"
  local archive_path
  local checksum_path
  local expected_hash
  local actual_hash

  download_dir=$(mktemp -d)
  archive_path="${download_dir}/sopum-api.tar.gz"
  checksum_path="${download_dir}/sopum-api.tar.gz.sha256"

  "${AWS_BIN}" s3 cp \
    "${s3_prefix}/sopum-api.tar.gz" \
    "${archive_path}" \
    --region "${AWS_REGION}" || return 1
  "${AWS_BIN}" s3 cp \
    "${s3_prefix}/sopum-api.tar.gz.sha256" \
    "${checksum_path}" \
    --region "${AWS_REGION}" || return 1

  expected_hash=$(awk 'NR == 1 { print $1 }' "${checksum_path}" | tr 'A-F' 'a-f')
  actual_hash=$(sha256sum "${archive_path}" | awk '{ print $1 }')

  [[ "${expected_hash}" =~ ^[0-9a-fA-F]{64}$ ]] || {
    echo "Artifact checksum file is invalid" >&2
    return 1
  }
  [[ "${actual_hash}" == "${expected_hash}" ]] || {
    echo "Artifact checksum does not match" >&2
    return 1
  }
}

# 압축을 푼 릴리스에 서버 실행 파일과 의존성이 있는지 확인한다.
validate_release_contents() {
  local release_dir=$1

  [[ -f "${release_dir}/dist/server.js" ]] || {
    echo "Release is missing dist/server.js" >&2
    return 1
  }
  [[ -d "${release_dir}/node_modules" ]] || {
    echo "Release is missing node_modules" >&2
    return 1
  }
}

# 재사용하거나 새로 만든 릴리스 경로를 prepared_release에 저장한다.
prepare_release() {
  local release_dir="${RELEASES_DIR}/${RELEASE_SHA}"

  mkdir -p "${RELEASES_DIR}"

  if [[ -d "${release_dir}" ]]; then
    validate_release_contents "${release_dir}" || return 1
    if [[ ! -L "${release_dir}/.env" || "$(readlink "${release_dir}/.env")" != "${SHARED_ENV_FILE}" ]]; then
      echo "Existing release has an invalid shared .env link" >&2
      return 1
    fi
    prepared_release=${release_dir}
    return
  fi

  download_and_verify_release || return 1
  staging_dir=$(mktemp -d "${RELEASES_DIR}/.${RELEASE_SHA}.XXXXXX")
  tar --no-same-owner -xzf "${download_dir}/sopum-api.tar.gz" -C "${staging_dir}" || return 1
  validate_release_contents "${staging_dir}" || return 1
  ln -s "${SHARED_ENV_FILE}" "${staging_dir}/.env" || return 1

  if [[ $(id -u) -eq 0 ]]; then
    chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${staging_dir}" || return 1
  fi

  mv "${staging_dir}" "${release_dir}" || return 1
  staging_dir=""
  prepared_release=${release_dir}
}

# 임시 심볼릭 링크를 사용해 current가 가리키는 릴리스를 교체한다.
switch_current_release() {
  local target_release=$1
  local next_link="${DEPLOY_ROOT}/.current-${RELEASE_SHA}-$$"

  mkdir -p "${DEPLOY_ROOT}"
  ln -s "${target_release}" "${next_link}"

  if [[ "$(uname -s)" == "Darwin" ]]; then
    mv -fh "${next_link}" "${CURRENT_LINK}"
  else
    mv -Tf "${next_link}" "${CURRENT_LINK}"
  fi
}

# 지정한 PM2 명령을 운영 ubuntu 사용자의 환경으로 실행한다.
run_pm2() {
  local pm2_arguments=("$@")
  local command=(
    env
    "HOME=${DEPLOY_HOME}"
    "PM2_HOME=${PM2_HOME_DIR}"
    "PATH=${NODE_BIN_DIR}:/usr/local/bin:/usr/bin:/bin"
    "${PM2_BIN}"
    "${pm2_arguments[@]}"
  )

  if [[ "$(id -un)" == "${DEPLOY_USER}" ]]; then
    "${command[@]}"
    return
  fi

  "${RUNUSER_BIN}" -u "${DEPLOY_USER}" -- "${command[@]}"
}

# 새 current 경로와 환경변수를 읽도록 API 프로세스를 재시작한다.
restart_api() {
  run_pm2 restart "${PM2_APP_NAME}" --update-env
}

# 복구할 이전 릴리스가 없을 때 실패한 API 프로세스를 멈춘다.
stop_api() {
  run_pm2 stop "${PM2_APP_NAME}"
}

# 내부 상태 확인 주소가 제한 시간 안에 성공할 때까지 재시도한다.
wait_for_health() {
  local attempt

  for ((attempt = 1; attempt <= HEALTH_ATTEMPTS; attempt += 1)); do
    if "${CURL_BIN}" --fail --silent --show-error --max-time 5 "${HEALTH_URL}" >/dev/null; then
      return 0
    fi

    if ((attempt < HEALTH_ATTEMPTS)); then
      sleep "${HEALTH_DELAY_SECONDS}"
    fi
  done

  echo "Health check failed after ${HEALTH_ATTEMPTS} attempts" >&2
  return 1
}

# 실패 시 이전 릴리스로 돌아가거나 첫 배포 프로세스를 중지한다.
rollback_release() {
  echo "Deployment failed; restoring the previous release" >&2

  if [[ -n "${previous_release}" && -d "${previous_release}" ]]; then
    switch_current_release "${previous_release}"
    restart_api || echo "Previous release restart also failed" >&2
    return
  fi

  rm -f "${CURRENT_LINK}"
  stop_api || echo "Failed deployment process could not be stopped" >&2
  echo "No previous release was available to restore" >&2
}

# 릴리스 준비, current 전환, PM2 재시작과 상태 확인을 순서대로 수행한다.
main() {
  local new_release

  validate_inputs || return 1
  if [[ -L "${CURRENT_LINK}" ]]; then
    previous_release=$(readlink -f "${CURRENT_LINK}")
  fi

  prepare_release || return 1
  new_release=${prepared_release}
  switch_current_release "${new_release}"

  if ! restart_api || ! wait_for_health; then
    rollback_release
    return 1
  fi

  echo "Deployed ${RELEASE_SHA} to ${new_release}"
}

main "$@"
