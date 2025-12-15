#!/bin/bash
# Quick access script - Always uses auto-port-forward for reliability
# Run this after any deployment to ensure services are accessible

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Starting Ditto Insurance services..."
echo ""

# Kill any existing port forwards
pkill -f "kubectl port-forward.*ditto-insurance" || true
sleep 1

# Start port forwarding
echo "Starting port forwarding..."
kubectl port-forward svc/ditto-insurance-frontend 3000:80 -n ditto-insurance > /tmp/ditto-frontend-pf.log 2>&1 &
FRONTEND_PID=$!

kubectl port-forward svc/ditto-insurance-api 8000:8000 -n ditto-insurance > /tmp/ditto-api-pf.log 2>&1 &
API_PID=$!

sleep 3

# Verify services are accessible
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Frontend is accessible at: http://localhost:3000"
else
    echo "⚠️  Frontend may not be ready yet. Check logs: tail -f /tmp/ditto-frontend-pf.log"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -q "200"; then
    echo "✅ API is accessible at: http://localhost:8000"
else
    echo "⚠️  API may not be ready yet. Check logs: tail -f /tmp/ditto-api-pf.log"
fi

echo ""
echo "Port forwarding PIDs:"
echo "  Frontend: $FRONTEND_PID"
echo "  API: $API_PID"
echo ""
echo "To stop port forwarding:"
echo "  kill $FRONTEND_PID $API_PID"
echo ""
echo "Or run the auto-port-forward script for automatic monitoring:"
echo "  ./scripts/auto-port-forward.sh"

