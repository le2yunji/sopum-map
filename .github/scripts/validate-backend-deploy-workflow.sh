#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPOSITORY_ROOT=$(cd "${SCRIPT_DIR}/../.." && pwd)
WORKFLOW_FILE="${REPOSITORY_ROOT}/.github/workflows/deploy-backend-ec2.yml"

# 필요한 워크플로 연결 문자열이 없으면 이해하기 쉬운 오류를 낸다.
require_workflow_contract() {
  local expected=$1
  local description=$2

  grep -F -- "${expected}" "${WORKFLOW_FILE}" >/dev/null || {
    echo "Missing workflow contract: ${description}" >&2
    return 1
  }
}

# YAML 구문과 EC2 자동 배포에 필요한 연결 지점을 검증한다.
main() {
  ruby -e 'require "yaml"; YAML.load_file(ARGV.fetch(0))' "${WORKFLOW_FILE}" >/dev/null

  require_workflow_contract 'EC2_INSTANCE_ID: ${{ vars.EC2_INSTANCE_ID }}' 'EC2 instance repository variable'
  require_workflow_contract ': "${EC2_INSTANCE_ID:?EC2_INSTANCE_ID repository variable is required}"' 'EC2 instance variable validation'
  require_workflow_contract 'deploy-backend-ec2.sh' 'versioned EC2 deployment script upload'
  require_workflow_contract 'bash .github/scripts/deploy-backend-via-ssm.sh' 'SSM deployment orchestration'
  require_workflow_contract 'id: deploy' 'deployment step output ID'
  require_workflow_contract '${{ steps.deploy.outputs.command_id }}' 'SSM command ID summary'

  echo "PASS: backend deployment workflow contract"
}

main "$@"
