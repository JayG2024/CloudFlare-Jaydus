# Jaydus AI Platform - Development Workflow

## Critical Project Information
- **Local Directory**: `/Users/local-dev/CloudFlare-Jaydus`
- **GitHub Repository**: `JayG2024/CloudFlare-Jaydus`
- **Production URL**: `https://jaydus.ai`
- **Cloudflare Project**: `jaydus-ai-platform` (ONLY THIS ONE - NOT jaydus-ai-production)
- **Deploy Command**: `wrangler pages deploy . --project-name jaydus-ai-platform`

## IMPORTANT: Pre-Work Checklist
**ALWAYS run these commands before making ANY changes:**

```bash
# 1. Verify we're in the correct directory
pwd
# MUST show: /Users/local-dev/CloudFlare-Jaydus

# 2. Check Git status
git status

# 3. Pull latest changes from GitHub
git pull origin main

# 4. Verify Cloudflare project
wrangler pages project list
# ONLY use: jaydus-ai-platform (has jaydus.ai domain)
```

## Project Structure
```
/Users/local-dev/CloudFlare-Jaydus/
├── index.html          # Main entry point
├── assets/
│   ├── css/
│   │   └── styles.css  # Main styles
│   └── js/
│       └── app.js      # React app (Babel transpiled)
├── functions/
│   └── api/
│       ├── [[path]].js # Handles all /api/* routes
│       └── health.js   # Health check endpoint
├── wrangler.toml       # Cloudflare configuration
└── _routes.json        # Routing configuration
```

## Authentication System
- **Current Status**: Demo authentication (always succeeds)
- **Endpoints**:
  - `/api/auth/login` - Demo login
  - `/api/auth/register` - Demo registration
  - `/api/auth/reset-password` - Demo password reset
- **Note**: Returns demo tokens for development. Real auth system needs to be integrated.

## API Endpoints
All APIs are in `/functions/api/[[path]].js`:
- `/api/chat` - Chat completions (AIML API)
- `/api/images` - Image generation (AIML + Luma APIs)
- `/api/search` - Web search (Perplexity Sonar)
- `/api/auth/*` - Authentication endpoints

## Development Workflow

### Making Changes
1. **Always verify directory first**:
   ```bash
   pwd  # Must be /Users/local-dev/CloudFlare-Jaydus
   ```

2. **Check current state**:
   ```bash
   git status
   git pull origin main
   ```

3. **Make your changes**
   - Edit files in correct locations
   - Test locally if needed

4. **Commit changes** (ONLY when asked):
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

5. **Deploy to Cloudflare** (ONLY when asked):
   ```bash
   wrangler pages deploy . --project-name jaydus-ai-platform
   ```
   **NEVER use jaydus-ai-production**

## Testing Commands
```bash
# Test locally (if needed)
wrangler pages dev .

# Check deployment status
wrangler pages deployment list --project-name jaydus-ai-platform

# View logs
wrangler pages deployment tail --project-name jaydus-ai-platform
```

## Environment Variables (Set in Cloudflare Dashboard)
- `AIML_API_KEY` - For chat and image models
- `LUMA_API_KEY` - For Photon image models
- `PERPLEXITY_API_KEY` - For search functionality
- `RATE_LIMIT_KV` - KV namespace for rate limiting (optional)

## Common Issues & Solutions

### Wrong Directory
- **Issue**: Changes not appearing, wrong files edited
- **Solution**: Always run `pwd` first, must be `/Users/local-dev/CloudFlare-Jaydus`

### Wrong Cloudflare Project
- **Issue**: Deploying to wrong project (jaydus-ai-production)
- **Solution**: ONLY use `--project-name jaydus-ai-platform` in deploy command

### Authentication Not Working
- **Current State**: Demo auth always succeeds for development
- **Production TODO**: Integrate real auth system (Auth0, Firebase, etc.)

### Git Push Errors
- **Solution**: Always pull first: `git pull origin main`

## CRITICAL REMINDERS
1. **NEVER** use `jaydus-ai-production` project
2. **ALWAYS** verify directory with `pwd` before any work
3. **ALWAYS** pull latest changes before editing
4. **ONLY** commit when explicitly asked by user
5. **ONLY** deploy when explicitly asked by user
6. **ALWAYS** use `--project-name jaydus-ai-platform` for deployments

## Quick Reference Commands
```bash
# Start of every session
cd /Users/local-dev/CloudFlare-Jaydus && pwd && git pull origin main

# Deploy (when asked)
wrangler pages deploy . --project-name jaydus-ai-platform

# Check what's deployed
curl https://jaydus.ai/api/health
```