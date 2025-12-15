# Docker Image Optimization Guide

## 🎯 Optimizations Applied

### 1. Multi-Stage Build for API

**Before**: Single-stage build with all dependencies
- Image size: ~400-500MB
- Includes build tools (gcc, g++) in final image

**After**: Multi-stage build
- Stage 1: Build dependencies (includes gcc, g++)
- Stage 2: Runtime (only Python packages, no build tools)
- **Expected size: ~250-350MB** (30-40% reduction)

### 2. Timestamp Tags

**Before**: Only `latest` and commit SHA
- `your-username/ditto-api:latest`
- `your-username/ditto-api:abc123`

**After**: Timestamp + latest + SHA
- `your-username/ditto-api:latest`
- `your-username/ditto-api:20241215-143000` (timestamp)
- `your-username/ditto-api:abc123` (commit SHA)

## 📊 Image Tag Strategy

### All Workflows Now Use:

1. **latest** - Always points to most recent build
2. **YYYYMMDD-HHMMSS** - Timestamp (e.g., `20241215-143000`)
3. **commit-sha** - Git commit hash (e.g., `abc123def`)

### Benefits:

- ✅ **Timestamp**: Easy to identify when image was built
- ✅ **SHA**: Trace back to exact code version
- ✅ **latest**: Convenient for pulling latest version

## 🔍 Size Comparison

### API Image:

| Build Type | Size | Notes |
|------------|------|-------|
| Single-stage | ~450MB | Includes build tools |
| Multi-stage | ~300MB | Build tools removed |
| **Savings** | **~150MB** | **33% smaller** |

### Frontend Image:

- Already optimized (nginx:alpine)
- Size: ~25-30MB
- No changes needed

## 🚀 Additional Optimizations (Future)

### Further Reduce API Image:

1. **Use python:3.11-alpine** (even smaller base)
   - Current: python:3.11-slim (~150MB base)
   - Alpine: python:3.11-alpine (~50MB base)
   - **Savings: ~100MB**

2. **Remove unused packages**
   - Review requirements.txt
   - Only include what's needed

3. **Use .dockerignore**
   - Exclude unnecessary files
   - Reduce build context size

## 📝 Current Dockerfile Structure

### API (Multi-stage):

```dockerfile
# Stage 1: Build
FROM python:3.11-slim as builder
- Install build dependencies
- Install Python packages

# Stage 2: Runtime
FROM python:3.11-slim
- Copy only installed packages
- Copy application code
- No build tools
```

### Frontend:

```dockerfile
FROM nginx:alpine
- Already minimal
- No optimization needed
```

## ✅ Verification

After pushing, check image sizes:

```bash
# Check image size in Docker Hub
docker pull your-username/ditto-api:latest
docker images your-username/ditto-api:latest

# Compare with previous version
docker images | grep ditto-api
```

## 🎯 Summary

- ✅ Multi-stage build implemented
- ✅ Timestamp tags added to all workflows
- ✅ Build tools removed from final image
- ✅ ~30-40% size reduction expected

**Next push will create optimized images with timestamp tags!**
