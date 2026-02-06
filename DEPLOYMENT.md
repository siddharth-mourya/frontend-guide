# Deployment Guide

This document provides instructions for deploying your Docusaurus interview preparation site to various hosting platforms.

## 🚀 Quick Deploy to Vercel (Recommended)

### Option 1: Using Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from the project directory**:
   ```bash
   cd interview-docusaurus
   vercel
   ```

3. **Follow the prompts**:
   - Set up and deploy: `Y`
   - Which scope: Choose your account
   - Link to existing project: `N`
   - Project name: `interview-prep-docs` (or your preferred name)
   - Directory: `./`
   - Want to modify settings: `N`

4. **Production deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Using Vercel Dashboard

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Interview prep docs"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import in Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Docusaurus and configure automatically
   - Click "Deploy"

### Environment Configuration

The `vercel.json` file is already configured with:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "docusaurus"
}
```

## 📦 Deploy to Netlify

### Option 1: Using Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the site**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=build
   ```

### Option 2: Using Netlify Dashboard

1. **Push code to GitHub** (see Vercel instructions above)

2. **Import in Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect to GitHub and select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `build`
   - Click "Deploy site"

## 🌐 Deploy to GitHub Pages

1. **Update `docusaurus.config.ts`**:
   ```typescript
   const config: Config = {
     url: 'https://<username>.github.io',
     baseUrl: '/<repository-name>/',
     organizationName: '<username>',
     projectName: '<repository-name>',
     // ... rest of config
   };
   ```

2. **Deploy**:
   ```bash
   GIT_USER=<your-github-username> npm run deploy
   ```

## ☁️ Deploy to AWS Amplify

1. **Push code to GitHub/GitLab/Bitbucket**

2. **In AWS Amplify Console**:
   - Choose "Host web app"
   - Connect your repository
   - Build settings (auto-detected):
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm install
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: build
         files:
           - '**/*'
       cache:
         paths:
           - node_modules/**/*
     ```
   - Save and deploy

## 🔧 Build Commands Reference

### Development
```bash
npm start              # Start development server
npm run start -- --port 3001  # Start on different port
```

### Production Build
```bash
npm run build          # Build static site
npm run serve          # Serve production build locally
```

### Clear Cache
```bash
npm run clear          # Clear Docusaurus cache
```

## 🎯 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test search functionality
- [ ] Check responsive design on mobile
- [ ] Verify all code syntax highlighting works
- [ ] Test dark/light mode toggle
- [ ] Check all collapsible sections work
- [ ] Verify navigation sidebar
- [ ] Test all internal links

## 🐛 Troubleshooting

### Build Errors

**MDX Compilation Errors**:
- Ensure `<details>` tags have proper spacing
- Wrap TypeScript generics like `<T>` in backticks when in bold text
- Check for escaped characters that might confuse the parser

**Missing Dependencies**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Cache Issues**:
```bash
npm run clear
npm run build
```

### Deployment Issues

**Vercel Build Timeout**:
- The build should complete within 15 minutes
- If timing out, check for infinite loops in content

**404 on Routes**:
- Verify `baseUrl` in `docusaurus.config.ts`
- Check that all file paths are correct

**Search Not Working**:
- Search is built during build time
- Ensure build completed successfully
- Clear browser cache

## 📝 Custom Domain Setup

### Vercel
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Netlify
1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Configure DNS records as shown

## 🔄 Continuous Deployment

Both Vercel and Netlify offer automatic deployments:

- **Push to main branch** → Automatic production deployment
- **Push to other branches** → Preview deployments
- **Pull requests** → Preview URLs for review

Configure branch deployments in your platform's dashboard.

## 📊 Analytics (Optional)

Add analytics by updating `docusaurus.config.ts`:

```typescript
themeConfig: {
  // Google Analytics
  gtag: {
    trackingID: 'G-XXXXXXXXXX',
    anonymizeIP: true,
  },
}
```

## 🎉 Success!

Your interview preparation documentation is now live and accessible to help you prepare for senior frontend engineering interviews!

---

**Need help?** Check the [Docusaurus deployment docs](https://docusaurus.io/docs/deployment) for more details.
