# GitHub Actions CI/CD Workflows

This directory contains CI/CD workflows for the Ditto Insurance application.

## Workflows

### 1. `dockerhub-push.yml`
**Purpose**: Build and push Docker images to Docker Hub

**Triggers**:
- Push to `main` or `master` branch
- Manual trigger (`workflow_dispatch`)

**What it does**:
- Builds frontend and API Docker images
- Pushes to Docker Hub with multiple tags (branch, SHA, latest)
- Uses Docker layer caching for faster builds

### 2. `ci-cd.yml`
**Purpose**: Full CI/CD pipeline (build, push, deploy)

**Triggers**:
- Push to `main` or `master` branch
- Pull requests
- Manual trigger

**What it does**:
- Builds and pushes images to Docker Hub
- Deploys to Kubernetes using Helm
- Requires `KUBECONFIG` secret for deployment

### 3. `deploy-kind.yml`
**Purpose**: Deploy to Kind cluster (for testing)

**Triggers**:
- Manual trigger (`workflow_dispatch`)
- Push to `main` or `master` (when workflow file changes)

**What it does**:
- Creates a Kind cluster in GitHub Actions runner
- Builds images locally
- Loads images into Kind
- Deploys using Helm

## Required Secrets

Add these secrets in GitHub repository settings:

1. `DOCKERHUB_USERNAME`: Your Docker Hub username
2. `DOCKERHUB_TOKEN`: Docker Hub access token
3. `KUBECONFIG`: Base64 encoded kubeconfig (for `ci-cd.yml` only)

## Usage

### Automatic (Recommended)
Just push to `main` or `master` branch - workflows will run automatically.

### Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select the workflow
3. Click **Run workflow**

## Free Tier Considerations

- **Public repositories**: Unlimited Actions minutes
- **Private repositories**: 2,000 minutes/month
- **Docker Hub**: Unlimited public repositories
- Use `dockerhub-push.yml` for most cases (simpler, faster)
