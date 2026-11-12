#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
tools_root=/workspace/.tools/minova-design
browser_socket_root=/tmp/minova-browser-state
case "${1:-help}" in
  setup)
    npm install --prefix "$tools_root" --cache /workspace/.npm-cache --no-audit --no-fund agent-browser@0.42.0 impeccable@4.8.2
    ;;
  browser)
    shift
    mkdir -p "$browser_socket_root"
    export AGENT_BROWSER_SOCKET_DIR="$browser_socket_root"
    browser_session=$("$tools_root/node_modules/.bin/agent-browser" session id --scope worktree --prefix minova)
    exec "$tools_root/node_modules/.bin/agent-browser" --session "$browser_session" --executable-path /usr/bin/chromium --args '--no-sandbox' "$@"
    ;;
  audit)
    shift
    export IMPECCABLE_HOME=/workspace/.tools/impeccable
    exec .agents/skills/impeccable/scripts/impeccable detect "$@"
    ;;
  *)
    printf '%s\n' 'Usage: bash scripts/design-tools.sh setup|browser <command>|audit <targets>'
    ;;
esac
