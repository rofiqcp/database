#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT_DIR/.run"
LOG_DIR="$ROOT_DIR/.logs"

BACKEND_JAR="$ROOT_DIR/backend/target/gdrive-1.0.0.jar"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PID="$PID_DIR/backend.pid"
FRONTEND_PID="$PID_DIR/frontend.pid"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

mkdir -p "$PID_DIR" "$LOG_DIR"

is_running() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

start_backend() {
  if is_running "$BACKEND_PID"; then
    echo "Backend already running (PID $(cat "$BACKEND_PID"))."
    return 0
  fi
  if [[ ! -f "$BACKEND_JAR" ]]; then
    echo "Backend jar not found: $BACKEND_JAR"
    echo "Build backend first: cd backend && mvn -DskipTests package"
    return 1
  fi
  echo "Starting backend..."
  nohup java -jar "$BACKEND_JAR" >"$BACKEND_LOG" 2>&1 &
  echo $! >"$BACKEND_PID"
  echo "Backend started (PID $(cat "$BACKEND_PID"))."
}

start_frontend() {
  if is_running "$FRONTEND_PID"; then
    echo "Frontend already running (PID $(cat "$FRONTEND_PID"))."
    return 0
  fi
  if [[ ! -d "$FRONTEND_DIR/dist" ]]; then
    echo "Frontend build not found: $FRONTEND_DIR/dist"
    echo "Build frontend first: cd frontend && npm install && npm run build"
    return 1
  fi
  echo "Starting frontend preview..."
  nohup npm --prefix "$FRONTEND_DIR" run preview -- --host 0.0.0.0 --port 4173 >"$FRONTEND_LOG" 2>&1 &
  echo $! >"$FRONTEND_PID"
  echo "Frontend started (PID $(cat "$FRONTEND_PID"))."
}

stop_service() {
  local name="$1"
  local pid_file="$2"
  if is_running "$pid_file"; then
    local pid
    pid="$(cat "$pid_file")"
    echo "Stopping $name (PID $pid)..."
    kill "$pid" >/dev/null 2>&1 || true
    rm -f "$pid_file"
    echo "$name stopped."
  else
    echo "$name not running."
  fi
}

status_service() {
  local name="$1"
  local pid_file="$2"
  if is_running "$pid_file"; then
    echo "$name running (PID $(cat "$pid_file"))."
  else
    echo "$name not running."
  fi
}

start_all() {
  start_backend
  start_frontend
}

stop_all() {
  stop_service "Frontend" "$FRONTEND_PID"
  stop_service "Backend" "$BACKEND_PID"
}

status_all() {
  status_service "Backend" "$BACKEND_PID"
  status_service "Frontend" "$FRONTEND_PID"
}

restart_all() {
  stop_all
  start_all
}

show_menu() {
  echo "1) start"
  echo "2) restart"
  echo "3) stop"
  echo "4) status"
  read -r -p "Choose: " choice
  case "$choice" in
    1) start_all ;;
    2) restart_all ;;
    3) stop_all ;;
    4) status_all ;;
    *) echo "Unknown option." ; exit 1 ;;
  esac
}

cmd="${1:-}"
case "$cmd" in
  start) start_all ;;
  restart) restart_all ;;
  stop) stop_all ;;
  status) status_all ;;
  "") show_menu ;;
  1) start_all ;;
  2) restart_all ;;
  3) stop_all ;;
  4) status_all ;;
  *)
    echo "Usage: $0 {start|restart|stop|status}"
    echo "   or: $0 {1|2|3|4}"
    exit 1
    ;;
 esac
