# Project Analysis & Cleanup Report

## ✅ Core Project Files (KEEP)

### Scraper
- `scrape_ditto.py` - Main scraper script
- `requirements_scraper.txt` - Python dependencies

### API Service
- `api_service/main.py` - FastAPI application
- `api_service/requirements.txt` - API dependencies
- `api_service/Dockerfile` - API container

### Frontend
- `frontend/index.html` - Main HTML
- `frontend/app.js` - Frontend JavaScript
- `frontend/styles.css` - Styles
- `frontend/nginx.conf` - Nginx config
- `frontend/Dockerfile` - Frontend container
- `frontend/cursor-favicon.ico` - Favicon

### Kubernetes/Helm
- `helm/ditto-insurance/` - Helm chart
- `helm/ditto-insurance/values.yaml` - Helm values
- `helm/ditto-insurance/scrape_ditto.py` - Scraper (in chart)
- `helm/ditto-insurance/requirements_scraper.txt` - Dependencies

### CI/CD
- `.github/workflows/*.yml` - GitHub Actions workflows

### Scripts
- `scripts/*.sh` - Utility scripts for port forwarding, etc.

### Documentation
- `*.md` - Documentation files

## ❌ Unwanted Files/Directories (REMOVE)

### Next.js Project (Unrelated)
- `app/` - Next.js app directory (not used)
- `.next/` - Next.js build output
- `next-env.d.ts` - Next.js TypeScript config
- `components/` - React components (not used)
- `contexts/` - React contexts (not used)
- `lib/` - Library files (not used)
- `prisma/` - Prisma ORM (not used)

### Unused Services
- `services/api-gateway/` - Not used
- `services/auth-service/` - Not used
- `services/order-service/` - Not used
- `services/product-service/` - Not used
- `services/quote-service/` - Not used

### Old Kubernetes Manifests (We use Helm now)
- `k8s/` - Direct Kubernetes manifests (replaced by Helm)

### Build Artifacts
- `node_modules/` - Node dependencies (should be in .gitignore)
- `__pycache__/` - Python cache (should be in .gitignore)
- `venv_scraper/` - Virtual environment (should be in .gitignore)
- `.next/` - Next.js build (should be in .gitignore)

### Logs & Data
- `logs/` - Log files (should be in .gitignore)
- `*.log` - Log files (should be in .gitignore)
- `*.csv` - Data files (should be in .gitignore, generated)
- `data/` - Data directory (should be in .gitignore)

### Package Files (Unused)
- `package-lock.json` - Node package lock (not used)
- `package.json` - Node package file (not used, if exists)

## 📝 Files Needing Comments

1. `scrape_ditto.py` - Add function docstrings
2. `api_service/main.py` - Add endpoint documentation
3. `frontend/app.js` - Add function comments
4. `frontend/nginx.conf` - Add configuration comments
5. `scripts/*.sh` - Add usage comments

## 🧹 Cleanup Actions

1. Remove Next.js directories
2. Remove unused services
3. Remove old k8s manifests
4. Add comments to code files
5. Verify .gitignore covers all artifacts
