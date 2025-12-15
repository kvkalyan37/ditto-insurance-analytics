#!/bin/bash
# ============================================
# Project Cleanup Script
# Removes unwanted files and directories
# ============================================

set -e  # Exit on error

echo "🧹 Starting project cleanup..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to safely remove directory
remove_dir() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}Removing:${NC} $dir"
        rm -rf "$dir"
        echo -e "${GREEN}✓ Removed${NC}"
    else
        echo -e "${YELLOW}Skipping (not found):${NC} $dir"
    fi
}

# Function to safely remove file
remove_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${YELLOW}Removing:${NC} $file"
        rm -f "$file"
        echo -e "${GREEN}✓ Removed${NC}"
    else
        echo -e "${YELLOW}Skipping (not found):${NC} $file"
    fi
}

echo "=========================================="
echo "Removing Next.js Project Files"
echo "=========================================="
remove_dir "app"
remove_dir ".next"
remove_file "next-env.d.ts"
remove_dir "components"
remove_dir "contexts"
remove_dir "lib"
remove_dir "prisma"

echo ""
echo "=========================================="
echo "Removing Unused Services"
echo "=========================================="
remove_dir "services"

echo ""
echo "=========================================="
echo "Removing Old Kubernetes Manifests"
echo "=========================================="
remove_dir "k8s"

echo ""
echo "=========================================="
echo "Removing Build Artifacts"
echo "=========================================="
remove_dir "node_modules"
remove_dir "__pycache__"
remove_dir "venv_scraper"
remove_dir ".next"

echo ""
echo "=========================================="
echo "Removing Logs & Data Files"
echo "=========================================="
remove_dir "logs"
remove_file "scrape_output.log"
remove_file "ditto_insurance_data.csv"
remove_dir "data"

echo ""
echo "=========================================="
echo "Removing Package Files (if unused)"
echo "=========================================="
# Only remove if they exist and we're not using Node.js
if [ -f "package-lock.json" ] && [ ! -f "package.json" ]; then
    remove_file "package-lock.json"
fi

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo -e "${GREEN}✓ All unwanted files and directories removed${NC}"
echo ""
echo "Remaining project structure:"
echo "  ✓ scrape_ditto.py"
echo "  ✓ api_service/"
echo "  ✓ frontend/"
echo "  ✓ helm/"
echo "  ✓ .github/workflows/"
echo "  ✓ scripts/"
echo "  ✓ Documentation files (*.md)"
echo ""
echo "Note: Build artifacts are already in .gitignore"
echo "      They won't be committed to Git"

