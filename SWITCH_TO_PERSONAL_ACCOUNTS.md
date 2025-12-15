# Switch from Office to Personal Accounts

This guide helps you switch from your office/work GitHub and Docker Hub accounts to your personal accounts.

---

## 🔄 Step 1: Switch GitHub Repository

### Option A: Change Remote URL (If Repository Already Exists)

If you already pushed to your office GitHub account, change the remote:

```bash
cd /Users/c27979e/Downloads/Cursor_Projects

# Check current remote
git remote -v

# Remove office remote
git remote remove origin

# Add personal remote (replace YOUR_PERSONAL_USERNAME)
git remote add origin https://github.com/YOUR_PERSONAL_USERNAME/ditto-insurance.git

# Verify
git remote -v

# Push to personal account
git push -u origin main
```

### Option B: Create New Repository (Recommended)

1. **Log out of office GitHub** (if logged in)
2. **Log in to personal GitHub**: https://github.com/login
3. **Create new repository**: https://github.com/new
   - Name: `ditto-insurance`
   - Public (recommended)
   - Don't initialize with README
4. **Push code**:
   ```bash
   cd /Users/c27979e/Downloads/Cursor_Projects
   git remote remove origin  # Remove office remote
   git remote add origin https://github.com/YOUR_PERSONAL_USERNAME/ditto-insurance.git
   git push -u origin main
   ```

---

## 🐳 Step 2: Switch Docker Hub Account

### Create Personal Docker Hub Repositories

1. **Log out of office Docker Hub** (if logged in)
2. **Log in to personal Docker Hub**: https://hub.docker.com/login
3. **Create repositories**:
   - Go to: https://hub.docker.com/repository/create
   - Create: `ditto-frontend` (public)
   - Create: `ditto-api` (public)

### Get Personal Docker Hub Token

1. **Go to**: https://hub.docker.com/settings/security
2. **Click**: "New Access Token"
3. **Name**: `github-actions-personal` (or any name)
4. **Permissions**: Read & Write
5. **Copy the token** (save it!)

---

## 🔐 Step 3: Update GitHub Secrets

### Update Secrets in Personal GitHub Repository

1. **Go to your personal GitHub repository**:
   - `https://github.com/YOUR_PERSONAL_USERNAME/ditto-insurance/settings/secrets/actions`

2. **Update or Add Secrets**:

   **Secret 1: DOCKERHUB_USERNAME**
   - Click on existing secret (if exists) → "Update"
   - OR Click "New repository secret"
   - Name: `DOCKERHUB_USERNAME`
   - Value: Your **personal** Docker Hub username
   - Click "Update secret" or "Add secret"

   **Secret 2: DOCKERHUB_TOKEN**
   - Click on existing secret (if exists) → "Update"
   - OR Click "New repository secret"
   - Name: `DOCKERHUB_TOKEN`
   - Value: Your **personal** Docker Hub token (from Step 2)
   - Click "Update secret" or "Add secret"

---

## 🔍 Step 4: Verify Configuration

### Check Git Remote

```bash
cd /Users/c27979e/Downloads/Cursor_Projects
c
```

Should show your **personal** GitHub URL:
```
origin  https://github.com/YOUR_PERSONAL_USERNAME/ditto-insurance.git
```

### Check GitHub Secrets

1. Go to: `https://github.com/YOUR_PERSONAL_USERNAME/ditto-insurance/settings/secrets/actions`
2. Verify:
   - ✅ `DOCKERHUB_USERNAME` = Your personal Docker Hub username
   - ✅ `DOCKERHUB_TOKEN` = Your personal Docker Hub token

### Test the Connection

1. **Make a small change** (or just push again):
   ```bash
   git add .
   git commit -m "Switch to personal accounts"
   git push
   ```

2. **Check GitHub Actions**:
   - Go to: `https://github.com/YOUR_PERSONAL_USERNAME/ditto-insurance/actions`
   - Workflow should start automatically
   - Check logs to verify it's using personal Docker Hub

3. **Check Docker Hub**:
   - Go to: `https://hub.docker.com/r/YOUR_PERSONAL_USERNAME/ditto-frontend`
   - Images should appear after workflow completes

 <KVK>  

---

## 🔄 Step 5: Update Workflow Files (If Needed)

The workflow files should automatically use the secrets, but verify:

### Check Workflow Files

The workflows use environment variables:
```yaml
env:
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  DOCKERHUB_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}
```

**No changes needed** - they automatically use the secrets you set!

---

## 🧹 Step 6: Clean Up Office Account (Optional)

### Remove from Office GitHub (If Needed)

1. Go to office GitHub repository
2. Settings → Danger Zone → Delete repository
3. (Only if you don't need it anymore)

### Remove from Office Docker Hub (If Needed)

1. Go to office Docker Hub
2. Delete repositories if not needed
3. (Only if you don't need them anymore)

---

## ✅ Verification Checklist

After switching:

- [ ] Git remote points to personal GitHub
- [ ] GitHub Secrets use personal Docker Hub credentials
- [ ] Personal Docker Hub repositories exist
- [ ] Test push triggers workflow
- [ ] Images appear in personal Docker Hub
- [ ] Workflow logs show personal Docker Hub username

---

## 🆘 Troubleshooting

### "Permission denied" when pushing

**Problem**: Git is using office credentials

**Solution**:
```bash
# Check Git config
git config user.name
git config user.email

# Update to personal (if needed)
git config user.name "Your Personal Name"
git config user.email "your.personal@email.com"

# Or use GitHub CLI
gh auth login
```

### Workflow fails with "unauthorized"

**Problem**: Using office Docker Hub credentials

**Solution**:
1. Verify GitHub Secrets use personal credentials
2. Check Docker Hub token is valid
3. Re-create token if needed

### Images not appearing in personal Docker Hub

**Problem**: Workflow using wrong account

**Solution**:
1. Check workflow logs in Actions tab
2. Verify secrets are correct
3. Check repository names match exactly

---

## 🔐 Security Best Practices

### Use Personal Access Tokens

- ✅ Use tokens, not passwords
- ✅ Tokens have limited scope
- ✅ Can be revoked easily
- ✅ Better security

### Separate Accounts

- ✅ Keep work and personal separate
- ✅ Use different browsers/profiles
- ✅ Use different SSH keys
- ✅ Clear credentials when switching

---

## 📝 Quick Reference

### Switch Git Remote
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_PERSONAL_USERNAME/ditto-insurance.git
git push -u origin main
```

### Update GitHub Secrets
1. Go to: Repo → Settings → Secrets → Actions
2. Update: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`

### Verify
```bash
git remote -v  # Check remote
# Check Actions tab for workflow runs
# Check Docker Hub for images
```

---

## 🎯 Summary

**To switch to personal accounts:**

1. ✅ Change Git remote to personal GitHub
2. ✅ Create personal Docker Hub repositories
3. ✅ Get personal Docker Hub token
4. ✅ Update GitHub Secrets
5. ✅ Test with a push

**That's it!** Your workflows will now use your personal accounts automatically.

---

**Need help?** Check the workflow logs in the Actions tab - they show exactly what's happening!

