# 🚀 Quick Access Guide - Ditto Insurance Services

## Problem Solved ✅
No more port forwarding issues! After any deployment or pod restart, simply run one of these scripts.

## Quick Start (Recommended)

After deploying or making changes, run:

```bash
./scripts/quick-access.sh
```

This will:
- ✅ Kill any existing port forwards
- ✅ Start fresh port forwarding
- ✅ Verify services are accessible
- ✅ Show you the URLs

**Access your services:**
- Frontend: http://localhost:3000
- API: http://localhost:8000

## Alternative Options

### Option 1: Auto-Monitoring Port Forward (Best for Development)

```bash
./scripts/auto-port-forward.sh
```

This script:
- ✅ Automatically monitors port forwarding
- ✅ Restarts it if it fails
- ✅ Keeps running until you stop it (Ctrl+C)
- ✅ Perfect for long development sessions

### Option 2: Smart Service Starter

```bash
./scripts/start-services.sh
```

This script:
- ✅ Detects your cluster type (kind, minikube, etc.)
- ✅ Chooses the best access method
- ✅ Sets up NodePort services if needed

## After Deployment

**Every time you deploy or restart pods, just run:**

```bash
./scripts/quick-access.sh
```

That's it! No more manual port forwarding commands.

## Troubleshooting

### Services not accessible?

1. **Check if pods are running:**
   ```bash
   kubectl get pods -n ditto-insurance
   ```

2. **Check port forwarding logs:**
   ```bash
   tail -f /tmp/ditto-frontend-pf.log
   tail -f /tmp/ditto-api-pf.log
   ```

3. **Restart port forwarding:**
   ```bash
   ./scripts/quick-access.sh
   ```

### Port forwarding keeps stopping?

Use the auto-monitoring script:
```bash
./scripts/auto-port-forward.sh
```

This will automatically restart port forwarding if it fails.

## Scripts Overview

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `quick-access.sh` | Quick port forward setup | After deployments, quick access |
| `auto-port-forward.sh` | Auto-monitoring port forward | Long development sessions |
| `start-services.sh` | Smart service starter | First time setup, different clusters |
| `setup-nodeport-services.sh` | Create NodePort services | For non-kind clusters |

## Current Access URLs

After running `quick-access.sh`:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000/health

---

**💡 Tip:** Add `./scripts/quick-access.sh` to your deployment script or run it manually after each `kubectl rollout restart`.

