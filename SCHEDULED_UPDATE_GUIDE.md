# Scheduled Data Update Guide

## Overview

The application now automatically fetches fresh data from Ditto every 30 minutes and updates the deployment with new timestamped Docker images.

## How It Works

### 1. **Scheduled Workflow** (`.github/workflows/scheduled-update.yml`)
   - Runs every 30 minutes via GitHub Actions cron
   - Can also be triggered manually

### 2. **Data Scraping**
   - Executes `scrape_ditto.py` to fetch latest data
   - Generates `ditto_insurance_data.csv`

### 3. **Change Detection**
   - Calculates SHA256 hash of the data file
   - Compares with previous hash
   - **Only builds/deploys if data changed**

### 4. **Image Building** (only if data changed)
   - Builds new Docker images with timestamp tags
   - Format: `YYYYMMDD-HHMMSS` (e.g., `20241215-143000`)
   - Tags:
     - `latest`
     - `{timestamp}` (e.g., `20241215-143000`)
     - `scheduled-{timestamp}` (e.g., `scheduled-20241215-143000`)

### 5. **Automatic Deployment** (only if data changed)
   - Uses Helm to deploy new images
   - Rolling update ensures zero downtime
   - Pods automatically restart with new data

## Image Tags

When data is updated, images are tagged with:
- **Latest**: `your-username/ditto-api:latest`
- **Timestamp**: `your-username/ditto-api:20241215-143000`
- **Scheduled**: `your-username/ditto-api:scheduled-20241215-143000`

## Workflow Behavior

### If Data Changed:
1. ✅ Scrapes new data
2. ✅ Builds new images with timestamp
3. ✅ Pushes to Docker Hub
4. ✅ Deploys via Helm
5. ✅ Verifies deployment

### If No Data Changes:
1. ✅ Scrapes data (verifies it's up to date)
2. ⏭️ Skips build (saves time/resources)
3. ⏭️ Skips deployment
4. ℹ️ Logs "No changes detected"

## Manual Trigger

You can manually trigger the update:

1. Go to **Actions** tab in GitHub
2. Select **"Scheduled Data Update (Every 30 Minutes)"**
3. Click **"Run workflow"**

## Monitoring

### Check Workflow Runs:
- Go to **Actions** tab
- View **"Scheduled Data Update"** workflow
- See execution history and logs

### Check Deployment:
```bash
# View current image tags
kubectl get deployment ditto-insurance-api -n ditto-insurance -o jsonpath='{.spec.template.spec.containers[0].image}'

# View pods
kubectl get pods -n ditto-insurance

# View recent deployments
helm history ditto-insurance -n ditto-insurance
```

## Configuration

### Schedule Frequency

To change the update frequency, edit `.github/workflows/scheduled-update.yml`:

```yaml
schedule:
  # Every 30 minutes (current)
  - cron: '*/30 * * * *'
  
  # Every hour
  - cron: '0 * * * *'
  
  # Every 15 minutes
  - cron: '*/15 * * * *'
```

### Cron Syntax:
- `*/30 * * * *` = Every 30 minutes
- `0 * * * *` = Every hour (at :00)
- `0 */2 * * *` = Every 2 hours
- `0 0 * * *` = Daily at midnight

## Requirements

1. **GitHub Secrets** (already configured):
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
   - `KUBECONFIG` (for deployment)

2. **Docker Hub Repositories**:
   - `ditto-frontend`
   - `ditto-api`

3. **Kubernetes Cluster**:
   - Accessible via `KUBECONFIG`
   - Helm chart deployed

## Troubleshooting

### Workflow not running:
- Check GitHub Actions is enabled for the repository
- Verify cron schedule syntax
- Check repository settings → Actions → Workflow permissions

### Data not updating:
- Check scraper logs in workflow run
- Verify `scrape_ditto.py` is working
- Check if data file is being generated

### Images not building:
- Verify Docker Hub credentials
- Check if data actually changed (hash comparison)
- Review build logs in workflow

### Deployment failing:
- Verify `KUBECONFIG` secret is correct
- Check Helm chart exists
- Verify cluster connectivity

## Benefits

✅ **Automatic Updates**: No manual intervention needed
✅ **Efficient**: Only builds/deploys when data changes
✅ **Traceable**: Timestamp tags for every update
✅ **Zero Downtime**: Rolling updates via Helm
✅ **Cost Effective**: Skips unnecessary builds

## Next Steps

1. Push the workflow file to GitHub
2. Wait for first scheduled run (or trigger manually)
3. Monitor workflow runs in Actions tab
4. Verify deployments are updating correctly

---

**Note**: The first run will always build/deploy since there's no previous hash to compare.
