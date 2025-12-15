#!/bin/bash
# Auto-restarting port forwarding script for Ditto Insurance
# This script monitors and automatically restarts port forwarding when it fails

FRONTEND_PORT=3000
API_PORT=8000
NAMESPACE="ditto-insurance"
LOG_DIR="/tmp"
FRONTEND_LOG="$LOG_DIR/ditto-frontend-port-forward.log"
API_LOG="$LOG_DIR/ditto-api-port-forward.log"

# Function to start port forwarding
start_port_forward() {
    local service=$1
    local port=$2
    local log_file=$3
    
    # Kill existing port forward for this service
    pkill -f "kubectl port-forward.*$service.*$port" || true
    sleep 1
    
    # Start new port forward in background
    kubectl port-forward svc/$service $port:80 -n $NAMESPACE > "$log_file" 2>&1 &
    echo $!
}

# Function to check if port forwarding is working
check_port_forward() {
    local port=$1
    local url="http://localhost:$port"
    
    if curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url" | grep -q "200\|301\|302"; then
        return 0
    else
        return 1
    fi
}

# Function to monitor and restart port forwarding
monitor_port_forward() {
    local service=$1
    local port=$2
    local log_file=$3
    local pid_var=$4
    
    while true; do
        sleep 5
        
        # Check if process is still running
        if ! kill -0 ${!pid_var} 2>/dev/null; then
            echo "[$(date)] Port forward for $service died, restarting..."
            eval "$pid_var=$(start_port_forward $service $port $log_file)"
        fi
        
        # Check if port is responding
        if ! check_port_forward $port; then
            echo "[$(date)] Port $port not responding, restarting port forward for $service..."
            eval "$pid_var=$(start_port_forward $service $port $log_file)"
            sleep 2
        fi
    done
}

# Main execution
echo "Starting auto-port-forward for Ditto Insurance..."
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "API: http://localhost:$API_PORT"
echo ""

# Start initial port forwards
FRONTEND_PID=$(start_port_forward ditto-insurance-frontend $FRONTEND_PORT $FRONTEND_LOG)
API_PID=$(start_port_forward ditto-insurance-api $API_PORT $API_LOG)

echo "Port forwarding started:"
echo "  Frontend PID: $FRONTEND_PID"
echo "  API PID: $API_PID"
echo ""
echo "Monitoring and auto-restarting port forwards..."
echo "Press Ctrl+C to stop"
echo ""

# Start monitoring in background
monitor_port_forward ditto-insurance-frontend $FRONTEND_PORT $FRONTEND_LOG FRONTEND_PID &
MONITOR_FRONTEND_PID=$!

monitor_port_forward ditto-insurance-api $API_PORT $API_LOG API_PID &
MONITOR_API_PID=$!

# Wait for interrupt
trap "echo 'Stopping port forwarding...'; kill $FRONTEND_PID $API_PID $MONITOR_FRONTEND_PID $MONITOR_API_PID 2>/dev/null; exit" INT TERM

wait

