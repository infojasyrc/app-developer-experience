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

  local components=()

  local cm_api
  cm_api=$(printf "%s\n" "$committed" | grep -E '^(conference-manager/ms-conference-api/)' || true)

  if [[ -n "$cm_api" ]]; then
    components+=("cm-api")
  fi

  # map cm webapp changes to cm-webapp component
  local cm_webapp
  cm_webapp=$(printf "%s\n" "$committed" | grep -E '^(conference-manager/ms-conference-webapp/)' || true)

  if [[ -n "$cm_webapp" ]]; then
    components+=("cm-webapp")
  fi

  # build a summary of the changes per component
  local summary=""
  if [[ -n "$cm_api" ]]; then
    summary+="--- conference manager, api changes files:"$'\n'
    while IFS= read -r line; do
      summary+="    - $line"$'\n'
    done <<< "$cm_api"
  fi
  if [[ -n "$cm_webapp" ]]; then
    summary+="--- conference manager, webapp changes files:"$'\n'
    while IFS= read -r line; do
      summary+="    - $line"$'\n'
    done <<< "$cm_webapp"
  fi

  # write the summary to the output
  if [[ -n "${GITHUB_OUTPUT}" && -n "$summary" ]]; then
    {
        echo "summary<<EOF"
        echo "$summary"
        echo "EOF"
    } >> "${GITHUB_OUTPUT}"
  fi

  echo "${components[*]:-}"
}
