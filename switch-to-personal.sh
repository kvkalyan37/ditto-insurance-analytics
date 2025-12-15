#!/bin/bash
# ============================================
# Switch to Personal GitHub and Docker Hub Accounts
# ============================================

echo "🔄 Switching to Personal Accounts"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get personal GitHub username
echo -e "${BLUE}Enter your personal GitHub username:${NC}"
read -r PERSONAL_GITHUB_USERNAME

# Check current remote
echo ""
echo -e "${YELLOW}Current Git remote:${NC}"
git remote -v

echo ""
echo -e "${YELLOW}Do you want to change the remote? (y/n)${NC}"
read -r CHANGE_REMOTE

if [ "$CHANGE_REMOTE" = "y" ] || [ "$CHANGE_REMOTE" = "Y" ]; then
    # Remove old remote
    git remote remove origin 2>/dev/null || true
    
    # Add personal remote
    git remote add origin "https://github.com/$PERSONAL_GITHUB_USERNAME/ditto-insurance.git"
    
    echo -e "${GREEN}✓ Remote updated to personal GitHub${NC}"
    echo ""
    echo -e "${YELLOW}New remote:${NC}"
    git remote -v
fi

echo ""
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}Next Steps:${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""
echo "1. Create personal Docker Hub repositories:"
echo "   - ditto-frontend (public)"
echo "   - ditto-api (public)"
echo ""
echo "2. Get personal Docker Hub token:"
echo "   https://hub.docker.com/settings/security"
echo ""
echo "3. Update GitHub Secrets:"
echo "   https://github.com/$PERSONAL_GITHUB_USERNAME/ditto-insurance/settings/secrets/actions"
echo "   - DOCKERHUB_USERNAME = Your personal Docker Hub username"
echo "   - DOCKERHUB_TOKEN = Your personal Docker Hub token"
echo ""
echo "4. Test with a push:"
echo "   git push -u origin main"
echo ""
echo -e "${GREEN}✓ Script complete!${NC}"
