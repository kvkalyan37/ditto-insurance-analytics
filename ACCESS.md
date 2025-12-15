# 🚀 Quick Access Guide

## Start Services (One-Time Setup)

Run this **once** and the daemon will keep port forwarding alive:

```bash
./scripts/start-daemon.sh
```

That's it! Your services will be accessible at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000

## After Deployments

After any deployment or pod restart, the daemon will **automatically** restart port forwarding. No action needed!

## Stop Services

```bash
./scripts/stop-daemon.sh
```

## View Logs

```bash
tail -f /tmp/ditto-port-forward-daemon.log
```

---

**No more page loading issues!** The daemon handles everything automatically.
