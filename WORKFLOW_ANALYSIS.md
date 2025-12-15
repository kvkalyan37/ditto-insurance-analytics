# Workflow Analysis - Duplicate API Builds

## 🔍 Potential Causes

### 1. Multiple Workflows Building Same Image

**dockerhub-push.yml:**
- Triggers: push to main/master (paths: frontend/**, api_service/**, etc.)
- Builds: Frontend + API separately

**ci-cd.yml:**
- Triggers: push to main/master (same paths) + pull_request + workflow_dispatch
- Builds: Frontend + API together

**Issue:** Both workflows trigger on the same push event!

### 2. Overlapping Triggers

Both workflows have:
```yaml
on:
  push:
    branches: [main, master]
    paths:
      - 'api_service/**'
```

When you push changes to `api_service/`, BOTH workflows run!

### 3. Solution Options

**Option A: Disable one workflow**
- Keep `ci-cd.yml` (has deploy step)
- Disable `dockerhub-push.yml` OR remove duplicate triggers

**Option B: Make triggers exclusive**
- `dockerhub-push.yml`: Only on manual trigger or specific paths
- `ci-cd.yml`: Main CI/CD pipeline

**Option C: Consolidate**
- Merge both into one workflow with conditional steps
