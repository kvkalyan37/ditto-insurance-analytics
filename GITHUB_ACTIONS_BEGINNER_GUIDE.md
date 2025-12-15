# GitHub Actions Beginner's Guide - Step by Step

## 🎯 What is GitHub Actions?

GitHub Actions is a **free** CI/CD (Continuous Integration/Continuous Deployment) service built into GitHub. It automatically:
- Builds your code when you push changes
- Tests your application
- Creates Docker images
- Pushes images to Docker Hub
- Deploys to servers (optional)

**Think of it as:** An automated assistant that builds and deploys your app every time you push code to GitHub.

---

## 📋 Prerequisites (What You Need)

### 1. GitHub Account (Free)
- Sign up at: https://github.com/signup
- It's completely free for public repositories

### 2. Docker Hub Account (Free)
- Sign up at: https://hub.docker.com/signup
- Also free for public repositories

### 3. Your Code (Already Done!)
- ✅ Your project is ready
- ✅ Workflow files are created
- ✅ Everything is configured

---

## 🚀 Step-by-Step Setup (15 Minutes)

### Step 1: Create GitHub Repository (5 min)

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `ditto-insurance` (or any name you like)
3. **Visibility**: 
   - ✅ **Public** (recommended - unlimited free Actions minutes)
   - OR Private (2,000 minutes/month free)
4. **DO NOT** check "Initialize with README" (you already have code)
5. Click **"Create repository"**

### Step 2: Push Your Code to GitHub (3 min)

Open terminal in your project directory and run:

```bash
# Navigate to your project
cd /Users/c27979e/Downloads/Cursor_Projects

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Ditto Insurance Analytics"

# Add GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ditto-insurance.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

### Step 3: Create Docker Hub Repositories (3 min)

1. **Go to Docker Hub**: https://hub.docker.com/repository/create
2. **Create First Repository**:
   - Name: `ditto-frontend`
   - Visibility: **Public**
   - Click **"Create"**
3. **Create Second Repository**:
   - Name: `ditto-api`
   - Visibility: **Public**
   - Click **"Create"**

### Step 4: Get Docker Hub Access Token (2 min)

1. **Go to**: https://hub.docker.com/settings/security
2. Click **"New Access Token"**
3. **Token name**: `github-actions` (or any name)
4. **Permissions**: **Read & Write**
5. Click **"Generate"**
6. **⚠️ IMPORTANT**: Copy the token immediately! It looks like: `dckr_pat_xxxxxxxxxxxxx`
   - You won't see it again!
   - Save it somewhere safe

### Step 5: Add GitHub Secrets (2 min)

1. **Go to your GitHub repository**
2. Click **"Settings"** (top menu)
3. Click **"Secrets and variables"** → **"Actions"** (left sidebar)
4. Click **"New repository secret"**

   **Add Secret 1:**
   - Name: `DOCKERHUB_USERNAME`
   - Value: Your Docker Hub username
   - Click **"Add secret"**

   **Add Secret 2:**
   - Name: `DOCKERHUB_TOKEN`
   - Value: The token you copied in Step 4
   - Click **"Add secret"**

### Step 6: Enable GitHub Actions (1 min)

1. Still in **Settings** → **Actions** → **General**
2. Under **"Workflow permissions"**:
   - Select **"Read and write permissions"**
   - Check **"Allow GitHub Actions to create and approve pull requests"**
3. Click **"Save"**

---

## ✅ That's It! Now What Happens?

### Automatic Workflow (No Action Needed!)

Every time you push code to GitHub:

1. **GitHub Actions automatically starts** (you'll see it in the "Actions" tab)
2. **Builds Docker images** for frontend and API
3. **Pushes images to Docker Hub** with tags like:
   - `your-username/ditto-frontend:latest`
   - `your-username/ditto-api:latest`
4. **Takes about 5-10 minutes** (first time might be longer)

### How to See It Working

1. **Go to your GitHub repository**
2. Click **"Actions"** tab (top menu)
3. You'll see workflow runs with status:
   - 🟡 **Yellow dot** = Running
   - ✅ **Green checkmark** = Success
   - ❌ **Red X** = Failed

4. **Click on a workflow run** to see detailed logs

---

## 📊 Understanding the Workflows

Your project has **4 workflow files**:

### 1. `dockerhub-push.yml` (Simplest - Recommended for Beginners)
**What it does:**
- ✅ Builds Docker images
- ✅ Pushes to Docker Hub
- ❌ Does NOT deploy (you deploy manually)

**When it runs:**
- Every push to `main` or `master` branch
- When you manually trigger it

**Best for:** Learning, testing, manual deployments

### 2. `ci-cd.yml` (Full Pipeline)
**What it does:**
- ✅ Builds Docker images
- ✅ Pushes to Docker Hub
- ✅ Deploys to Kubernetes (requires KUBECONFIG secret)

**When it runs:**
- Every push to `main` or `master` branch
- Pull requests

**Best for:** Automatic deployments (requires Kubernetes setup)

### 3. `scheduled-update.yml` (Auto-Update)
**What it does:**
- ✅ Runs every 30 minutes
- ✅ Scrapes fresh data from Ditto
- ✅ Builds new images if data changed
- ✅ Deploys automatically

**When it runs:**
- Every 30 minutes (automatic)
- When you manually trigger it

**Best for:** Keeping data fresh automatically

### 4. `deploy-kind.yml` (Testing)
**What it does:**
- ✅ Creates a test Kubernetes cluster
- ✅ Tests deployment

**When it runs:**
- When you manually trigger it

**Best for:** Testing deployments

---

## 🎯 Recommended Setup for Beginners

### Start Simple (No Kubernetes Needed)

1. **Use `dockerhub-push.yml` only**
   - It's the simplest
   - Just builds and pushes images
   - No Kubernetes knowledge needed

2. **After images are built:**
   - Go to Docker Hub
   - See your images: `your-username/ditto-frontend` and `your-username/ditto-api`
   - Pull and run them locally or on any server

### Later: Add Automatic Deployment

Once you're comfortable, you can:
1. Set up a Kubernetes cluster (local or cloud)
2. Add `KUBECONFIG` secret to GitHub
3. Use `ci-cd.yml` for automatic deployment

---

## 🔍 Monitoring Your Workflows

### Check Workflow Status

1. **Go to**: `https://github.com/YOUR_USERNAME/ditto-insurance/actions`
2. **See all workflow runs** with:
   - Status (✅ Success, ❌ Failed, 🟡 Running)
   - Duration
   - Commit message

### View Detailed Logs

1. Click on any workflow run
2. Click on a job (e.g., "Build and Push Frontend")
3. Click on a step to see detailed logs
4. **Green checkmark** = Step succeeded
5. **Red X** = Step failed (check logs for errors)

### Common Issues

**Workflow not running?**
- Check if Actions is enabled (Settings → Actions → General)
- Verify you pushed code to the correct branch (`main` or `master`)

**Build failing?**
- Check the logs in the Actions tab
- Verify Docker Hub secrets are correct
- Check if Docker Hub repositories exist

**Images not appearing in Docker Hub?**
- Wait a few minutes (builds take time)
- Check workflow logs for errors
- Verify Docker Hub credentials

---

## 📦 What Gets Created?

### Docker Images

After a successful workflow run, you'll have:

**In Docker Hub:**
- `your-username/ditto-frontend:latest`
- `your-username/ditto-frontend:main-abc123` (with commit SHA)
- `your-username/ditto-api:latest`
- `your-username/ditto-api:main-abc123` (with commit SHA)

### How to Use These Images

**Pull and run locally:**
```bash
# Pull images
docker pull your-username/ditto-frontend:latest
docker pull your-username/ditto-api:latest

# Run API
docker run -p 8000:8000 your-username/ditto-api:latest

# Run Frontend
docker run -p 3000:80 your-username/ditto-frontend:latest
```

**Or deploy to any server:**
- Use Docker Compose
- Use Kubernetes
- Use any container platform

---

## 🎓 Learning Path

### Week 1: Basic Setup
1. ✅ Push code to GitHub
2. ✅ Set up Docker Hub
3. ✅ Configure secrets
4. ✅ Watch workflows run
5. ✅ Pull and test images locally

### Week 2: Understanding Workflows
1. Read workflow files (`.github/workflows/*.yml`)
2. Understand what each step does
3. Modify workflows to learn
4. Check logs to understand flow

### Week 3: Advanced (Optional)
1. Set up Kubernetes cluster
2. Configure automatic deployment
3. Set up scheduled updates
4. Monitor production deployments

---

## 🆘 Getting Help

### If Something Fails

1. **Check the Actions tab** for error messages
2. **Read the logs** - they show exactly what went wrong
3. **Common fixes:**
   - Wrong Docker Hub username/token → Update secrets
   - Repository doesn't exist → Create it in Docker Hub
   - Syntax error in workflow → Check YAML formatting

### Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Docker Hub Docs**: https://docs.docker.com/docker-hub/
- **Your workflow files**: Check `.github/workflows/` for examples

---

## ✅ Quick Checklist

Before your first push:

- [ ] GitHub account created
- [ ] GitHub repository created
- [ ] Docker Hub account created
- [ ] Docker Hub repositories created (`ditto-frontend`, `ditto-api`)
- [ ] Docker Hub access token created
- [ ] GitHub secrets added (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`)
- [ ] GitHub Actions enabled in repository settings
- [ ] Code ready to push

After pushing:

- [ ] Check Actions tab - workflow should start automatically
- [ ] Wait 5-10 minutes for first build
- [ ] Check Docker Hub - images should appear
- [ ] Celebrate! 🎉

---

## 🎉 You're Ready!

Once you complete these steps:
1. Push your code
2. Watch the magic happen in the Actions tab
3. See your images in Docker Hub
4. Deploy anywhere you want!

**Remember:** Start simple with `dockerhub-push.yml`. You can add automatic deployment later when you're ready.

---

**Need help?** Check the logs in the Actions tab - they're very detailed and will guide you!

