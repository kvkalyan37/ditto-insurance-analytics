# 🌐 Free Internet-Accessible Hosting Guide

## 🎯 Goal
Host your application on the internet for free, accessible from anywhere, using GitHub Actions for CI/CD.

## ⚠️ Important Note
**GitHub Actions runners are ephemeral** - they're destroyed after workflows complete. You cannot run a persistent application directly in GitHub Actions.

## ✅ Solution: Free Cloud Hosting Options

You have **3 excellent free options**:

---

## Option 1: Railway.app (Recommended - Easiest) ⭐

**Why Railway?**
- ✅ **Free tier**: $5 credit/month (enough for small apps)
- ✅ **Automatic deployments** from Docker Hub
- ✅ **Public URL** (e.g., `yourapp.railway.app`)
- ✅ **Zero configuration** - just connect Docker Hub
- ✅ **Works with your existing Docker images**

### Setup Steps:

1. **Sign up**: https://railway.app (use GitHub login)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from Docker Hub"

3. **Connect Docker Hub**:
   - Repository: `YOUR_USERNAME/ditto-frontend`
   - Tag: `latest` (or use timestamp tags)
   - Click "Deploy"

4. **Repeat for API**:
   - Create another service
   - Repository: `YOUR_USERNAME/ditto-api`
   - Add environment variable: `DATA_FILE=/app/data/ditto_insurance_data.csv`

5. **Add Data Volume** (for API):
   - Go to API service → Settings → Volumes
   - Mount path: `/app/data`
   - This stores your CSV file

6. **Generate Public URL**:
   - Go to Frontend service → Settings → Generate Domain
   - You'll get: `ditto-frontend-production.up.railway.app`

7. **Update GitHub Actions** (Optional):
   - Add Railway deployment step to `ci-cd.yml`
   - Or manually trigger deployments from Railway dashboard

**Cost**: Free tier covers small applications!

---

## Option 2: Render.com (Free Tier)

**Why Render?**
- ✅ **Free tier**: 750 hours/month
- ✅ **Automatic deployments** from Docker Hub
- ✅ **Public URL** (e.g., `yourapp.onrender.com`)
- ✅ **Free PostgreSQL** (if needed later)

### Setup Steps:

1. **Sign up**: https://render.com (use GitHub login)

2. **Create Web Service** (Frontend):
   - New → Web Service
   - Connect Docker Hub
   - Repository: `YOUR_USERNAME/ditto-frontend:latest`
   - Instance Type: **Free**
   - Click "Create Web Service"

3. **Create Web Service** (API):
   - New → Web Service
   - Repository: `YOUR_USERNAME/ditto-api:latest`
   - Instance Type: **Free**
   - Add Environment Variable: `DATA_FILE=/app/data/ditto_insurance_data.csv`
   - Add Disk: Mount at `/app/data` (for CSV storage)

4. **Get Public URLs**:
   - Each service gets: `yourapp.onrender.com`
   - Update frontend to point to API URL

**Note**: Free tier services spin down after 15 minutes of inactivity (first request takes ~30 seconds to wake up).

---

## Option 3: Fly.io (Free Tier)

**Why Fly.io?**
- ✅ **Free tier**: 3 shared VMs
- ✅ **Global edge network** (fast worldwide)
- ✅ **Persistent volumes** for data
- ✅ **Public URL** (e.g., `yourapp.fly.dev`)

### Setup Steps:

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up**: https://fly.io (use GitHub login)

3. **Create App** (Frontend):
   ```bash
   fly launch --name ditto-frontend --image YOUR_USERNAME/ditto-frontend:latest
   ```

4. **Create App** (API):
   ```bash
   fly launch --name ditto-api --image YOUR_USERNAME/ditto-api:latest
   fly volumes create data --size 1 --app ditto-api
   ```

5. **Get Public URLs**:
   - `ditto-frontend.fly.dev`
   - `ditto-api.fly.dev`

---

## Option 4: Google Cloud Run (Free Tier) ⭐ Best for Kubernetes-like

**Why Cloud Run?**
- ✅ **Free tier**: 2 million requests/month
- ✅ **Serverless** - pay only for usage
- ✅ **Automatic scaling**
- ✅ **Public HTTPS URL**
- ✅ **Works with Docker images**

### Setup Steps:

1. **Sign up**: https://cloud.google.com (Free $300 credit for 90 days)

2. **Install gcloud CLI**:
   ```bash
   brew install google-cloud-sdk  # macOS
   gcloud init
   ```

3. **Deploy Frontend**:
   ```bash
   gcloud run deploy ditto-frontend \
     --image YOUR_USERNAME/ditto-frontend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. **Deploy API**:
   ```bash
   gcloud run deploy ditto-api \
     --image YOUR_USERNAME/ditto-api:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars DATA_FILE=/app/data/ditto_insurance_data.csv
   ```

5. **Get Public URLs**:
   - `ditto-frontend-xxx.run.app`
   - `ditto-api-xxx.run.app`

---

## 🚀 Recommended: Railway.app Setup (Step-by-Step)

### Step 1: Sign Up
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway

### Step 2: Deploy API Service

1. **New Project** → "Deploy from Docker Hub"
2. **Repository**: `YOUR_USERNAME/ditto-api`
3. **Tag**: `latest` (or your timestamp tag)
4. **Service Name**: `ditto-api`
5. Click **Deploy**

6. **Add Environment Variables**:
   - Go to API service → Variables
   - Add: `DATA_FILE=/app/data/ditto_insurance_data.csv`

7. **Add Volume** (for data storage):
   - Go to API service → Settings → Volumes
   - Click "Add Volume"
   - Mount path: `/app/data`
   - Size: 1GB

8. **Generate Public URL**:
   - Go to API service → Settings → Generate Domain
   - Copy the URL (e.g., `ditto-api-production.up.railway.app`)

### Step 3: Deploy Frontend Service

1. **Add Service** → "Deploy from Docker Hub"
2. **Repository**: `YOUR_USERNAME/ditto-frontend`
3. **Tag**: `latest`
4. **Service Name**: `ditto-frontend`
5. Click **Deploy**

6. **Add Environment Variable**:
   - Go to Frontend service → Variables
   - Add: `API_BASE_URL=https://ditto-api-production.up.railway.app`
   - (Use the API URL from Step 2)

7. **Generate Public URL**:
   - Go to Frontend service → Settings → Generate Domain
   - Copy the URL (e.g., `ditto-frontend-production.up.railway.app`)

### Step 4: Upload Initial Data

1. **Generate data file locally**:
   ```bash
   python scrape_ditto.py --output data/ditto_insurance_data.csv
   ```

2. **Upload to Railway**:
   - Go to API service → Data → Volumes
   - Click "Upload Files"
   - Upload `ditto_insurance_data.csv` to `/app/data/`

### Step 5: Access Your Application

- **Frontend URL**: `https://ditto-frontend-production.up.railway.app`
- **API URL**: `https://ditto-api-production.up.railway.app`

**That's it!** Your app is now accessible from anywhere! 🎉

---

## 🔄 Auto-Deploy from GitHub Actions

### Option A: Railway Auto-Deploy

1. **Connect GitHub** (in Railway):
   - Project → Settings → Connect GitHub
   - Select your repository

2. **Enable Auto-Deploy**:
   - Service → Settings → Source
   - Enable "Auto Deploy"
   - Railway watches Docker Hub for new images

3. **Update GitHub Actions**:
   - After pushing images to Docker Hub, Railway automatically deploys!

### Option B: Add Deployment Step to GitHub Actions

Add this to your `ci-cd.yml` after image push:

```yaml
- name: Deploy to Railway
  uses: bervProject/railway-deploy@v3.0.0
  with:
    railway_token: ${{ secrets.RAILWAY_TOKEN }}
    service: ditto-frontend
    # Railway will pull latest image from Docker Hub
```

---

## 📊 Comparison Table

| Service | Free Tier | Auto-Deploy | Ease | Best For |
|---------|-----------|-------------|------|----------|
| **Railway** | $5/month credit | ✅ Yes | ⭐⭐⭐⭐⭐ | Easiest setup |
| **Render** | 750 hrs/month | ✅ Yes | ⭐⭐⭐⭐ | Simple apps |
| **Fly.io** | 3 VMs | ✅ Yes | ⭐⭐⭐ | Global edge |
| **Cloud Run** | 2M requests | ✅ Yes | ⭐⭐⭐ | Serverless |

---

## 🎯 My Recommendation

**Start with Railway.app** because:
1. ✅ Easiest setup (5 minutes)
2. ✅ Automatic deployments from Docker Hub
3. ✅ Free tier covers your needs
4. ✅ Public HTTPS URLs
5. ✅ Persistent volumes for data
6. ✅ No credit card required (for free tier)

---

## 🚀 Quick Start (Railway - 5 Minutes)

1. Sign up: https://railway.app
2. New Project → Deploy from Docker Hub
3. Connect: `YOUR_USERNAME/ditto-api:latest`
4. Add volume: `/app/data`
5. Generate domain
6. Repeat for frontend
7. Upload data file
8. Done! 🎉

---

## 📝 Next Steps After Deployment

1. **Test your application**: Visit the public URL
2. **Set up auto-deploy**: Connect GitHub to Railway
3. **Update scheduled-update workflow**: 
   - After scraping, Railway auto-deploys new images
4. **Monitor**: Check Railway dashboard for logs/status

---

## 🆘 Troubleshooting

**Application not accessible?**
- Check Railway/Render service status
- Verify environment variables
- Check logs in service dashboard

**API shows "No Data"?**
- Upload `ditto_insurance_data.csv` to volume
- Verify volume mount path
- Check API logs

**Frontend can't connect to API?**
- Verify `API_BASE_URL` environment variable
- Check API service is running
- Test API URL directly in browser

---

**Need help?** Each service has excellent documentation and support!

