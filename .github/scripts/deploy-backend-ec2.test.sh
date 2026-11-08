#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DEPLOY_SCRIPT="${SCRIPT_DIR}/deploy-backend-ec2.sh"
TEST_ROOT=$(mktemp -d)
TEST_USER=$(id -un)
BUCKET_NAME="test-deploy-bucket"
SHA_ONE="1111111111111111111111111111111111111111"
SHA_TWO="2222222222222222222222222222222222222222"

trap 'rm -rf "${TEST_ROOT}"' EXIT

# 테스트를 즉시 실패시키고 원인을 출력한다.
fail() {
  echo "FAIL: $*" >&2
  exit 1
}

# 두 문자열이 같지 않으면 설명과 함께 실패한다.
assert_equal() {
  local expected=$1
  local actual=$2
  local message=$3

  [[ "${actual}" == "${expected}" ]] ||
    fail "${message}: expected '${expected}', got '${actual}'"
}

# 지정한 일반 파일이 존재하는지 확인한다.
assert_file_exists() {
  local path=$1
  [[ -f "${path}" ]] || fail "expected file: ${path}"
}

# 파일과 심볼릭 링크가 모두 없는 상태인지 확인한다.
assert_path_missing() {
  local path=$1
  [[ ! -e "${path}" && ! -L "${path}" ]] || fail "expected missing path: ${path}"
}

# AWS, PM2와 curl의 관찰 가능한 동작을 기록하는 가짜 명령을 만든다.
create_fake_commands() {
  local case_root=$1
  local fake_bin="${case_root}/fake-bin"

  mkdir -p "${fake_bin}"

  cat > "${fake_bin}/aws" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

[[ "$1 $2" == "s3 cp" ]] || exit 64
source_uri=$3
destination=$4
relative_path=${source_uri#s3://*/}
cp "${FAKE_S3_ROOT}/${relative_path}" "${destination}"
EOF

  cat > "${fake_bin}/pm2" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
printf '%s\n' "$*" >> "${PM2_CALL_LOG}"
EOF

  cat > "${fake_bin}/curl" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
[[ "$(cat "${HEALTH_MODE_FILE}")" == "success" ]]
EOF

  chmod +x "${fake_bin}/aws" "${fake_bin}/pm2" "${fake_bin}/curl"
}

# 테스트용 서버 파일을 압축하고 S3 모양의 경로에 체크섬과 함께 둔다.
create_artifact() {
  local case_root=$1
  local release_sha=$2
  local source_root="${case_root}/artifact-source"
  local s3_release="${case_root}/s3/releases/${release_sha}"

  rm -rf "${source_root}"
  mkdir -p "${source_root}/dist" "${source_root}/node_modules" "${s3_release}"
  printf 'server %s\n' "${release_sha}" > "${source_root}/dist/server.js"
  printf 'fixture\n' > "${source_root}/node_modules/.fixture"
  tar -C "${source_root}" -czf "${s3_release}/sopum-api.tar.gz" .
  sha256sum "${s3_release}/sopum-api.tar.gz" \
    > "${s3_release}/sopum-api.tar.gz.sha256"
}

# 각 시나리오가 독립적으로 사용할 배포 디렉터리와 환경을 만든다.
setup_case() {
  local case_name=$1
  local case_root="${TEST_ROOT}/${case_name}"

  mkdir -p \
    "${case_root}/deploy/releases" \
    "${case_root}/deploy/shared" \
    "${case_root}/pm2" \
    "${case_root}/tmp"
  printf 'MONGODB_URI=redacted\n' > "${case_root}/deploy/shared/.env"
  printf 'success\n' > "${case_root}/health-mode"
  : > "${case_root}/pm2-calls.log"
  create_fake_commands "${case_root}"
  printf '%s\n' "${case_root}"
}

# 롤백 검증에 사용할 기존 릴리스와 current 링크를 만든다.
create_previous_release() {
  local case_root=$1
  local release_sha=$2
  local release_dir="${case_root}/deploy/releases/${release_sha}"

  mkdir -p "${release_dir}/dist" "${release_dir}/node_modules"
  printf 'previous\n' > "${release_dir}/dist/server.js"
  ln -s "${case_root}/deploy/shared/.env" "${release_dir}/.env"
  ln -s "${release_dir}" "${case_root}/deploy/current"
}

# 운영 기본값 대신 테스트 경로와 가짜 명령으로 배포 스크립트를 실행한다.
run_deploy() {
  local case_root=$1
  local release_sha=$2

  DEPLOY_ROOT="${case_root}/deploy" \
  DEPLOY_USER="${TEST_USER}" \
  DEPLOY_HOME="${case_root}" \
  AWS_BIN="${case_root}/fake-bin/aws" \
  PM2_BIN="${case_root}/fake-bin/pm2" \
  CURL_BIN="${case_root}/fake-bin/curl" \
  PM2_HOME_DIR="${case_root}/pm2" \
  NODE_BIN_DIR="${case_root}/fake-bin" \
  SHARED_ENV_FILE="${case_root}/deploy/shared/.env" \
  HEALTH_MODE_FILE="${case_root}/health-mode" \
  HEALTH_ATTEMPTS=2 \
  HEALTH_DELAY_SECONDS=0 \
  FAKE_S3_ROOT="${case_root}/s3" \
  PM2_CALL_LOG="${case_root}/pm2-calls.log" \
  TMPDIR="${case_root}/tmp" \
    bash "${DEPLOY_SCRIPT}" "${BUCKET_NAME}" "${release_sha}"
}

# 정상 배포가 릴리스, 환경 링크, PM2 재시작과 임시 파일 정리를 끝내는지 확인한다.
test_successful_deployment() {
  local case_root
  case_root=$(setup_case "success")
  create_artifact "${case_root}" "${SHA_ONE}"

  run_deploy "${case_root}" "${SHA_ONE}"

  assert_equal \
    "$(readlink -f "${case_root}/deploy/releases/${SHA_ONE}")" \
    "$(readlink -f "${case_root}/deploy/current")" \
    "current release"
  assert_equal \
    "${case_root}/deploy/shared/.env" \
    "$(readlink "${case_root}/deploy/releases/${SHA_ONE}/.env")" \
    "shared env link"
  assert_file_exists "${case_root}/deploy/releases/${SHA_ONE}/dist/server.js"
  assert_equal "1" "$(wc -l < "${case_root}/pm2-calls.log" | tr -d ' ')" "PM2 restart count"
  assert_equal "0" "$(find "${case_root}/tmp" -mindepth 1 | wc -l | tr -d ' ')" "temporary file count"
}

# 같은 SHA를 다시 배포해도 안전하게 재시작되는지 확인한다.
test_redeploys_same_sha() {
  local case_root
  case_root=$(setup_case "same-sha")
  create_artifact "${case_root}" "${SHA_ONE}"

  run_deploy "${case_root}" "${SHA_ONE}"
  run_deploy "${case_root}" "${SHA_ONE}"

  assert_equal "2" "$(wc -l < "${case_root}/pm2-calls.log" | tr -d ' ')" "same SHA restart count"
  assert_equal \
    "$(readlink -f "${case_root}/deploy/releases/${SHA_ONE}")" \
    "$(readlink -f "${case_root}/deploy/current")" \
    "same SHA current release"
}

# 기존 릴리스의 환경 링크가 바뀌면 재배포 전에 거부하는지 확인한다.
test_rejects_wrong_existing_env_link() {
  local case_root
  case_root=$(setup_case "wrong-existing-env")
  create_artifact "${case_root}" "${SHA_ONE}"
  run_deploy "${case_root}" "${SHA_ONE}"
  ln -sfn "${case_root}/wrong.env" "${case_root}/deploy/releases/${SHA_ONE}/.env"

  if run_deploy "${case_root}" "${SHA_ONE}"; then
    fail "existing release with a wrong .env link should fail"
  fi

  assert_equal "1" "$(wc -l < "${case_root}/pm2-calls.log" | tr -d ' ')" "wrong env link restart count"
}

# 경로로 사용할 수 없는 SHA를 current 전환 전에 거부하는지 확인한다.
test_rejects_invalid_sha() {
  local case_root
  case_root=$(setup_case "invalid-sha")
  create_previous_release "${case_root}" "${SHA_ONE}"

  if run_deploy "${case_root}" "not-a-sha"; then
    fail "invalid SHA should fail"
  fi

  assert_equal \
    "$(readlink -f "${case_root}/deploy/releases/${SHA_ONE}")" \
    "$(readlink -f "${case_root}/deploy/current")" \
    "invalid SHA preserves current"
}

# 아티팩트 체크섬 불일치가 현재 릴리스를 보존하는지 확인한다.
test_rejects_bad_checksum() {
  local case_root
  case_root=$(setup_case "bad-checksum")
  create_previous_release "${case_root}" "${SHA_ONE}"
  create_artifact "${case_root}" "${SHA_TWO}"
  printf '%064d  archive\n' 0 \
    > "${case_root}/s3/releases/${SHA_TWO}/sopum-api.tar.gz.sha256"

  if run_deploy "${case_root}" "${SHA_TWO}"; then
    fail "bad checksum should fail"
  fi

  assert_equal \
    "$(readlink -f "${case_root}/deploy/releases/${SHA_ONE}")" \
    "$(readlink -f "${case_root}/deploy/current")" \
    "bad checksum preserves current"
}

# 공유 환경변수 파일이 없으면 배포를 시작하지 않는지 확인한다.
test_rejects_missing_shared_env() {
  local case_root
  case_root=$(setup_case "missing-env")
  create_previous_release "${case_root}" "${SHA_ONE}"
  create_artifact "${case_root}" "${SHA_TWO}"
  rm "${case_root}/deploy/shared/.env"

  if run_deploy "${case_root}" "${SHA_TWO}"; then
    fail "missing shared env should fail"
  fi

  assert_equal \
    "$(readlink -f "${case_root}/deploy/releases/${SHA_ONE}")" \
    "$(readlink -f "${case_root}/deploy/current")" \
    "missing env preserves current"
}

# 상태 확인 실패가 이전 current와 PM2 프로세스를 복구하는지 확인한다.
test_rolls_back_failed_health_check() {
  local case_root
  case_root=$(setup_case "rollback")
  create_previous_release "${case_root}" "${SHA_ONE}"
  create_artifact "${case_root}" "${SHA_TWO}"
  printf 'fail\n' > "${case_root}/health-mode"

  if run_deploy "${case_root}" "${SHA_TWO}"; then
    fail "failed health check should fail deployment"
  fi

  assert_equal \
    "$(readlink -f "${case_root}/deploy/releases/${SHA_ONE}")" \
    "$(readlink -f "${case_root}/deploy/current")" \
    "rollback restores previous release"
  assert_equal "2" "$(wc -l < "${case_root}/pm2-calls.log" | tr -d ' ')" "rollback PM2 restart count"
}

# 첫 배포 실패가 current를 제거하고 실패한 PM2 프로세스를 멈추는지 확인한다.
test_failed_first_deployment_leaves_no_current() {
  local case_root
  case_root=$(setup_case "first-failure")
  create_artifact "${case_root}" "${SHA_ONE}"
  printf 'fail\n' > "${case_root}/health-mode"

  if run_deploy "${case_root}" "${SHA_ONE}"; then
    fail "failed first deployment should fail"
  fi

  assert_path_missing "${case_root}/deploy/current"
  assert_equal "restart sopum-api --update-env" "$(head -n 1 "${case_root}/pm2-calls.log")" "first deployment restart"
  assert_equal "stop sopum-api" "$(tail -n 1 "${case_root}/pm2-calls.log")" "failed first deployment stop"
}

# 모든 배포와 실패 시나리오를 순서대로 실행한다.
main() {
  [[ -f "${DEPLOY_SCRIPT}" ]] || fail "deployment script is missing: ${DEPLOY_SCRIPT}"

  test_successful_deployment
  test_redeploys_same_sha
  test_rejects_wrong_existing_env_link
  test_rejects_invalid_sha
  test_rejects_bad_checksum
  test_rejects_missing_shared_env
  test_rolls_back_failed_health_check
  test_failed_first_deployment_leaves_no_current

  echo "PASS: deploy-backend-ec2 integration tests"
}

main "$@"
