# 🚀 Quick Start: Deploy Your Application

## TL;DR - Fastest Way to Get Started

### 1. Push to GitHub (2 minutes)

```bash
cd /Users/c27979e/Downloads/Cursor_Projects

# Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ditto-insurance.git
git branch -M main
git push -u origin main
```

### 2. Set Up Docker Hub (3 minutes)

1. Create account: https://hub.docker.com/signup
2. Create repositories:
   - `ditto-frontend` (public)
   - `ditto-api` (public)
3. Get access token: https://hub.docker.com/settings/security
4. Copy the token

### 3. Add GitHub Secrets (2 minutes)

1. Go to: `https://github.com/YOUR_USERNAME/ditto-insurance/settings/secrets/actions`
2. Add secrets:
   - `DOCKERHUB_USERNAME` = Your Docker Hub username
   - `DOCKERHUB_TOKEN` = Your Docker Hub token

### 4. Done! ✅

- Workflows run automatically
- Check: `https://github.com/YOUR_USERNAME/ditto-insurance/actions`
- Images appear in Docker Hub after ~5-10 minutes

---

## 🎯 What Happens Automatically?

When you push code:

1. **GitHub Actions triggers** (you'll see it in Actions tab)
2. **Builds Docker images** (takes 5-10 minutes)
3. **Pushes to Docker Hub** (images appear automatically)
4. **You can deploy** the images anywhere!

---

## 📦 Using Your Images

After images are built, you can:

### Option 1: Run Locally
```bash
docker pull YOUR_USERNAME/ditto-api:latest
docker pull YOUR_USERNAME/ditto-frontend:latest

docker run -p 8000:8000 YOUR_USERNAME/ditto-api:latest
docker run -p 3000:80 YOUR_USERNAME/ditto-frontend:latest
```

### Option 2: Deploy to Cloud
- AWS, Google Cloud, Azure
- DigitalOcean, Railway, Render
- Any platform that supports Docker

### Option 3: Use Kubernetes (Later)
- Set up a cluster
- Add `KUBECONFIG` secret
- Automatic deployment!

---

## 🆘 Troubleshooting

**Workflow not running?**
- Check: Settings → Actions → General → Workflow permissions

**Build failing?**
- Check Actions tab → Click failed workflow → Read logs
- Verify Docker Hub secrets are correct

**Images not in Docker Hub?**
- Wait 5-10 minutes
- Check workflow completed successfully
- Verify repository names match exactly

---

## 📚 Full Guide

For detailed step-by-step instructions, see:
- `GITHUB_ACTIONS_BEGINNER_GUIDE.md` - Complete beginner's guide
- `COMPLETE_SETUP_CHECKLIST.md` - Detailed checklist

---

**That's it!** Push your code and watch it build automatically! 🎉

