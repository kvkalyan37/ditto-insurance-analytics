#!/bin/bash
# Setup NodePort services to avoid port forwarding issues
# This creates NodePort services that are accessible without port forwarding

NAMESPACE="ditto-insurance"

echo "Setting up NodePort services for Ditto Insurance..."
echo ""

# Create NodePort service for Frontend
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: ditto-insurance-frontend-nodeport
  namespace: $NAMESPACE
  labels:
    app: ditto-insurance
    component: frontend
spec:
  type: NodePort
  selector:
    app.kubernetes.io/name: ditto-insurance
    app.kubernetes.io/component: frontend
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
      name: http
EOF

# Create NodePort service for API
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: ditto-insurance-api-nodeport
  namespace: $NAMESPACE
  labels:
    app: ditto-insurance
    component: api
spec:
  type: NodePort
  selector:
    app.kubernetes.io/name: ditto-insurance
    app.kubernetes.io/component: api
  ports:
    - port: 8000
      targetPort: 8000
      protocol: TCP
      name: http
EOF

# Get NodePort ports
echo "Waiting for services to be created..."
sleep 3

FRONTEND_NODEPORT=$(kubectl get svc ditto-insurance-frontend-nodeport -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')
API_NODEPORT=$(kubectl get svc ditto-insurance-api-nodeport -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')

echo ""
echo "✅ NodePort services created!"
echo ""
echo "Access your services at:"
echo "  Frontend: http://localhost:$FRONTEND_NODEPORT"
echo "  API: http://localhost:$API_NODEPORT/health"
echo ""
echo "Note: If using kind, you may need to use the node IP instead of localhost"
echo "Get node IP with: kubectl get nodes -o wide"

