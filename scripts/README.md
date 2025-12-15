# Ditto Insurance Service Access Scripts

This directory contains scripts to easily access Ditto Insurance services without port forwarding issues.

## Quick Start

### Option 1: NodePort Services (Recommended - No Port Forwarding Needed)

```bash
./scripts/start-services.sh
```

This will:
- Set up NodePort services (if not already created)
- Display the URLs to access your services
- **No port forwarding needed!**

### Option 2: Auto-Restarting Port Forwarding

If you prefer port forwarding or NodePort doesn't work:

```bash
./scripts/auto-port-forward.sh
```

This script:
- Automatically monitors port forwarding
- Restarts it if it fails
- Keeps services accessible at:
  - Frontend: http://localhost:3000
  - API: http://localhost:8000

## Access URLs

### Using NodePort (After running setup-nodeport-services.sh)

Get the ports:
```bash
kubectl get svc -n ditto-insurance | grep nodeport
```

For **kind** clusters, you may need to use the node IP:
```bash
# Get node IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')

# Access services
echo "Frontend: http://$NODE_IP:$(kubectl get svc ditto-insurance-frontend-nodeport -n ditto-insurance -o jsonpath='{.spec.ports[0].nodePort}')"
echo "API: http://$NODE_IP:$(kubectl get svc ditto-insurance-api-nodeport -n ditto-insurance -o jsonpath='{.spec.ports[0].nodePort}')"
```

### Using Port Forwarding

After running `auto-port-forward.sh`:
- Frontend: http://localhost:3000
- API: http://localhost:8000

## Scripts

### `start-services.sh`
Main entry point - automatically chooses the best method and sets up services.

### `setup-nodeport-services.sh`
Creates NodePort services for both frontend and API. These services persist and don't require port forwarding.

### `auto-port-forward.sh`
Monitors and auto-restarts port forwarding. Useful if NodePort doesn't work in your environment.

## Troubleshooting

### Port forwarding keeps stopping
- Use NodePort services instead: `./scripts/setup-nodeport-services.sh`
- Or use the auto-port-forward script: `./scripts/auto-port-forward.sh`

### Can't access NodePort services
- For kind clusters, use the node IP instead of localhost
- Check if services are running: `kubectl get svc -n ditto-insurance`
- Check if pods are ready: `kubectl get pods -n ditto-insurance`

### Services not responding
- Check pod status: `kubectl get pods -n ditto-insurance`
- Check service endpoints: `kubectl get endpoints -n ditto-insurance`
- View logs: `kubectl logs -n ditto-insurance -l app.kubernetes.io/component=frontend`

