#!/usr/bin/env bash
set -euo pipefail

get_changed_packages() {
  local target_branch="${1:-${GITHUB_BASE_REF:-main}}"
  local committed=""

  # Get the list of changed files between the two refs
  local event_name="${GITHUB_EVENT_NAME:-}"
  local event_before="${GITHUB_EVENT_BEFORE:-}"
  local zero_sha="0000000000000000000000000000000000000000"

  if [[ "$event_name" == "push" && -n "$event_before" && "$event_before" != "$zero_sha" ]]; then
    # Push event
    git fetch origin "$target_branch" --depth=50 2>/dev/null || true
    committed=$(git diff --name-only "${event_before}...HEAD" 2>/dev/null || true)
  else
    # Pull request
    git fetch origin "$target_branch" --depth=50 2>/dev/null || true
    committed=$(git diff --name-only "origin/${target_branch}...HEAD" 2>/dev/null || true)
  fi

  if [[ -z "$committed" ]]; then
    echo "No changed files detected."
    return 0
  fi

  # Package registry: "path_prefix|component_name|summary_label"
  local -a packages=(
    "conference-manager/ms-conference-api/|cm-api|conference manager API"
    "conference-manager/ms-conference-webapp/|cm-webapp|conference manager webapp"
    "conference-manager/ms-conference-admin/|cm-admin|conference manager admin"
    "backend/ms-fast-api-rest-tpl/|ms-fastapi|FastAPI microservice template"
    "backend/ms-nestjs-rest-tpl/|ms-nestjs-rest|NestJS REST microservice template"
    "backend/ms-nestjs-gql-tpl/|ms-nestjs-gql|NestJS GraphQL microservice template"
    "mobile-app/whitewalker/|mobile-rn|React Native mobile template"
    "mobile-app/whitewolf/|mobile-expo|Expo mobile template"
  )

  local components=()
  local summary=""

  for pkg in "${packages[@]}"; do
    local path_prefix component_name label matches
    IFS='|' read -r path_prefix component_name label <<< "$pkg"
    matches=$(printf "%s\n" "$committed" | grep -E "^${path_prefix}" || true)
    if [[ -n "$matches" ]]; then
      components+=("$component_name")
      summary+="--- ${label} changed files:"$'\n'
      while IFS= read -r line; do
        summary+="    - $line"$'\n'
      done <<< "$matches"
    fi
  done

  # write the summary to the output
  if [[ -n "${GITHUB_OUTPUT:-}" && -n "$summary" ]]; then
    {
      echo "summary<<EOF"
      echo "$summary"
      echo "EOF"
    } >> "${GITHUB_OUTPUT}"
  fi

  echo "${components[*]:-}"
}
