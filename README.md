# Senior Frontend Interview Preparation

A comprehensive documentation site for senior-level frontend engineering interview preparation.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## 📦 Deployment

### Deploy to Vercel

1. **Using Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Using GitHub Integration:**
   - Push your code to GitHub
   - Import your repository in Vercel dashboard
   - Vercel will auto-detect Docusaurus and deploy

3. **Manual Configuration:**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### Deploy to Netlify

1. **Using Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

2. **Using Netlify Dashboard:**
   - Build command: `npm run build`
   - Publish directory: `build`

## 📚 Features

- **🔍 Full-text Search**: Built-in local search functionality
- **📱 Responsive Design**: Mobile-friendly documentation
- **🌙 Dark Mode**: Automatic theme switching
- **📑 Organized Content**: Categorized by domain (JavaScript, React, TypeScript, etc.)
- **🎯 Interview Focused**: Quick revision + deep understanding sections
- **💡 Code Examples**: Syntax-highlighted code snippets
- **🔖 Collapsible Sections**: Organized with details/summary tags

## 🗂️ Content Structure

- **JavaScript**: Core concepts, advanced topics, design patterns
- **TypeScript**: Type system, advanced types, generics
- **React**: Hooks, patterns, fiber architecture, concurrent features
- **Next.js**: App router, server components, optimization
- **Browser**: Internals, APIs, web vitals
- **Network**: HTTP, caching, authentication
- **Security**: XSS, CSRF, CSP
- **Performance**: Optimization techniques, lazy loading
- **Accessibility**: ARIA, keyboard navigation
- **Styling**: CSS-in-JS, CSS modules, modern CSS
- **Tooling**: Build systems, bundlers, testing

## 🛠️ Tech Stack

- **Framework**: Docusaurus 3
- **Language**: TypeScript
- **Search**: Local search plugin
- **Deployment**: Vercel/Netlify ready
- **Styling**: Custom CSS with dark mode

## 📝 Contributing

To add new content:

1. Create markdown files in the appropriate directory
2. Follow the existing format (⚡ Quick Revision + 🧠 Deep Understanding)
3. Update `sidebars.ts` if adding new categories
4. Test locally with `npm start`

## 📄 License

This project is for educational purposes.
