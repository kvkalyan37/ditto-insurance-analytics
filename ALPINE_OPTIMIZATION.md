# Alpine Image Optimization Guide

## 🎯 Optimization Strategy

### Base Image Comparison

| Image Type | Base Size | With Dependencies | Notes |
|------------|-----------|-------------------|-------|
| `python:3.11-slim` | ~150MB | ~450MB | Debian-based |
| `python:3.11-alpine` | ~50MB | ~150-200MB | Alpine Linux (musl) |
| **Savings** | **~100MB** | **~250-300MB** | **55-67% reduction** |

### Frontend Image

- ✅ Already using `nginx:alpine` (~25MB)
- No changes needed

## 📦 API Dockerfile Changes

### Before (slim):
```dockerfile
FROM python:3.11-slim as builder
# Uses apt-get (Debian package manager)
RUN apt-get update && apt-get install -y gcc g++
```

### After (Alpine):
```dockerfile
FROM python:3.11-alpine as builder
# Uses apk (Alpine package manager)
RUN apk add --no-cache gcc g++ musl-dev linux-headers libffi-dev
```

## 🔧 Key Differences

### Alpine Advantages:
1. **Smaller base**: ~50MB vs ~150MB
2. **Faster builds**: Smaller image to download
3. **Better security**: Minimal attack surface
4. **Faster pulls**: Less data to transfer

### Alpine Considerations:
1. **musl libc**: Different from glibc (Debian)
2. **Build tools needed**: Some packages compile from source
3. **Runtime libs**: Need `libstdc++` for pandas/numpy

## 📋 Multi-Stage Build (Alpine)

### Stage 1: Builder
- Base: `python:3.11-alpine`
- Install: `gcc`, `g++`, `musl-dev`, `linux-headers`, `libffi-dev`
- Purpose: Compile Python packages (pandas, numpy, etc.)

### Stage 2: Runtime
- Base: `python:3.11-alpine`
- Install: `libstdc++` (runtime library for pandas/numpy)
- Copy: Only installed packages from builder
- Result: Minimal runtime image (~150-200MB)

## ✅ Package Compatibility

### Tested Packages:
- ✅ `fastapi` - Works on Alpine
- ✅ `uvicorn[standard]` - Works on Alpine
- ✅ `pandas` - Works on Alpine (needs build tools + libstdc++)
- ✅ `python-multipart` - Works on Alpine

### Build Requirements:
- `gcc`, `g++` - C/C++ compiler
- `musl-dev` - C library headers
- `linux-headers` - Linux kernel headers
- `libffi-dev` - Foreign function interface

### Runtime Requirements:
- `libstdc++` - C++ standard library (for pandas/numpy)

## 🚀 Expected Results

### Image Sizes:

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| API Base | 150MB | 50MB | 100MB |
| API Full | 450MB | 150-200MB | 250-300MB |
| Frontend | 25MB | 25MB | 0MB (already optimized) |
| **Total** | **475MB** | **175-225MB** | **~300MB (63%)** |

## ⚠️ Important Notes

1. **Build Time**: Slightly longer (compiling from source)
2. **Compatibility**: Most Python packages work, but some may need adjustments
3. **Testing**: Always test after switching to Alpine
4. **Rollback**: Can revert to `slim` if issues occur

## 🔍 Verification

After building, check image size:

```bash
docker images | grep ditto-api
docker images | grep ditto-frontend
```

Expected:
- `ditto-api`: ~150-200MB
- `ditto-frontend`: ~25-30MB

## 🎯 Summary

- ✅ API: Switched to `python:3.11-alpine`
- ✅ Frontend: Already using `nginx:alpine`
- ✅ Multi-stage build maintained
- ✅ Build tools removed from final image
- ✅ Expected 55-67% size reduction

**Total savings: ~300MB per deployment!**
