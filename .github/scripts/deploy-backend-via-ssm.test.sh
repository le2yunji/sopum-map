#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
SCRIPT_UNDER_TEST="${SCRIPT_DIR}/deploy-backend-via-ssm.sh"
VALID_SHA=0123456789abcdef0123456789abcdef01234567
VALID_INSTANCE_ID=i-0123456789abcdef0

test_root=""

# 테스트가 만든 임시 파일을 종료할 때 정리한다.
cleanup() {
  if [[ -n "${test_root}" && -d "${test_root}" ]]; then
    rm -rf "${test_root}"
  fi
}

trap cleanup EXIT

# 한 테스트가 사용할 가짜 AWS CLI와 출력 파일을 준비한다.
setup_test() {
  cleanup
  test_root=$(mktemp -d)
  mkdir -p "${test_root}/bin"

  cat > "${test_root}/bin/aws" <<'FAKE_AWS'
#!/usr/bin/env bash
set -Eeuo pipefail

printf '%q ' "$@" >> "${AWS_CALL_LOG}"
printf '\n' >> "${AWS_CALL_LOG}"

if [[ "${1:-} ${2:-}" == "ssm send-command" ]]; then
  previous_argument=""
  for argument in "$@"; do
    if [[ "${previous_argument}" == "--parameters" ]]; then
      printf '%s\n' "${argument}" > "${AWS_PARAMETERS_FILE}"
    fi
    previous_argument=${argument}
  done
  printf '%s\n' '11111111-2222-3333-4444-555555555555'
  exit 0
fi

if [[ "${1:-} ${2:-}" == "ssm wait" ]]; then
  waiter_calls=$(cat "${AWS_WAITER_CALLS_FILE}")
  waiter_calls=$((waiter_calls + 1))
  printf '%s\n' "${waiter_calls}" > "${AWS_WAITER_CALLS_FILE}"
  if [[ "${waiter_calls}" -le "${AWS_WAITER_FAILURES_BEFORE_SUCCESS:-0}" ]]; then
    exit 255
  fi
  exit 0
fi

if [[ "${1:-} ${2:-}" == "ssm get-command-invocation" ]]; then
  waiter_calls=$(cat "${AWS_WAITER_CALLS_FILE}")
  if [[ -n "${AWS_INVOCATION_STATUS:-}" ]]; then
    status=${AWS_INVOCATION_STATUS}
  elif [[ "${waiter_calls}" -le "${AWS_WAITER_FAILURES_BEFORE_SUCCESS:-0}" ]]; then
    status=InProgress
  else
    status=Success
  fi
  printf '{"Status":"%s","StandardOutputContent":"deployed","StandardErrorContent":""}\n' "${status}"
  exit 0
fi

echo "Unexpected AWS call: $*" >&2
exit 1
FAKE_AWS
  chmod +x "${test_root}/bin/aws"

  export AWS_BIN="${test_root}/bin/aws"
  export AWS_CALL_LOG="${test_root}/aws-calls.log"
  export AWS_PARAMETERS_FILE="${test_root}/parameters.json"
  export AWS_WAITER_CALLS_FILE="${test_root}/waiter-calls"
  export AWS_WAITER_FAILURES_BEFORE_SUCCESS=0
  unset AWS_INVOCATION_STATUS
  : > "${AWS_CALL_LOG}"
  printf '0\n' > "${AWS_WAITER_CALLS_FILE}"
}

# 기대한 문자열이 파일에 없으면 테스트를 실패시킨다.
assert_file_contains() {
  local file_path=$1
  local expected=$2

  grep -F -- "${expected}" "${file_path}" >/dev/null || {
    echo "Expected ${file_path} to contain: ${expected}" >&2
    return 1
  }
}

# 성공 시 SSM 호출 순서와 원격 명령의 핵심 계약을 확인한다.
test_successful_deployment() {
  local output_file="${test_root}/output.log"

  "${SCRIPT_UNDER_TEST}" test-bucket "${VALID_SHA}" "${VALID_INSTANCE_ID}" > "${output_file}"

  assert_file_contains "${output_file}" 'SSM command ID: 11111111-2222-3333-4444-555555555555'
  assert_file_contains "${output_file}" '"Status":"Success"'
  assert_file_contains "${AWS_CALL_LOG}" 'ssm send-command'
  assert_file_contains "${AWS_CALL_LOG}" 'AWS-RunShellScript'
  assert_file_contains "${AWS_CALL_LOG}" "s3://test-bucket/releases/${VALID_SHA}/deploy-backend-ec2.sh"
  assert_file_contains "${AWS_CALL_LOG}" "s3://test-bucket/releases/${VALID_SHA}/deploy-backend-ec2.sh.sha256"
  assert_file_contains "${AWS_PARAMETERS_FILE}" 'sha256sum -c'
  assert_file_contains "${AWS_CALL_LOG}" "ssm wait command-executed"
  assert_file_contains "${AWS_CALL_LOG}" "ssm get-command-invocation"

  local send_line
  local wait_line
  local result_line
  send_line=$(grep -n 'ssm send-command' "${AWS_CALL_LOG}" | cut -d: -f1)
  wait_line=$(grep -n 'ssm wait command-executed' "${AWS_CALL_LOG}" | cut -d: -f1)
  result_line=$(grep -n 'ssm get-command-invocation' "${AWS_CALL_LOG}" | cut -d: -f1)
  [[ "${send_line}" -lt "${wait_line}" && "${wait_line}" -lt "${result_line}" ]]
}

# SSM waiter 실패가 나도 진단 결과를 조회하고 전체 실행은 실패해야 한다.
test_waiter_failure_is_reported() {
  local output_file="${test_root}/output.log"
  export AWS_WAITER_FAILURES_BEFORE_SUCCESS=10
  export AWS_INVOCATION_STATUS=Failed

  if "${SCRIPT_UNDER_TEST}" test-bucket "${VALID_SHA}" "${VALID_INSTANCE_ID}" > "${output_file}" 2>&1; then
    echo "Expected waiter failure to fail the deployment" >&2
    return 1
  fi

  assert_file_contains "${AWS_CALL_LOG}" 'ssm get-command-invocation'
  assert_file_contains "${output_file}" 'SSM command did not complete successfully'
}

# 첫 waiter가 시간 초과돼도 명령이 진행 중이면 다시 기다려 성공을 받는다.
test_in_progress_command_is_waited_for_again() {
  local output_file="${test_root}/output.log"
  export AWS_WAITER_FAILURES_BEFORE_SUCCESS=1

  "${SCRIPT_UNDER_TEST}" test-bucket "${VALID_SHA}" "${VALID_INSTANCE_ID}" > "${output_file}"

  assert_file_contains "${output_file}" '"Status":"InProgress"'
  assert_file_contains "${output_file}" '"Status":"Success"'
  [[ "$(grep -c 'ssm wait command-executed' "${AWS_CALL_LOG}")" -eq 2 ]]
}

# 잘못된 입력은 AWS에 요청하기 전에 거부해야 한다.
test_invalid_input_is_rejected() {
  if "${SCRIPT_UNDER_TEST}" test-bucket invalid-sha "${VALID_INSTANCE_ID}" >/dev/null 2>&1; then
    echo "Expected an invalid SHA to be rejected" >&2
    return 1
  fi

  if "${SCRIPT_UNDER_TEST}" test-bucket "${VALID_SHA}" invalid-instance >/dev/null 2>&1; then
    echo "Expected an invalid instance ID to be rejected" >&2
    return 1
  fi

  [[ ! -s "${AWS_CALL_LOG}" ]]
}

# 각 시나리오를 독립된 임시 환경에서 실행한다.
main() {
  setup_test
  test_successful_deployment

  setup_test
  test_waiter_failure_is_reported

  setup_test
  test_in_progress_command_is_waited_for_again

  setup_test
  test_invalid_input_is_rejected

  echo "PASS: deploy-backend-via-ssm behavior tests"
}

main "$@"
