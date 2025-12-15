#!/bin/bash
# Start the persistent port forwarding daemon
# This will keep port forwarding alive in the background

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAEMON_SCRIPT="$SCRIPT_DIR/keep-alive-port-forward.sh"
PID_FILE="/tmp/ditto-port-forward-daemon.pid"

# Check if daemon is already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "✅ Port forwarding daemon is already running (PID: $OLD_PID)"
        echo "   To stop it: kill $OLD_PID"
        echo "   Or run: ./scripts/stop-daemon.sh"
        exit 0
    else
        rm -f "$PID_FILE"
    fi
fi

# Start daemon
echo "🚀 Starting port forwarding daemon..."
nohup bash "$DAEMON_SCRIPT" > /dev/null 2>&1 &
DAEMON_PID=$!

# Save PID
echo $DAEMON_PID > "$PID_FILE"

sleep 3

# Verify it's running
if ps -p $DAEMON_PID > /dev/null 2>&1; then
    echo "✅ Port forwarding daemon started (PID: $DAEMON_PID)"
    echo ""
    echo "Access your services:"
    echo "  Frontend: http://localhost:3000"
    echo "  API: http://localhost:8000"
    echo ""
    echo "The daemon will automatically restart port forwarding if it fails."
    echo ""
    echo "To stop the daemon:"
    echo "  ./scripts/stop-daemon.sh"
    echo "  or"
    echo "  kill $DAEMON_PID"
    echo ""
    echo "View logs:"
    echo "  tail -f /tmp/ditto-port-forward-daemon.log"
else
    echo "❌ Failed to start daemon"
    exit 1
fi

