# Deployment Guide

## Cloudflare Pages Setup

### Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Domain Configuration**: Add your domain to Cloudflare DNS
3. **GitLab Integration**: Connect your GitLab repository to Cloudflare Pages

### GitLab CI/CD Variables

Configure these environment variables in your GitLab project:

**Settings → CI/CD → Variables**

- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Your Cloudflare Pages project name (e.g., "frise-chezmehdi-net")

### Getting Cloudflare Credentials

1. **API Token**: 
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Create token with "Cloudflare Pages:Edit" permissions
   
2. **Account ID**:
   - Find in the right sidebar of any domain overview in your Cloudflare dashboard

3. **Project Name**:
   - Create a new Pages project in [Cloudflare Pages](https://dash.cloudflare.com/pages)
   - Use the project name in the `CLOUDFLARE_PROJECT_NAME` variable

### Deployment Process

#### Automatic Deployment

The GitLab CI pipeline includes:

- **Quality Checks**: Linting, testing, type checking (if configured)
- **Build**: Production build with Vite
- **Manual Deploy**: Production deployment to main branch requires manual trigger

#### Manual Deployment Steps

1. **Push to main branch**
2. **Go to GitLab CI/CD Pipelines**
3. **Click "Manual" on the `deploy:production` job**
4. **Monitor deployment logs**

#### Branch-Based Deployments

- `main` → Production: https://frise.chezmehdi.net
- `develop` → Staging: https://develop.frise.chezmehdi.net
- `merge_requests` → Preview builds (manual trigger)

### Local Development with Wrangler

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Preview locally
wrangler pages dev dist

# Deploy manually
npm run build
wrangler pages publish dist --project-name=your-project-name
```

### Custom Domain Setup

1. **In Cloudflare Pages Dashboard**:
   - Go to your project → Custom domains
   - Add `frise.chezmehdi.net`
   - Add `develop.frise.chezmehdi.net` for staging

2. **DNS Configuration**:
   - Add CNAME record: `frise` → `your-project.pages.dev`
   - Add CNAME record: `develop.frise` → `your-project.pages.dev`

### Build Configuration

The pipeline uses:
- **Node.js 18** (Alpine Linux)
- **Vite build system**
- **Caching** for node_modules
- **Artifact storage** for build outputs

### Troubleshooting

**Build Failures**:
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors

**Deployment Issues**:
- Verify Cloudflare credentials are set correctly
- Check project name matches exactly
- Ensure domain is properly configured in Cloudflare

**Permission Errors**:
- API token needs "Cloudflare Pages:Edit" permission
- Account ID must match the token's account