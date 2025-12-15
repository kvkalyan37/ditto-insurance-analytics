#!/bin/bash
# Quick start script for Ditto Insurance services
# This script provides easy access to start services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE="ditto-insurance"

echo "🚀 Ditto Insurance Service Starter"
echo "=================================="
echo ""

# Check if we're using kind
if kubectl config current-context | grep -q "kind"; then
    echo "📦 Detected kind cluster - using auto-port-forward (recommended for kind)"
    echo ""
    "$SCRIPT_DIR/auto-port-forward.sh"
else
    # Check if services are running
    if ! kubectl get svc -n $NAMESPACE ditto-insurance-frontend-nodeport &>/dev/null; then
        echo "📦 Setting up NodePort services (no port forwarding needed)..."
        "$SCRIPT_DIR/setup-nodeport-services.sh"
        echo ""
    fi

    # Get NodePort ports
    FRONTEND_NODEPORT=$(kubectl get svc ditto-insurance-frontend-nodeport -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
    API_NODEPORT=$(kubectl get svc ditto-insurance-api-nodeport -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)

    if [ -n "$FRONTEND_NODEPORT" ] && [ -n "$API_NODEPORT" ]; then
        echo "✅ Services are accessible via NodePort:"
        echo "   Frontend: http://localhost:$FRONTEND_NODEPORT"
        echo "   API: http://localhost:$API_NODEPORT/health"
        echo ""
        echo "No port forwarding needed! 🎉"
    else
        echo "⚠️  NodePort services not found. Starting auto-port-forward instead..."
        echo ""
        "$SCRIPT_DIR/auto-port-forward.sh"
    fi
fi

