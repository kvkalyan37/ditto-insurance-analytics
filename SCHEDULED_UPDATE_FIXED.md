# ✅ Scheduled Data Update - Fixed and Ready

## 🎯 What Was Fixed

### 1. Hash Persistence ✅
**Problem**: Hash comparison was using local file that didn't persist between workflow runs.

**Solution**: 
- Uses GitHub Actions cache to persist hash between runs
- Hash is stored with key: `ditto-data-hash-{branch}`
- Automatically restored on each run

### 2. Removed Kubernetes Deployment ✅
**Problem**: Workflow tried to deploy to Kubernetes (which you don't have).

**Solution**:
- Removed all kubectl/Helm deployment steps
- Workflow now only builds and pushes images
- Images are ready for deployment to Railway, Render, etc.

### 3. Data Artifact ✅
**Problem**: No way to access the generated CSV file.

**Solution**:
- Uploads CSV as GitHub Actions artifact
- Available for download for 7 days
- Useful for debugging or manual uploads

### 4. Better Notifications ✅
**Problem**: Unclear what happened in each run.

**Solution**:
- Clear summary in workflow run
- Shows records scraped, hash, image tags
- Provides next steps for deployment

---

## 📋 How It Works Now

### Every 30 Minutes:

1. **Scrape Data**:
   - Runs `scrape_ditto.py`
   - Fetches latest data from joinditto.in
   - Generates `ditto_insurance_data.csv`

2. **Check for Changes**:
   - Calculates SHA256 hash of CSV
   - Compares with previous hash (from cache)
   - If same → Skip build
   - If different → Build new images

3. **Build Images** (if data changed):
   - Copies CSV to `api_service/data/`
   - Builds API image with embedded data
   - Builds Frontend image
   - Tags with timestamp: `YYYYMMDD-HHMMSS`
   - Pushes to Docker Hub

4. **Upload Artifact**:
   - Saves CSV as artifact
   - Available for 7 days

5. **Summary**:
   - Shows what happened
   - Provides image tags
   - Suggests next steps

---

## 🔍 Workflow Schedule

```yaml
schedule:
  - cron: '*/30 * * * *'  # Every 30 minutes
```

**Runs at:**
- :00 and :30 of every hour
- Example: 10:00, 10:30, 11:00, 11:30, etc.

**Also runs:**
- On manual trigger (workflow_dispatch)
- Go to Actions → "Scheduled Data Update" → "Run workflow"

---

## 📊 What Gets Generated

### Data File
- **Location**: `ditto_insurance_data.csv`
- **Format**: CSV with columns:
  - Company
  - Policy Name
  - Rating By Ditto
  - Plan URL
  - Last Updated

### Docker Images
- **Frontend**: `YOUR_USERNAME/ditto-frontend:20251215-143000`
- **API**: `YOUR_USERNAME/ditto-api:20251215-143000` (includes CSV data)

---

## 🚀 How to Use the Updated Images

### Option 1: Manual Deployment
After images are built, deploy manually:

```bash
# Pull latest images
docker pull YOUR_USERNAME/ditto-api:20251215-143000
docker pull YOUR_USERNAME/ditto-frontend:20251215-143000

# Deploy to your platform
# (Railway, Render, Fly.io, etc.)
```

### Option 2: Auto-Deploy (Recommended)
Configure your hosting platform to:
- Watch Docker Hub for new tags
- Auto-deploy when new images are pushed
- Railway, Render, Fly.io all support this

### Option 3: Use Latest Tag
Update your deployment to always use `latest`:
- But this requires updating the workflow to also tag as `latest`
- Or use timestamp tags and update deployment config

---

## 🔧 Configuration

### Change Schedule
Edit `.github/workflows/scheduled-update.yml`:

```yaml
schedule:
  - cron: '*/30 * * * *'  # Every 30 minutes
  # - cron: '0 * * * *'   # Every hour
  # - cron: '0 */6 * * *' # Every 6 hours
  # - cron: '0 0 * * *'   # Daily at midnight
```

### Manual Trigger
1. Go to: `https://github.com/YOUR_USERNAME/ditto-insurance/actions`
2. Select: "Scheduled Data Update (Every 30 Minutes)"
3. Click: "Run workflow" → "Run workflow"

---

## 📈 Monitoring

### Check Workflow Runs
1. Go to: `https://github.com/YOUR_USERNAME/ditto-insurance/actions`
2. Look for: "Scheduled Data Update"
3. Click on a run to see:
   - Records scraped
   - Data hash
   - Whether images were built
   - Image tags

### Check Docker Hub
1. Go to: `https://hub.docker.com/r/YOUR_USERNAME/ditto-api/tags`
2. See new timestamp tags appear every 30 minutes (if data changed)

---

## 🐛 Troubleshooting

### Workflow Not Running
- **Check**: Repository Settings → Actions → General
- **Enable**: "Allow all actions and reusable workflows"
- **Check**: Workflow file is in `.github/workflows/`

### No Data Changes Detected
- **Normal**: If Ditto website hasn't updated
- **Check**: Workflow logs to see hash comparison
- **Manual**: Trigger workflow to test

### Images Not Building
- **Check**: Docker Hub secrets are correct
- **Check**: Repository names match exactly
- **Check**: Workflow logs for errors

### Data File Empty
- **Check**: Scraper logs in workflow
- **Check**: Ditto website is accessible
- **Test**: Run scraper locally to verify

---

## ✅ Verification Checklist

- [ ] Workflow runs every 30 minutes
- [ ] Data is scraped successfully
- [ ] Hash comparison works (cache persists)
- [ ] Images build when data changes
- [ ] Images push to Docker Hub
- [ ] Artifacts are uploaded
- [ ] Summary shows correct information

---

## 🎯 Next Steps

1. **Test the workflow**:
   - Manually trigger it
   - Check if it runs successfully
   - Verify images are pushed

2. **Set up hosting**:
   - Choose platform (Railway, Render, etc.)
   - Configure auto-deploy from Docker Hub
   - Deploy your application

3. **Monitor**:
   - Check workflow runs regularly
   - Verify data updates
   - Test your deployed application

---

**Your scheduled data update is now fixed and ready!** 🎉

The workflow will automatically:
- ✅ Scrape data every 30 minutes
- ✅ Detect changes
- ✅ Build new images with updated data
- ✅ Push to Docker Hub
- ✅ Ready for deployment

