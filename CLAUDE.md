# Jaydus AI Platform - Working Guide

## Quick Info
- **Working Directory**: `/Users/local-dev/CloudFlare-Jaydus`
- **Live Site**: `https://jaydus.ai`
- **Cloudflare Project**: `jaydus-ai-platform`
- **Deploy**: `wrangler pages deploy . --project-name jaydus-ai-platform`

## Before Starting Work
```bash
# Just make sure you're in the right place
cd /Users/local-dev/CloudFlare-Jaydus
pwd

# Get latest code
git pull origin main
```

## Project Structure
```
/Users/local-dev/CloudFlare-Jaydus/
├── index.html          # Main entry point
├── assets/
│   ├── css/
│   │   └── main.css    # Modular CSS architecture (16 component files)
│   └── js/
│       └── app.js      # React app (Babel transpiled)
├── functions/
│   └── api/
│       ├── [[path]].js # Handles all /api/* routes
│       └── health.js   # Health check endpoint
├── _headers            # Cache control and security headers
├── wrangler.toml       # Cloudflare configuration
└── _routes.json        # Routing configuration
```

## Authentication System
- **Current Status**: Production-ready (bypasses authentication for seamless UX)
- **Behavior**: Users go directly to the application without authentication forms
- **Implementation**: State initialized with `isAuthenticated: true` and `showAuthForm: false`
- **Note**: Can be integrated with real auth provider by modifying the authentication flow

## What We're Actually Using

### Active APIs
- **AIML API** (`AIML_API_KEY`) - GPT-4o for chat
- **Luma API** (`LUMA_API_KEY`) - Image generation  
- **Serper API** (`SERPER_API_KEY`) - Web search/crawling

### NOT Using Anymore
- ❌ OpenRouter - removed
- ❌ Perplexity - replaced with GPT-4o + Serper
- ❌ Demo/mock data - all removed

## API Endpoints
- `/api/chat` - Chat with GPT-4o (via AIML)
- `/api/images` - Image generation (AIML + Luma)
- `/api/search` - Web search (GPT-4o + Serper crawling)
- `/api/health` - Check if everything's working

## Making Changes & Deploying

When you need to update something:
```bash
# Edit your files
# Then deploy when ready:
wrangler pages deploy . --project-name jaydus-ai-platform
```

Only commit to git when specifically asked.

## Quick Tests
```bash
# Check if site is healthy
curl https://jaydus.ai/api/health

# Test locally before deploying
wrangler pages dev .
```

## Environment Variables 
These are already set in Cloudflare:
- `AIML_API_KEY` - GPT-4o chat
- `LUMA_API_KEY` - Image generation
- `SERPER_API_KEY` - Web search

## Common Fixes

**If auth form shows up:**
- Check `isAuthenticated` is set to `true` in app.js
- Check `showAuthForm` is set to `false` in app.js

**If changes don't show:**
- Update version numbers in index.html (e.g., v=1.1.1)
- Wait 1-2 minutes for CDN to update
- Try incognito/private browsing

## Important Notes
- We're NOT using jaydus-ai-production (wrong project)
- Always use jaydus-ai-platform for deploys
- Authentication is bypassed - users go straight to the app
- No more demo data anywhere