# Project Structure

## 📁 Core Project Files

```
ditto-insurance/
├── scrape_ditto.py              # Main scraper script
├── requirements_scraper.txt     # Python dependencies for scraper
│
├── api_service/                 # FastAPI Backend
│   ├── main.py                  # API endpoints
│   ├── requirements.txt         # API dependencies
│   └── Dockerfile               # API container
│
├── frontend/                    # Static Frontend
│   ├── index.html              # Main HTML
│   ├── app.js                  # Frontend JavaScript
│   ├── styles.css              # Styles
│   ├── nginx.conf              # Nginx configuration
│   ├── Dockerfile              # Frontend container
│   └── cursor-favicon.ico      # Favicon
│
├── helm/                        # Kubernetes Helm Charts
│   └── ditto-insurance/
│       ├── values.yaml         # Helm values
│       ├── templates/          # Kubernetes manifests
│       ├── scrape_ditto.py     # Scraper (in chart)
│       └── requirements_scraper.txt
│
├── .github/                     # CI/CD
│   └── workflows/
│       ├── ci-cd.yml           # Full CI/CD pipeline
│       ├── dockerhub-push.yml  # Build & push
│       ├── deploy-kind.yml     # Test deployment
│       └── scheduled-update.yml # Auto-update every 30min
│
├── scripts/                     # Utility Scripts
│   ├── auto-port-forward.sh
│   ├── keep-alive-port-forward.sh
│   ├── quick-access.sh
│   └── ...
│
└── Documentation/
    ├── README.md
    ├── CI_CD_SETUP.md
    ├── COMPLETE_SETUP_CHECKLIST.md
    ├── SCHEDULED_UPDATE_GUIDE.md
    └── ...
```

## 🗑️ Files to Remove (Use cleanup.sh)

- `app/` - Next.js app (unrelated)
- `services/` - Unused services
- `k8s/` - Old Kubernetes manifests
- `node_modules/` - Node dependencies
- `logs/` - Log files
- `*.csv` - Generated data files

## 📝 Code Comments Added

All main code files now have comprehensive comments:

- ✅ `scrape_ditto.py` - Class and method docstrings
- ✅ `api_service/main.py` - Module and endpoint documentation
- ✅ `frontend/nginx.conf` - Configuration comments
- ✅ `frontend/app.js` - Section comments

## 🔒 Git Ignore

The `.gitignore` file excludes:
- Build artifacts
- Logs and data files
- Virtual environments
- IDE files
- OS files

See `.gitignore` for complete list.
