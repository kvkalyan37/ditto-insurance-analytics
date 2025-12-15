# Project Cleanup Guide

## Overview

This guide helps you remove unwanted files and directories from the project to keep it clean and focused on the Ditto Insurance Analytics application.

## What Gets Removed

### ❌ Next.js Project Files (Unrelated)
- `app/` - Next.js app directory
- `.next/` - Next.js build output
- `next-env.d.ts` - Next.js TypeScript config
- `components/` - React components
- `contexts/` - React contexts
- `lib/` - Library files
- `prisma/` - Prisma ORM

### ❌ Unused Services
- `services/` - Entire directory (api-gateway, auth-service, etc.)

### ❌ Old Kubernetes Manifests
- `k8s/` - Direct Kubernetes manifests (replaced by Helm)

### ❌ Build Artifacts
- `node_modules/` - Node dependencies
- `__pycache__/` - Python cache
- `venv_scraper/` - Virtual environment
- `.next/` - Next.js build

### ❌ Logs & Data Files
- `logs/` - Log directory
- `*.log` - Log files
- `*.csv` - Data files (generated)
- `data/` - Data directory

### ❌ Package Files
- `package-lock.json` - Node package lock (if unused)
- `package.json` - Node package file (if unused)

## How to Clean Up

### Option 1: Automated Cleanup (Recommended)

Run the cleanup script:

```bash
./cleanup.sh
```

The script will:
- ✅ Safely remove all unwanted directories
- ✅ Show progress for each removal
- ✅ Skip files that don't exist
- ✅ Preserve all core project files

### Option 2: Manual Cleanup

If you prefer to remove files manually:

```bash
# Remove Next.js files
rm -rf app .next next-env.d.ts components contexts lib prisma

# Remove unused services
rm -rf services

# Remove old k8s manifests
rm -rf k8s

# Remove build artifacts
rm -rf node_modules __pycache__ venv_scraper .next

# Remove logs and data
rm -rf logs data
rm -f *.log *.csv

# Remove package files (if unused)
rm -f package-lock.json package.json
```

## What Stays (Core Project)

### ✅ Scraper
- `scrape_ditto.py`
- `requirements_scraper.txt`

### ✅ API Service
- `api_service/main.py`
- `api_service/requirements.txt`
- `api_service/Dockerfile`

### ✅ Frontend
- `frontend/index.html`
- `frontend/app.js`
- `frontend/styles.css`
- `frontend/nginx.conf`
- `frontend/Dockerfile`
- `frontend/cursor-favicon.ico`

### ✅ Kubernetes/Helm
- `helm/ditto-insurance/`

### ✅ CI/CD
- `.github/workflows/`

### ✅ Scripts
- `scripts/*.sh`

### ✅ Documentation
- `*.md` files

## Verification

After cleanup, verify the project structure:

```bash
# Check core directories exist
ls -d api_service frontend helm scripts .github

# Check unwanted directories are gone
[ ! -d "app" ] && echo "✓ app/ removed" || echo "✗ app/ still exists"
[ ! -d "services" ] && echo "✓ services/ removed" || echo "✗ services/ still exists"
[ ! -d "k8s" ] && echo "✓ k8s/ removed" || echo "✗ k8s/ still exists"
```

## Safety

The cleanup script:
- ✅ Only removes known unwanted files
- ✅ Preserves all core project files
- ✅ Shows what it's removing
- ✅ Can be reviewed before running

**Note:** The cleanup script is safe to run multiple times (it skips files that don't exist).

## After Cleanup

1. **Verify .gitignore** - Ensure all removed files are in `.gitignore`
2. **Test the application** - Make sure everything still works
3. **Commit changes** - Commit the cleanup to Git

## Files Already Ignored by .gitignore

These files are already in `.gitignore` and won't be committed:
- `*.csv` - Data files
- `*.log` - Log files
- `logs/` - Log directory
- `data/` - Data directory
- `__pycache__/` - Python cache
- `venv_scraper/` - Virtual environment
- `node_modules/` - Node dependencies
- `.next/` - Next.js build

Even if these files exist locally, they won't be committed to Git.

