# 🧰 **1. Tooling, Linting & DevOps Integration**

### **1.1 Build Tools & Bundlers**

> Tools that compile, bundle, and optimize your code for production.

- Webpack → Loaders, plugins, chunking, tree-shaking, `SplitChunksPlugin`
- Vite → dev-server architecture, pre-bundling (esbuild), HMR
- Rollup → for libraries, ESM focus
- SWC / esbuild → faster JS/TS compilation
- Babel → transpilation, presets, polyfills
- Source maps & debugging in production
- Module federation (for microfrontends)
- Comparing: Webpack vs Vite vs Rollup (pros/cons)

### **1.2 Package Management & Monorepos**

- npm, yarn, pnpm (linking, lockfiles, workspace differences)
- Nx → workspace structure, dependency graph, boundaries, generators
- Lerna → versioning, publishing libraries
- pnpm workspaces for shared code
- Semantic versioning (`semver`)
- Module boundaries & project graph visualization

### **1.3 Code Quality & Linting**

- ESLint → rules, extending configs (`airbnb`, `react`, `typescript`)
- Prettier → formatting integration with ESLint
- Husky → pre-commit hooks
- lint-staged → lint only staged files
- SonarQube / Code Climate → static analysis & quality gates
- Commit conventions → Conventional Commits, Commitlint, Semantic Release

### **1.4 Continuous Integration / Deployment**

- CI basics → build, test, deploy pipelines
- GitHub Actions → workflow YAMLs, caching, artifacts
- GitLab / Jenkins pipelines
- Environment handling (`.env`, `.env.local`, secrets)
- Auto versioning & tagging
- CD concepts → canary, blue-green, rolling deployment
- Using Vercel / Netlify / AWS Amplify for FE deploys

### **1.5 Containerization & Infra Awareness**

- Docker basics → Dockerfile, layers, multi-stage builds
- docker-compose for multi-service dev setups
- Image caching and optimization
- Containerized CI/CD pipelines
- Basics of Kubernetes & Helm for front-end hosting

---

# 🏗️ **2. Architecture & System Design for Front-End**

### **2.1 App-Level Architectures**

- Monolith vs Microfrontend
- Monorepo vs Polyrepo setups
- Nx-based modular architecture
- Module federation → remote/host apps
- Lerna for independent libraries
- Multi-tenant architecture in front-end

### **2.2 Component Architecture & Patterns**

- Atomic design principles
- Presentational vs Container components
- Smart/Dumb component separation
- Higher-Order Components (HOC) vs Render Props vs Hooks
- Dependency Injection in React (context, providers)
- Composition over inheritance

### **2.3 Design System Architecture**

- Centralized component library (Storybook, Chromatic)
- Design tokens (colors, spacing, typography)
- Theming (dark/light modes)
- Versioned component packages
- Accessibility baked into design system

### **2.4 State & Data Layer Architecture**

- Global state → Redux, Zustand, Recoil
- Query layer → React Query, Apollo Client
- Data synchronization and cache invalidation
- Error boundary design
- Offline support → Service Workers + IndexedDB

### **2.5 Integration & Communication**

- REST conventions (pagination, filters, status codes)
- GraphQL (queries, mutations, subscriptions)
- WebSocket & SSE for realtime data
- API versioning and backward compatibility
- Authentication → JWT, OAuth2, cookie vs token auth
- Authorization → RBAC / ABAC models
- Audit logging & tracing

### **2.6 System Design Mindset (Front-End Side)**

- Scaling front-ends for large apps
- Lazy loading micro-modules
- Feature flag architecture
- Error isolation per route / per feature
- Config-driven UI (dynamic rendering from JSON)

---

# ⚡ **3. Performance Optimization & Scalability**

### **3.1 Rendering & Load Optimization**

- Code splitting (`React.lazy`, dynamic imports)
- Tree shaking (Webpack, Rollup)
- Bundle analysis (Webpack Bundle Analyzer, Source Map Explorer)
- Async/defer scripts, preload/prefetch links
- Image optimization → responsive images, WebP, lazy loading
- Font optimization → subset fonts, `font-display`
- Reduce render thrashing (reflows/repaints)

### **3.2 Runtime Performance**

- Memoization (`useMemo`, `useCallback`, React.memo)
- Virtualization for large lists (React Window, Virtuoso)
- Avoid unnecessary re-renders (PureComponent, key usage)
- Debounce/throttle expensive events
- React Profiler for analyzing components
- useTransition & useDeferredValue (React 18+)
- Offloading heavy computation → Web Workers

### **3.3 Network & Data Optimization**

- HTTP/2 multiplexing, HTTP/3 awareness
- Gzip / Brotli compression
- API batching / caching / pagination
- CDN caching (Cache-Control, ETag, immutable assets)
- SW caching for offline readiness
- Prefetching next routes / resources
- GraphQL caching (Apollo normalized cache, React Query stale time)

### **3.4 Build & Deployment Performance**

- Minification (Terser, SWC)
- Image/CDN optimization
- Bundle size thresholds
- Server-side caching (Next.js ISR, revalidation)
- Lighthouse & Core Web Vitals (LCP, CLS, FID)
- Performance budgets in CI/CD

### **3.5 Scalability Concerns**

- Handling 10k+ components or 1M+ records (virtual DOM efficiency)
- Distributed caching strategy
- CDN invalidation strategy
- Dynamic imports per tenant or locale
- Configurable theming & modularization for large orgs

---

# 🎨 **4. CSS & UI Engineering (Deep Breakdown)**

### **4.1 Fundamentals**

- Box model, specificity, inheritance
- Positioning (relative, absolute, sticky, fixed)
- Display types, overflow, z-index
- Units (`em`, `rem`, `vh`, `%`)

### **4.2 Layout Systems**

- Flexbox → alignment, wrapping, ordering
- CSS Grid → implicit/explicit grids, named lines, areas
- Responsive breakpoints
- Container queries
- Multi-column layouts

### **4.3 Styling Approaches**

- BEM methodology
- CSS Modules
- Styled Components, Emotion
- TailwindCSS → utility classes, theme config
- Inline styles vs CSS-in-JS tradeoffs
- Design tokens & theming

### **4.4 Advanced Styling**

- Pseudo-classes (`:hover`, `:focus`, `:nth-child`)
- Pseudo-elements (`::before`, `::after`)
- Animations & transitions (keyframes, Framer Motion)
- CSS variables (custom properties)
- SASS/LESS → nesting, mixins, extends
- CSS Houdini & custom properties pipeline

### **4.5 UI Frameworks / Component Libraries**

- Material UI, Chakra UI, Ant Design, Shadcn
- Building custom design systems
- Accessibility-first UI design (focus rings, skip links)
- Theme providers (dark/light mode)

### **4.6 Accessibility Integration**

- Semantic HTML
- ARIA roles, labels, live regions
- Focus management
- Color contrast compliance (WCAG 2.1 AA/AAA)
- Motion reduction media queries (`prefers-reduced-motion`)
- Localization (RTL support, `<html lang>` attributes for Chinese/Arabic)

### **4.7 UI Testing**

- Visual regression (Chromatic, Percy)
- Accessibility testing (axe, Lighthouse)
- Snapshot testing with Storybook

---

# 💼 **5. Product Awareness & Real-World Scenarios**

### **5.1 UX & Product Integration**

- Loading states, skeleton screens
- Error states, empty states
- Retry logic & API fallback UIs
- Confirmation modals, optimistic updates
- Infinite scroll vs pagination UX
- Scroll restoration between routes
- Form optimization (debounced validations)

### **5.2 Monitoring & Logging**

- Sentry, Datadog, LogRocket
- Centralized logging (client + server correlation IDs)
- Audit logs per action
- Handling 400/500 gracefully

### **5.3 SEO & Analytics**

- Meta tags, OpenGraph, structured data
- Sitemap, robots.txt
- Analytics integration (GA4, Segment, Mixpanel)
- AB testing (Optimizely, LaunchDarkly feature flags)
- Schema.org tags

### **5.4 Localization & Internationalization**

- i18n libraries (react-i18next, next-intl)
- RTL layouts (Arabic/Hebrew)
- Unicode & encoding (UTF-8 vs GB2312 for Chinese)
- Number/date/locale formatting
- Dynamic language switching

### **5.5 Security & Compliance**

- Input sanitization
- Preventing XSS & CSRF
- CORS policies & preflight requests
- Content-Security-Policy (CSP)
- GDPR compliance (cookie consent, data storage)

### **5.6 Versioning & Maintenance**

- Semantic versioning for FE libraries
- Feature toggles (LaunchDarkly, ConfigCat)
- Backward-compatible UI changes
- Blue-green deployment & rollback

### **5.7 Common Product Scenarios / Challenges**

- Handling multi-tab session conflicts
- Avoiding hydration mismatches in Next.js
- Displaying Chinese/Japanese characters correctly → `<meta charset="UTF-8">`, `<html lang="zh">`
- Preventing infinite renders in React
- Large dataset virtualization (10k+ rows table)
- Cross-browser inconsistencies (Safari input issues)
- Integrating payment gateways (3-D secure flows)
- Working behind corporate proxies
- Managing long-lived JWTs & token refresh cycles

---
