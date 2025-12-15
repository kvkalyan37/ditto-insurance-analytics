#!/bin/bash
# Persistent port forwarding daemon - Keeps port forwarding alive automatically
# This script runs in the background and automatically restarts port forwarding when it fails

NAMESPACE="ditto-insurance"
FRONTEND_PORT=3000
API_PORT=8000
CHECK_INTERVAL=5
LOG_FILE="/tmp/ditto-port-forward-daemon.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if port forwarding is working
check_port_forward() {
    local port=$1
    local service=$2
    
    # Check if process exists
    local pid=$(pgrep -f "kubectl port-forward.*$service.*$port")
    if [ -z "$pid" ]; then
        return 1
    fi
    
    # Check if port is responding
    if curl -s -o /dev/null -w "%{http_code}" --max-time 2 "http://localhost:$port" 2>/dev/null | grep -qE "200|301|302|404"; then
        return 0
    else
        return 1
    fi
}

# Function to start port forwarding
start_port_forward() {
    local service=$1
    local port=$2
    local target_port=$3
    
    # Kill existing port forward
    pkill -f "kubectl port-forward.*$service.*$port" 2>/dev/null
    sleep 1
    
    # Start new port forward
    kubectl port-forward svc/$service $port:$target_port -n $NAMESPACE > "/tmp/${service}-pf.log" 2>&1 &
    local pid=$!
    sleep 2
    
    # Verify it started
    if kill -0 $pid 2>/dev/null; then
        log "✅ Started port forwarding for $service on port $port (PID: $pid)"
        return 0
    else
        log "❌ Failed to start port forwarding for $service"
        return 1
    fi
}

# Main daemon loop
log "🚀 Starting Ditto Insurance Port Forwarding Daemon"
log "Frontend: http://localhost:$FRONTEND_PORT"
log "API: http://localhost:$API_PORT"
log "Check interval: ${CHECK_INTERVAL}s"
log ""

# Initial start
start_port_forward ditto-insurance-frontend $FRONTEND_PORT 80
start_port_forward ditto-insurance-api $API_PORT 8000

# Daemon loop
while true; do
    sleep $CHECK_INTERVAL
    
    # Check frontend
    if ! check_port_forward $FRONTEND_PORT ditto-insurance-frontend; then
        log "⚠️  Frontend port forward failed, restarting..."
        start_port_forward ditto-insurance-frontend $FRONTEND_PORT 80
    fi
    
    # Check API
    if ! check_port_forward $API_PORT ditto-insurance-api; then
        log "⚠️  API port forward failed, restarting..."
        start_port_forward ditto-insurance-api $API_PORT 8000
    fi
done

