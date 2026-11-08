#!/usr/bin/env bash

set -Eeuo pipefail

DEPLOY_BUCKET=${1:-}
RELEASE_SHA=${2:-}
EC2_INSTANCE_ID=${3:-}
AWS_REGION=${AWS_REGION:-ap-northeast-2}
AWS_BIN=${AWS_BIN:-aws}
JQ_BIN=${JQ_BIN:-jq}
SSM_WAITER_ROUNDS=${SSM_WAITER_ROUNDS:-3}

# 셸 명령에 들어갈 배포 식별자가 안전한 형식인지 확인한다.
validate_inputs() {
  [[ "${DEPLOY_BUCKET}" =~ ^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$ ]] || {
    echo "DEPLOY_BUCKET is missing or invalid" >&2
    return 1
  }

  [[ "${RELEASE_SHA}" =~ ^[0-9a-f]{40}$ ]] || {
    echo "RELEASE_SHA must be a 40-character lowercase hexadecimal SHA" >&2
    return 1
  }

  [[ "${EC2_INSTANCE_ID}" =~ ^i-[0-9a-f]{17}$ ]] || {
    echo "EC2_INSTANCE_ID must be a 17-character EC2 instance ID" >&2
    return 1
  }

  [[ "${AWS_REGION}" =~ ^[a-z]{2}-[a-z]+-[0-9]+$ ]] || {
    echo "AWS_REGION is invalid" >&2
    return 1
  }

  [[ "${SSM_WAITER_ROUNDS}" =~ ^[1-9][0-9]*$ ]] || {
    echo "SSM_WAITER_ROUNDS must be a positive integer" >&2
    return 1
  }
}

# 검증된 값으로 AWS-RunShellScript의 명령 배열을 JSON으로 만든다.
build_parameters_json() {
  local remote_dir="/tmp/sopum-deploy-${RELEASE_SHA}"
  local remote_script="${remote_dir}/deploy-backend-ec2.sh"
  local script_uri="s3://${DEPLOY_BUCKET}/releases/${RELEASE_SHA}/deploy-backend-ec2.sh"

  "${JQ_BIN}" -cn \
    --arg strict_mode 'set -eu' \
    --arg prepare "mkdir -p '${remote_dir}' && trap \"rm -rf '${remote_dir}'\" EXIT" \
    --arg download "aws s3 cp '${script_uri}' '${remote_script}' --region '${AWS_REGION}'" \
    --arg download_checksum "aws s3 cp '${script_uri}.sha256' '${remote_script}.sha256' --region '${AWS_REGION}'" \
    --arg verify "(cd '${remote_dir}' && sha256sum -c 'deploy-backend-ec2.sh.sha256')" \
    --arg permission "chmod 700 '${remote_script}'" \
    --arg deploy "'${remote_script}' '${DEPLOY_BUCKET}' '${RELEASE_SHA}'" \
    '{commands: [$strict_mode, $prepare, $download, $download_checksum, $verify, $permission, $deploy]}'
}

# SSM 명령을 보내고 GitHub Actions가 추적할 command ID를 반환한다.
send_deployment_command() {
  local parameters_json=$1

  "${AWS_BIN}" ssm send-command \
    --region "${AWS_REGION}" \
    --instance-ids "${EC2_INSTANCE_ID}" \
    --document-name AWS-RunShellScript \
    --comment "Deploy sopum-api ${RELEASE_SHA}" \
    --parameters "${parameters_json}" \
    --query Command.CommandId \
    --output text
}

# SSM 완료를 기다린 뒤 성공 여부와 관계없이 원격 로그를 출력한다.
wait_for_command() {
  local command_id=$1
  local invocation_output
  local invocation_status
  local round
  local status
  local wait_status

  for ((round = 1; round <= SSM_WAITER_ROUNDS; round += 1)); do
    set +e
    "${AWS_BIN}" ssm wait command-executed \
      --region "${AWS_REGION}" \
      --command-id "${command_id}" \
      --instance-id "${EC2_INSTANCE_ID}"
    wait_status=$?

    invocation_output=$("${AWS_BIN}" ssm get-command-invocation \
      --region "${AWS_REGION}" \
      --command-id "${command_id}" \
      --instance-id "${EC2_INSTANCE_ID}" 2>&1)
    invocation_status=$?
    set -e

    printf '%s\n' "${invocation_output}"
    if [[ "${invocation_status}" -ne 0 ]]; then
      if ((round < SSM_WAITER_ROUNDS)); then
        continue
      fi
      echo "Could not read SSM command result: ${command_id}" >&2
      return 1
    fi

    status=$(printf '%s\n' "${invocation_output}" | "${JQ_BIN}" -r '.Status // empty')
    if [[ "${wait_status}" -eq 0 && "${status}" == "Success" ]]; then
      return 0
    fi

    case "${status}" in
      Pending | InProgress | Delayed)
        if ((round < SSM_WAITER_ROUNDS)); then
          continue
        fi
        ;;
      Success)
        return 0
        ;;
    esac

    echo "SSM command did not complete successfully: ${command_id} (${status:-unknown})" >&2
    return 1
  done
}

# 입력 검증부터 결과 조회까지 한 번의 배포 흐름으로 실행한다.
main() {
  local parameters_json
  local command_id

  validate_inputs
  parameters_json=$(build_parameters_json)
  command_id=$(send_deployment_command "${parameters_json}")

  [[ "${command_id}" =~ ^[0-9a-f-]{36}$ ]] || {
    echo "AWS returned an invalid SSM command ID: ${command_id}" >&2
    return 1
  }

  echo "SSM command ID: ${command_id}"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf 'command_id=%s\n' "${command_id}" >> "${GITHUB_OUTPUT}"
  fi

  wait_for_command "${command_id}"
}

main "$@"
