# Quick Start: CI/CD Setup (5 Minutes)

## 🚀 Fast Setup

### 1. Create Docker Hub Repositories (2 min)

1. Go to https://hub.docker.com/
2. Sign up/login
3. Create repositories:
   - `ditto-frontend` (public)
   - `ditto-api` (public)

### 2. Add GitHub Secrets (2 min)

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | Your Docker Hub account |
| `DOCKERHUB_TOKEN` | Access token | Docker Hub → Account Settings → Security → New Access Token |

### 3. Push to GitHub (1 min)

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

**That's it!** 🎉

Workflows will automatically:
- ✅ Build Docker images
- ✅ Push to Docker Hub
- ✅ Tag with `latest` and commit SHA

## 📋 Workflow Options

### Option 1: Build & Push Only (Recommended for Free Tier)
**File**: `.github/workflows/dockerhub-push.yml`

- ✅ Builds and pushes images
- ✅ No Kubernetes deployment
- ✅ Fastest and simplest
- ✅ Works with any Kubernetes cluster

**Usage**: After images are pushed, deploy manually using Helm (Helm-only, no direct manifest deployments):
```bash
helm upgrade --install ditto-insurance ./helm/ditto-insurance \
  --namespace ditto-insurance \
  --create-namespace \
  --set frontend.image.repository=YOUR_USERNAME/ditto-frontend \
  --set frontend.image.tag=latest \
  --set api.image.repository=YOUR_USERNAME/ditto-api \
  --set api.image.tag=latest
```

### Option 2: Full CI/CD (Requires KUBECONFIG)
**File**: `.github/workflows/ci-cd.yml`

- ✅ Builds, pushes, AND deploys
- ⚠️ Requires `KUBECONFIG` secret
- ⚠️ Needs access to Kubernetes cluster

### Option 3: Test with Kind
**File**: `.github/workflows/deploy-kind.yml`

- ✅ Creates Kind cluster in GitHub Actions
- ✅ Tests deployment
- ⚠️ Slower (creates cluster each time)

## 🔍 Verify It's Working

1. Go to **Actions** tab in GitHub
2. You should see workflow runs
3. Check Docker Hub - images should appear

## 🎯 Next Steps

1. **Pull images locally**:
   ```bash
   docker pull YOUR_USERNAME/ditto-frontend:latest
   docker pull YOUR_USERNAME/ditto-api:latest
   ```

2. **Deploy using Helm** (Helm-only, no direct manifest deployments):
   ```bash
   helm upgrade --install ditto-insurance ./helm/ditto-insurance \
     --namespace ditto-insurance \
     --create-namespace \
     --set frontend.image.repository=YOUR_USERNAME/ditto-frontend \
     --set frontend.image.tag=latest \
     --set api.image.repository=YOUR_USERNAME/ditto-api \
     --set api.image.tag=latest
   ```
   
   **Note**: All deployments use Helm exclusively. Never use `kubectl apply` with manifest files directly.

## 💡 Tips

- **Public repos** = Unlimited GitHub Actions minutes (FREE!)
- **Docker Hub public repos** = Unlimited (FREE!)
- Use `dockerhub-push.yml` for most cases
- Images are tagged with: `latest`, `main-<sha>`, `<sha>`

## 🆘 Troubleshooting

**Workflow not running?**
- Check if secrets are set correctly
- Verify Docker Hub repositories exist
- Check Actions tab for errors

**Images not pushing?**
- Verify `DOCKERHUB_TOKEN` is correct
- Check Docker Hub repository names match exactly

**Need help?**
- See `CI_CD_SETUP.md` for detailed guide
- Check `.github/workflows/README.md` for workflow details

