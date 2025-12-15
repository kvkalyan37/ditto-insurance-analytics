# 🚀 Quick Setup Guide (5 Minutes)

## What You Need:

### 1. Accounts (Free)
- ✅ GitHub account: https://github.com/signup
- ✅ Docker Hub account: https://hub.docker.com/signup

### 2. Create Repositories

**GitHub:**
- Create repo: https://github.com/new
- Name: `ditto-insurance`
- Public (recommended) or Private

**Docker Hub:**
- Create: `ditto-frontend` (public)
- Create: `ditto-api` (public)

### 3. Get Docker Hub Token
- Go to: https://hub.docker.com/settings/security
- Click "New Access Token"
- Copy the token (save it!)

### 4. Add GitHub Secrets
Go to: **Repo → Settings → Secrets → Actions**

Add these secrets:
- `DOCKERHUB_USERNAME` = Your Docker Hub username
- `DOCKERHUB_TOKEN` = Your Docker Hub token
- `KUBECONFIG` = Base64 kubeconfig (only if deploying)

### 5. Push Code
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ditto-insurance.git
git push -u origin main
```

### 6. Done! ✅
- Check Actions tab for workflow runs
- Check Docker Hub for images

---

**Full checklist:** See `COMPLETE_SETUP_CHECKLIST.md`
