# Ditto Insurance Analytics Dashboard

A comprehensive web application for analyzing and visualizing health insurance plans and ratings from Ditto Insurance.

## 🚀 Features

- **Interactive Dashboard**: Beautiful dark-themed dashboard with interactive charts
- **Real-time Data**: Automatically scrapes and updates data every 30 minutes
- **Advanced Filtering**: Filter by company, rating ranges, and search
- **Visual Analytics**: Pie charts, bar charts, and data tables
- **Zero Downtime**: Rolling updates with Kubernetes
- **CI/CD Pipeline**: Automated builds and deployments with GitHub Actions

## 📋 Quick Start

### Prerequisites

- GitHub account (free)
- Docker Hub account (free)
- Kubernetes cluster (optional, for deployment)

### Setup (15 minutes)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ditto-insurance.git
   git push -u origin main
   ```

2. **Create Docker Hub repositories**:
   - `ditto-frontend` (public)
   - `ditto-api` (public)

3. **Add GitHub Secrets**:
   - `DOCKERHUB_USERNAME` - Your Docker Hub username
   - `DOCKERHUB_TOKEN` - Docker Hub access token

4. **Done!** Workflows run automatically.

See `GITHUB_ACTIONS_BEGINNER_GUIDE.md` for detailed instructions.

## 📁 Project Structure

```
ditto-insurance/
├── scrape_ditto.py          # Data scraper
├── api_service/              # FastAPI backend
├── frontend/                 # Static frontend
├── helm/                    # Kubernetes Helm charts
├── .github/workflows/        # CI/CD workflows
└── scripts/                  # Utility scripts
```

## 🔧 Components

### Scraper
- Scrapes insurance plans and ratings from joinditto.in
- Supports all 22 insurance providers
- Handles edge cases and special provider paths

### API Service (FastAPI)
- RESTful API for insurance data
- Statistics and aggregations
- Filtering and search capabilities

### Frontend
- Interactive dashboard with Chart.js
- Dark theme with animations
- Responsive design
- Filter persistence

## 🚢 Deployment

### Automatic (Recommended)
- Push to GitHub → Automatic build → Docker Hub → Deploy

### Manual
```bash
docker pull YOUR_USERNAME/ditto-frontend:latest
docker pull YOUR_USERNAME/ditto-api:latest
docker run -p 8000:8000 YOUR_USERNAME/ditto-api:latest
docker run -p 3000:80 YOUR_USERNAME/ditto-frontend:latest
```

## 📚 Documentation

- `GITHUB_ACTIONS_BEGINNER_GUIDE.md` - Complete GitHub Actions guide
- `COMPLETE_SETUP_CHECKLIST.md` - Detailed setup checklist
- `SCHEDULED_UPDATE_GUIDE.md` - Auto-update configuration
- `CI_CD_SETUP.md` - CI/CD setup guide
- `QUICK_START_DEPLOYMENT.md` - Quick deployment guide

## 🔄 CI/CD Workflows

- **dockerhub-push.yml**: Build and push images (simplest)
- **ci-cd.yml**: Full pipeline with deployment
- **scheduled-update.yml**: Auto-update every 30 minutes
- **deploy-kind.yml**: Test deployment with Kind

## 🛠️ Technologies

- **Backend**: FastAPI, Python, Pandas
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Infrastructure**: Docker, Kubernetes, Helm
- **CI/CD**: GitHub Actions, Docker Hub
- **Web Server**: Nginx

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push and create a pull request

## 📞 Support

For issues and questions:
- Check documentation files
- Review workflow logs in GitHub Actions
- Check Docker Hub for image status

---

**Made with ❤️ on Ditto using Cursor**
