# CI/CD Setup Guide - Free Tier

This guide will help you set up a completely free CI/CD pipeline using GitHub Actions and Docker Hub.

## Prerequisites

1. **GitHub Account** (Free)
2. **Docker Hub Account** (Free)
3. **Kubernetes Cluster** (Kind for local, or free tier cloud options)

## Step 1: Create Docker Hub Account

1. Go to https://hub.docker.com/
2. Sign up for a free account
3. Create two repositories:
   - `ditto-frontend`
   - `ditto-api`

## Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token (see below)
   - `KUBECONFIG`: Base64 encoded kubeconfig (for deployment)

### Getting Docker Hub Token

1. Go to Docker Hub → **Account Settings** → **Security**
2. Click **New Access Token**
3. Name it (e.g., "GitHub Actions")
4. Copy the token and add it as `DOCKERHUB_TOKEN` secret

### Getting Kubeconfig (for deployment)

If deploying to a remote cluster:

```bash
# Get your kubeconfig
cat ~/.kube/config | base64 -w 0

# Add the output as KUBECONFIG secret in GitHub
```

For local Kind cluster, you can skip this or use a self-hosted runner.

## Step 3: Workflow Files

The following workflow files are already created:

1. **`.github/workflows/dockerhub-push.yml`**
   - Builds and pushes images to Docker Hub
   - Triggers on push to main/master
   - Tags images with branch, SHA, and latest

2. **`.github/workflows/ci-cd.yml`**
   - Full CI/CD pipeline
   - Builds, pushes, and deploys
   - Requires KUBECONFIG secret for deployment

3. **`.github/workflows/deploy-kind.yml`**
   - Deploys to Kind cluster (for testing)
   - Creates Kind cluster in GitHub Actions runner
   - Good for testing deployments

## Step 4: Update Image References

Update your Helm values or deployment files to use Docker Hub images:

```yaml
# In helm/ditto-insurance/values.yaml
frontend:
  image:
    repository: YOUR_DOCKERHUB_USERNAME/ditto-frontend
    tag: "latest"

api:
  image:
    repository: YOUR_DOCKERHUB_USERNAME/ditto-api
    tag: "latest"
```

## Step 5: Push to GitHub

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

## Workflow Triggers

### Automatic Triggers

- **Push to main/master**: Builds and pushes images
- **File changes**: Only triggers on relevant file changes

### Manual Triggers

- Use **workflow_dispatch** to manually trigger workflows
- Go to **Actions** tab → Select workflow → **Run workflow**

## Free Tier Limits

### GitHub Actions (Free Tier)
- ✅ 2,000 minutes/month for private repos
- ✅ Unlimited minutes for public repos
- ✅ 500 MB storage

### Docker Hub (Free Tier)
- ✅ 1 private repository
- ✅ Unlimited public repositories
- ✅ Unlimited pulls

## Recommended Setup for Free Tier

1. **Use Public Docker Hub Repositories** (unlimited)
2. **Use Public GitHub Repository** (unlimited Actions minutes)
3. **Use Kind for Local Testing** (free)
4. **Use Self-Hosted Runner** (optional, for deployment to local cluster)

## Deployment Options

**⚠️ Important: All deployments use Helm exclusively - no direct kubectl apply/manifest deployments**

### Option 1: Manual Deployment with Helm (Free)
After images are pushed to Docker Hub:
```bash
# Deploy using Helm (recommended)
helm upgrade --install ditto-insurance ./helm/ditto-insurance \
  --namespace ditto-insurance \
  --create-namespace \
  --set frontend.image.repository=YOUR_USERNAME/ditto-frontend \
  --set frontend.image.tag=latest \
  --set api.image.repository=YOUR_USERNAME/ditto-api \
  --set api.image.tag=latest
```

### Option 2: Self-Hosted Runner (Free)
1. Set up a self-hosted GitHub Actions runner on your machine
2. Runner can access your local Kubernetes cluster
3. Automatic deployment on push

### Option 3: Cloud Free Tier
- **Google Cloud Run** (free tier available)
- **Railway** (free tier available)
- **Render** (free tier available)

## Monitoring

Check workflow runs:
1. Go to **Actions** tab in GitHub
2. View workflow runs and logs
3. Monitor build and deployment status

## Troubleshooting

### Images not pushing
- Verify Docker Hub credentials in secrets
- Check Docker Hub repository names match

### Deployment failing
- Verify KUBECONFIG secret is correct
- Check cluster connectivity
- Verify image pull secrets if using private repos

### Build cache issues
- Workflows use Docker layer caching
- Cache stored in Docker Hub as `buildcache` tags

## Next Steps

1. Set up Docker Hub repositories
2. Add GitHub secrets
3. Push code to trigger first build
4. Monitor Actions tab for results

