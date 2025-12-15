#!/bin/bash
# Stop the persistent port forwarding daemon

PID_FILE="/tmp/ditto-port-forward-daemon.pid"

if [ -f "$PID_FILE" ]; then
    DAEMON_PID=$(cat "$PID_FILE")
    if ps -p $DAEMON_PID > /dev/null 2>&1; then
        echo "Stopping port forwarding daemon (PID: $DAEMON_PID)..."
        kill $DAEMON_PID 2>/dev/null
        sleep 1
        
        # Kill any remaining port forwards
        pkill -f "kubectl port-forward.*ditto-insurance" 2>/dev/null
        
        rm -f "$PID_FILE"
        echo "✅ Daemon stopped"
    else
        echo "Daemon not running"
        rm -f "$PID_FILE"
    fi
else
    echo "Daemon not running (no PID file found)"
    # Still try to kill any port forwards
    pkill -f "kubectl port-forward.*ditto-insurance" 2>/dev/null
fi

