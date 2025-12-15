# 🚀 Next Steps: Deploy Your Application

## ✅ What's Done
- ✅ Docker images building and pushing successfully
- ✅ Images tagged with timestamps
- ✅ CI/CD workflows configured

## 📋 Next Steps to Get Application Running

### Step 1: Choose Your Deployment Option

You have **3 options** depending on your needs:

---

## Option A: Deploy to Kubernetes (Recommended for Production)

### 1.1 Set Up Kubernetes Cluster

**Choose one:**

#### A) Local Cluster (Kind - Free, for Testing)
```bash
# Install Kind
brew install kind  # macOS
# or
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Create cluster
kind create cluster --name ditto-insurance

# Get kubeconfig
kind get kubeconfig --name ditto-insurance > ~/.kube/config
```

#### B) Cloud Cluster (Free Tier Options)
- **Google Cloud (GKE)**: Free tier available
- **DigitalOcean**: $12/month (cheapest paid option)
- **AWS (EKS)**: Free tier available
- **Azure (AKS)**: Free tier available

### 1.2 Get Kubeconfig

```bash
# For local Kind
kind get kubeconfig --name ditto-insurance > ~/.kube/config

# For cloud clusters, follow your provider's instructions
# Usually: gcloud, aws, azure CLI commands
```

### 1.3 Encode Kubeconfig for GitHub Secret

```bash
# Encode your kubeconfig
cat ~/.kube/config | base64 -w 0  # Linux
cat ~/.kube/config | base64       # macOS

# Copy the output (you'll need it for GitHub)
```

### 1.4 Add KUBECONFIG Secret to GitHub

1. Go to: `https://github.com/YOUR_USERNAME/ditto-insurance/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `KUBECONFIG`
4. Value: Paste the base64 encoded kubeconfig from step 1.3
5. Click **Add secret**

### 1.5 Generate Initial Data File

The API needs an initial data file. You have two options:

#### Option 1: Run Scraper Locally (Recommended)
```bash
cd /Users/c27979e/Downloads/Cursor_Projects

# Create virtual environment
python3 -m venv venv_scraper
source venv_scraper/bin/activate

# Install dependencies
pip install -r requirements_scraper.txt

# Run scraper
python scrape_ditto.py --output data/ditto_insurance_data.csv

# Verify file exists
ls -lh data/ditto_insurance_data.csv
```

#### Option 2: Let Scheduled Update Create It
- The scheduled-update workflow will create it automatically
- But you need initial data for first deployment

### 1.6 Deploy with Helm

**Option A: Automatic (via GitHub Actions)**
- Push any change to trigger `ci-cd.yml`
- It will automatically deploy after building images

**Option B: Manual Deployment**
```bash
# Get latest image tag from Docker Hub
# Or use the timestamp from your last build

# Deploy with Helm
helm upgrade --install ditto-insurance ./helm/ditto-insurance \
  --namespace ditto-insurance \
  --create-namespace \
  --set frontend.image.repository=YOUR_DOCKERHUB_USERNAME/ditto-frontend \
  --set frontend.image.tag=20251215-151643 \
  --set api.image.repository=YOUR_DOCKERHUB_USERNAME/ditto-api \
  --set api.image.tag=20251215-151643

# Check status
kubectl get pods -n ditto-insurance
kubectl get services -n ditto-insurance
```

### 1.7 Access the Application

```bash
# Port forward to access locally
kubectl port-forward -n ditto-insurance service/ditto-insurance-frontend 8080:80

# Open browser: http://localhost:8080
```

---

## Option B: Run Locally with Docker (Quickest for Testing)

### 2.1 Pull Images

```bash
# Get your latest image tag from Docker Hub
docker pull YOUR_DOCKERHUB_USERNAME/ditto-api:20251215-151643
docker pull YOUR_DOCKERHUB_USERNAME/ditto-frontend:20251215-151643
```

### 2.2 Generate Data File

```bash
cd /Users/c27979e/Downloads/Cursor_Projects
python3 -m venv venv_scraper
source venv_scraper/bin/activate
pip install -r requirements_scraper.txt
python scrape_ditto.py --output data/ditto_insurance_data.csv
```

### 2.3 Run Containers

```bash
# Run API (in one terminal)
docker run -d \
  --name ditto-api \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  YOUR_DOCKERHUB_USERNAME/ditto-api:20251215-151643

# Run Frontend (in another terminal)
docker run -d \
  --name ditto-frontend \
  -p 8080:80 \
  -e API_BASE_URL=http://localhost:8000 \
  YOUR_DOCKERHUB_USERNAME/ditto-frontend:20251215-151643

# Check logs
docker logs ditto-api
docker logs ditto-frontend
```

### 2.4 Access Application

- Frontend: http://localhost:8080
- API: http://localhost:8000

---

## Option C: Use GitHub Actions Deploy-Kind (Testing)

### 3.1 Trigger Workflow

1. Go to: `https://github.com/YOUR_USERNAME/ditto-insurance/actions`
2. Select **Deploy to Kind (Local Testing)**
3. Click **Run workflow** → **Run workflow**
4. Wait for completion (~10-15 minutes)

This creates a Kind cluster in GitHub Actions and deploys your app.

**Note:** This is for testing only - the cluster is destroyed after the workflow completes.

---

## 🔍 Verify Everything Works

### Check API Health
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", "data_file": "exists"}
```

### Check API Data
```bash
curl http://localhost:8000/api/data?limit=5
# Should return JSON with insurance plans
```

### Check Frontend
- Open browser: http://localhost:8080
- Should see dashboard with charts and data

---

## 🐛 Troubleshooting

### API Shows "No Data"
- **Problem**: Data file not found
- **Solution**: 
  ```bash
  # Generate data file
  python scrape_ditto.py --output data/ditto_insurance_data.csv
  
  # For Kubernetes, copy to PVC or mount volume
  kubectl cp data/ditto_insurance_data.csv ditto-insurance/ditto-insurance-api-xxx:/app/data/
  ```

### Frontend Can't Connect to API
- **Problem**: API URL incorrect
- **Solution**: Check `API_BASE_URL` environment variable
- For Kubernetes: Check service name and namespace

### Images Not Pulling
- **Problem**: Image tag doesn't exist
- **Solution**: Check Docker Hub for available tags
- Use the timestamp tag from your latest build

---

## 📚 Additional Resources

- **Helm Values**: `helm/ditto-insurance/values.yaml`
- **Quick Start**: `QUICK_START_DEPLOYMENT.md`
- **Complete Setup**: `COMPLETE_SETUP_CHECKLIST.md`
- **CI/CD Guide**: `CI_CD_SETUP.md`

---

## ✅ Quick Checklist

- [ ] Choose deployment option (A, B, or C)
- [ ] Set up Kubernetes cluster (if Option A)
- [ ] Add KUBECONFIG secret to GitHub (if Option A)
- [ ] Generate initial data file
- [ ] Deploy application
- [ ] Verify API health endpoint
- [ ] Access frontend in browser
- [ ] Test dashboard functionality

---

**Need Help?** Check the troubleshooting section or review the detailed guides in the project!

