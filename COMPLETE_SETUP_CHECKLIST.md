# Complete Setup Checklist - GitHub Actions + Docker Hub

This guide lists everything you need to host the Ditto Insurance application using GitHub Actions and Docker Hub.

---

## 📋 Prerequisites Checklist

### ✅ 1. GitHub Account & Repository

**Required:**
- [ ] **GitHub Account** (Free)
  - Sign up at: https://github.com/signup
  - Or use existing account

- [ ] **GitHub Repository** (Public or Private)
  - Create new repository: https://github.com/new
  - Repository name: `ditto-insurance` (or your choice)
  - Visibility: **Public** (recommended for unlimited Actions minutes) or **Private**
  - Initialize with README: Optional
  - Add .gitignore: Python (if creating new repo)

**Actions Required:**
```bash
# If repository already exists locally
cd /Users/c27979e/Downloads/Cursor_Projects
git init  # if not already a git repo
git remote add origin https://github.com/YOUR_USERNAME/ditto-insurance.git
git add .
git commit -m "Initial commit: Ditto Insurance Analytics"
git push -u origin main
```

---

### ✅ 2. Docker Hub Account & Repositories

**Required:**
- [ ] **Docker Hub Account** (Free)
  - Sign up at: https://hub.docker.com/signup
  - Or use existing account
  - Verify email address

- [ ] **Create Docker Hub Repositories** (2 repositories)
  
  **Repository 1: Frontend**
  - Go to: https://hub.docker.com/repository/create
  - Repository name: `ditto-frontend`
  - Visibility: **Public** (recommended - unlimited)
  - Description: "Ditto Insurance Analytics Frontend"
  - Click **Create**

  **Repository 2: API**
  - Go to: https://hub.docker.com/repository/create
  - Repository name: `ditto-api`
  - Visibility: **Public** (recommended - unlimited)
  - Description: "Ditto Insurance Analytics API"
  - Click **Create**

**Your Docker Hub repositories will be:**
- `YOUR_USERNAME/ditto-frontend`
- `YOUR_USERNAME/ditto-api`

---

### ✅ 3. Docker Hub Access Token

**Required:**
- [ ] **Create Docker Hub Access Token**
  - Go to: https://hub.docker.com/settings/security
  - Click **New Access Token**
  - Token name: `github-actions-ditto` (or any name)
  - Permissions: **Read & Write** (or **Read, Write & Delete**)
  - Click **Generate**
  - **⚠️ IMPORTANT: Copy the token immediately** (you won't see it again!)
  - Save it securely (you'll need it for GitHub Secrets)

**Token Format:**
```
dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### ✅ 4. GitHub Secrets Configuration

**Required:**
- [ ] **Add GitHub Secrets**
  - Go to your GitHub repository
  - Navigate to: **Settings** → **Secrets and variables** → **Actions**
  - Click **New repository secret**

  **Secret 1: DOCKERHUB_USERNAME**
  - Name: `DOCKERHUB_USERNAME`
  - Value: Your Docker Hub username (e.g., `johndoe`)
  - Click **Add secret**

  **Secret 2: DOCKERHUB_TOKEN**
  - Name: `DOCKERHUB_TOKEN`
  - Value: Your Docker Hub access token (from step 3)
  - Click **Add secret**

  **Secret 3: KUBECONFIG** (Only if using `ci-cd.yml` or `scheduled-update.yml`)
  - Name: `KUBECONFIG`
  - Value: Base64 encoded kubeconfig (see below)
  - Click **Add secret**

**How to get KUBECONFIG:**
```bash
# If you have kubectl configured locally
cat ~/.kube/config | base64 -w 0

# On macOS (if base64 doesn't support -w flag)
cat ~/.kube/config | base64

# Copy the entire output and paste as KUBECONFIG secret value
```

**Note:** If you're only using `dockerhub-push.yml` (build/push only), you don't need `KUBECONFIG`.

---

### ✅ 5. Enable GitHub Actions

**Required:**
- [ ] **Verify GitHub Actions is Enabled**
  - Go to: **Settings** → **Actions** → **General**
  - Under **Workflow permissions**, select:
    - ✅ **Read and write permissions**
    - ✅ **Allow GitHub Actions to create and approve pull requests**
  - Click **Save**

---

### ✅ 6. Kubernetes Cluster (For Deployment)

**Required (if deploying automatically):**
- [ ] **Kubernetes Cluster Access**
  
  **Option A: Local Cluster (Kind/Minikube)**
  - Install Kind: `brew install kind` (macOS)
  - Or install Minikube
  - Create cluster and get kubeconfig

  **Option B: Cloud Cluster**
  - Google Cloud (GKE) - Free tier available
  - AWS (EKS)
  - Azure (AKS)
  - DigitalOcean Kubernetes
  - Get kubeconfig from your provider

  **Option C: Skip Auto-Deployment**
  - Use only `dockerhub-push.yml` workflow
  - Manually deploy images after they're pushed
  - No KUBECONFIG secret needed

---

## 📦 What Gets Pushed to GitHub

### Repository Structure:
```
ditto-insurance/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml                    # Full CI/CD pipeline
│       ├── dockerhub-push.yml           # Build & push only
│       ├── deploy-kind.yml              # Test with Kind
│       └── scheduled-update.yml         # Auto-update every 30 min
├── api_service/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── nginx.conf
├── helm/
│   └── ditto-insurance/
│       ├── values.yaml
│       └── templates/ (Helm templates)
├── scrape_ditto.py
├── requirements_scraper.txt
├── CI_CD_SETUP.md
├── SCHEDULED_UPDATE_GUIDE.md
└── README.md
```

---

## 🚀 Setup Steps Summary

### Step 1: Create Accounts (5 minutes)
- [ ] GitHub account
- [ ] Docker Hub account

### Step 2: Create Repositories (5 minutes)
- [ ] GitHub repository
- [ ] Docker Hub: `ditto-frontend`
- [ ] Docker Hub: `ditto-api`

### Step 3: Configure Secrets (5 minutes)
- [ ] Docker Hub access token
- [ ] GitHub secret: `DOCKERHUB_USERNAME`
- [ ] GitHub secret: `DOCKERHUB_TOKEN`
- [ ] GitHub secret: `KUBECONFIG` (if deploying)

### Step 4: Push Code (2 minutes)
```bash
cd /Users/c27979e/Downloads/Cursor_Projects
git init  # if not already initialized
git add .
git commit -m "Initial commit: Ditto Insurance Analytics with CI/CD"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ditto-insurance.git
git push -u origin main
```

### Step 5: Verify (2 minutes)
- [ ] Check GitHub Actions tab - workflows should appear
- [ ] Check Docker Hub - images should start building
- [ ] Monitor first workflow run

---

## 🎯 Workflow Selection Guide

### Option 1: Build & Push Only (Simplest)
**Use:** `dockerhub-push.yml`
- ✅ Builds and pushes images
- ✅ No Kubernetes needed
- ✅ No KUBECONFIG secret needed
- ⚠️ Manual deployment required

**Best for:** Testing, development, or manual deployments

### Option 2: Full CI/CD (Recommended)
**Use:** `ci-cd.yml`
- ✅ Builds, pushes, AND deploys
- ✅ Automatic deployment
- ⚠️ Requires KUBECONFIG secret
- ⚠️ Requires Kubernetes cluster

**Best for:** Production with automatic deployments

### Option 3: Scheduled Updates
**Use:** `scheduled-update.yml`
- ✅ Auto-updates every 30 minutes
- ✅ Only builds when data changes
- ⚠️ Requires KUBECONFIG secret
- ⚠️ Requires Kubernetes cluster

**Best for:** Production with automatic data updates

---

## 📊 Free Tier Limits

### GitHub Actions
- **Public Repositories**: ✅ Unlimited minutes
- **Private Repositories**: ⚠️ 2,000 minutes/month
- **Storage**: 500 MB

### Docker Hub
- **Public Repositories**: ✅ Unlimited
- **Private Repositories**: ⚠️ 1 free private repo
- **Pulls**: ✅ Unlimited for public repos
- **Builds**: ✅ Unlimited

**Recommendation:** Use **public repositories** for unlimited free usage!

---

## ✅ Verification Checklist

After setup, verify:

- [ ] GitHub repository created and code pushed
- [ ] Docker Hub repositories created (`ditto-frontend`, `ditto-api`)
- [ ] GitHub secrets configured (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)
- [ ] GitHub Actions enabled in repository settings
- [ ] First workflow run completed successfully
- [ ] Docker images visible in Docker Hub
- [ ] (If deploying) KUBECONFIG secret configured
- [ ] (If deploying) Helm deployment successful

---

## 🔍 Quick Verification Commands

### Check GitHub:
```bash
# View repository
https://github.com/YOUR_USERNAME/ditto-insurance

# Check Actions tab
https://github.com/YOUR_USERNAME/ditto-insurance/actions
```

### Check Docker Hub:
```bash
# View repositories
https://hub.docker.com/r/YOUR_USERNAME/ditto-frontend
https://hub.docker.com/r/YOUR_USERNAME/ditto-api
```

### Check Workflow Status:
- Go to: **GitHub Repo → Actions tab**
- View workflow runs and logs

---

## 🆘 Troubleshooting

### Workflow not running?
- Check GitHub Actions is enabled
- Verify secrets are set correctly
- Check workflow file syntax

### Images not pushing?
- Verify Docker Hub credentials
- Check repository names match exactly
- Review workflow logs

### Deployment failing?
- Verify KUBECONFIG secret is correct
- Check Kubernetes cluster connectivity
- Review Helm chart configuration

---

## 📝 Quick Reference

### GitHub Secrets Needed:
1. `DOCKERHUB_USERNAME` - Your Docker Hub username
2. `DOCKERHUB_TOKEN` - Docker Hub access token
3. `KUBECONFIG` - Base64 encoded kubeconfig (optional)

### Docker Hub Repositories:
1. `YOUR_USERNAME/ditto-frontend`
2. `YOUR_USERNAME/ditto-api`

### Workflow Files:
1. `dockerhub-push.yml` - Build & push (simplest)
2. `ci-cd.yml` - Full pipeline (requires KUBECONFIG)
3. `scheduled-update.yml` - Auto-update (requires KUBECONFIG)

---

## 🎉 You're Ready!

Once you complete this checklist, your application will:
- ✅ Automatically build on every push
- ✅ Push images to Docker Hub
- ✅ Deploy to Kubernetes (if configured)
- ✅ Auto-update every 30 minutes (if scheduled workflow enabled)

**Total Setup Time:** ~20 minutes

---

**Need Help?**
- See `CI_CD_SETUP.md` for detailed guide
- See `SCHEDULED_UPDATE_GUIDE.md` for scheduled updates
- Check workflow logs in GitHub Actions tab

