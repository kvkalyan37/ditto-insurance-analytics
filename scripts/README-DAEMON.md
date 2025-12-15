# 🔄 Persistent Port Forwarding Daemon

## Problem Solved ✅
**No more page loading issues!** The daemon automatically keeps port forwarding alive in the background.

## Quick Start

### Start the Daemon (Recommended)
```bash
./scripts/start-daemon.sh
```

This will:
- ✅ Start port forwarding in the background
- ✅ Automatically restart it if it fails
- ✅ Keep running until you stop it
- ✅ Work even after pod restarts or deployments

### Stop the Daemon
```bash
./scripts/stop-daemon.sh
```

## How It Works

The daemon:
1. **Monitors** port forwarding every 5 seconds
2. **Detects** when port forwarding fails
3. **Automatically restarts** it
4. **Logs** all activities to `/tmp/ditto-port-forward-daemon.log`

## Access Your Services

After starting the daemon:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000

## Monitoring

### View Daemon Logs
```bash
tail -f /tmp/ditto-port-forward-daemon.log
```

### Check if Daemon is Running
```bash
ps aux | grep keep-alive-port-forward
```

### Check Port Forwarding Status
```bash
ps aux | grep "kubectl port-forward"
```

## Auto-Start on System Boot (Optional)

To start the daemon automatically when you log in:

1. **macOS (using launchd):**
   ```bash
   # Create launch agent
   cat > ~/Library/LaunchAgents/com.ditto.portforward.plist <<EOF
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.ditto.portforward</string>
       <key>ProgramArguments</key>
       <array>
           <string>$(pwd)/scripts/start-daemon.sh</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <true/>
   </dict>
   </plist>
   EOF
   
   # Load it
   launchctl load ~/Library/LaunchAgents/com.ditto.portforward.plist
   ```

2. **Linux (using systemd):**
   ```bash
   # Create systemd service (requires sudo)
   sudo tee /etc/systemd/system/ditto-portforward.service <<EOF
   [Unit]
   Description=Ditto Insurance Port Forwarding Daemon
   After=network.target
   
   [Service]
   Type=simple
   User=$USER
   WorkingDirectory=$(pwd)
   ExecStart=$(pwd)/scripts/keep-alive-port-forward.sh
   Restart=always
   RestartSec=5
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   # Enable and start
   sudo systemctl enable ditto-portforward
   sudo systemctl start ditto-portforward
   ```

## Troubleshooting

### Daemon not starting?
1. Check if kubectl is working: `kubectl get pods -n ditto-insurance`
2. Check daemon logs: `tail -f /tmp/ditto-port-forward-daemon.log`
3. Check if ports are already in use: `lsof -i :3000 -i :8000`

### Port forwarding still failing?
1. Check pod status: `kubectl get pods -n ditto-insurance`
2. Check service status: `kubectl get svc -n ditto-insurance`
3. Restart daemon: `./scripts/stop-daemon.sh && ./scripts/start-daemon.sh`

### Need to manually restart?
```bash
./scripts/stop-daemon.sh
./scripts/start-daemon.sh
```

## Benefits

✅ **No more manual port forwarding**  
✅ **Automatic recovery** from failures  
✅ **Persistent** across pod restarts  
✅ **Background operation** - doesn't block your terminal  
✅ **Logging** for troubleshooting  

---

**💡 Tip:** Run `./scripts/start-daemon.sh` once, and forget about port forwarding issues!

