# 🧩 1. Core JavaScript & TypeScript (Deep Foundations)

> You can’t skip this — this is what distinguishes an intermediate from a senior dev.

---

## **1.1 JavaScript Core Concepts**

- ✅ Data types & coercion, `==` vs `===`, `typeof`, `instanceof`
- ✅ Scope, closures, lexical environment, lexical scope
- ✅ Hoisting, temporal dead zone, variable lifetime
- ✅ Execution context, call stack, event loop, task/microtask queue
- ✅ `this` keyword (function vs arrow)
- ✅ Functions: declaration vs expression, IIFE, higher-order functions
- ✅ Async JS: callbacks, promises, async/await, error handling
- ✅ try/catch, promise rejection, `unhandledRejection`
- ✅ `bind`, `call`, `apply`
- ✅ Prototypes & prototype chain
- ✅ ES6+ features: spread, rest, destructuring, template literals, optional chaining, nullish coalescing
- ✅ Generators, iterators
- ✅ Garbage collection
- ✅ Modules (import/export, dynamic import)
- ✅ Web APIs, DOM manipulation, custom events
- ✅ Event bubbling, capturing, delegation

### 🧠 **Advanced Additions**

- Polyfills, shims, and transpilation (Babel, core-js)
- Proxy & Reflect APIs
- Symbols and well-known symbols
- `Map`, `Set`, `WeakMap`, `WeakSet`
- `Object.defineProperty`, descriptors, immutability
- Memory leaks & garbage collection strategies
- Event loop deep dive (`setTimeout`, `queueMicrotask`, `process.nextTick`)
- `Intl` APIs (`Intl.DateTimeFormat`, `Intl.NumberFormat`)
- EventTarget API (`addEventListener` options: once, passive, capture)
- CustomEvent & dispatching
- Error subclassing, `Error.captureStackTrace`

---

## **1.2 Advanced JS Patterns**

- Singleton, Observer, Factory, Module, Strategy, Decorator
- Debounce, Throttle
- Memoization
- Currying, function composition
- Immutability
- Functional programming patterns

### 🧠 **Advanced Additions**

- Builder, Prototype, and Dependency Injection patterns
- Revealing Module Pattern
- Lazy loading, code splitting, prefetch/preload hints
- Tree-shaking & dead code elimination concepts
- Reactive programming (RxJS patterns)

---

## **1.3 TypeScript Essentials**

> You’ll forget syntax if you don’t revisit often.

- ✅ Basic types, enums, tuples, type aliases, interfaces
- ✅ `unknown` vs `any` vs `never`
- ✅ Generics (functions, interfaces, constraints)
- ✅ Utility types (`Partial`, `Pick`, `Omit`, `Record`)
- ✅ Type narrowing, discriminated unions
- ✅ Extending types, intersection types
- ✅ Structural typing
- ✅ Type guards, `in`, `typeof`, `instanceof`
- ✅ Declaration merging
- ✅ `as const`, `readonly`, `keyof`
- ✅ Module augmentation
- ✅ `tsconfig.json`, compiler options
- ✅ Working with React in TS (FC<Props>, ReactNode, children types)
- ✅ Nx + TypeScript strict boundaries

### 🧠 **Advanced Additions**

- Conditional types, `infer` keyword, template literal types
- Variance (covariant, contravariant)
- Mapped types, recursive types, branded types
- `ReturnType`, `InstanceType`, `NonNullable`, `Exclude`, etc.
- Type predicates & type-level programming
- Decorators & reflection metadata
- Writing `.d.ts` declaration files
- Extending global types (`declare global`)

---

# 🌐 2. Web Platform & Browser Deep Dive

> Know how the web works, not just React.

---

## **2.1 Browser Internals**

- DOM, CSSOM, render tree
- Critical rendering path
- Reflow vs repaint
- Layout shifts (CLS)
- Web Workers, Service Workers, Worklets
- Shadow DOM
- Virtual DOM vs Real DOM

### 🧠 **Advanced Additions**

- Paint phases, compositing, GPU acceleration (`will-change`)
- Avoiding forced reflows and layout thrashing
- Web Components lifecycle (`connectedCallback`, etc.)
- Clipboard, File, Notification APIs
- IntersectionObserver, ResizeObserver, MutationObserver
- AbortController for fetch cancellation
- Performance APIs (`PerformanceObserver`, `performance.now()`)
- Lighthouse & Core Web Vitals (LCP, FID, CLS, INP)

---

## **2.2 Network Fundamentals**

- HTTP methods, status codes, caching, compression
- HTTPS, SSL/TLS handshake
- HTTP/2 multiplexing
- REST vs GraphQL vs WebSockets
- CORS, CSRF
- Cookies, JWT, local/session storage
- Server-Sent Events
- Streaming, chunked transfer
- Browser caching policies

### 🧠 **Advanced Additions**

- HTTP/3 & QUIC basics
- HSTS and caching headers (`ETag`, `Cache-Control`, `Expires`)
- Preload, preconnect, DNS-prefetch
- Service Worker caching strategies (cache-first, stale-while-revalidate)
- OAuth2, PKCE, refresh tokens
- SameSite cookie attributes

---

## **2.3 Security**

- XSS, CSRF, clickjacking, CORS
- Content Security Policy (CSP)
- Sanitization & escaping
- Secure headers (Strict-Transport, X-Frame-Options)

### 🧠 **Advanced Additions**

- Trusted Types
- Cross-Origin-Opener-Policy (COOP), COEP
- Subresource Integrity (SRI)
- Sandbox iframes

---

# ⚛️ 3. React Ecosystem (Core + Modern)

> Deep React knowledge is non-negotiable for front-end interviews.

---

## **3.1 Core React**

- JSX compilation
- Components (function/class)
- Props, State, lifting state up
- Controlled vs uncontrolled inputs
- Reconciliation & Virtual DOM
- Keys and re-rendering
- Fragments, Portals
- Synthetic events
- Error boundaries
- Suspense (for data fetching & UI)
- Hydration (SSR + CSR merge)

### 🧠 **Advanced Additions**

- React Fiber architecture
- Render & commit phases
- React 18 concurrent rendering & transitions (`useTransition`, `useDeferredValue`)
- Auto-batching
- Diffing algorithm deep dive
- Compound components, Render props, Headless UI pattern
- Context module pattern
- Controlled vs uncontrolled edge cases

---

## **3.2 Hooks**

- Core hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`
- `useReducer`, `useLayoutEffect`, `useImperativeHandle`
- Custom hooks & reusability
- Hook rules & dependency pitfalls

### 🧠 **Advanced Additions**

- Stale closures & dependency management
- `useSyncExternalStore` (React 18)
- `useId`, `useInsertionEffect`
- When not to use hooks (performance-critical paths)

---

## **3.3 State Management**

- Context API
- Redux & Redux Toolkit
- Zustand / Recoil / Jotai
- React Query / TanStack Query (fetching, caching, invalidation)
- Apollo Client (GraphQL)

### 🧠 **Advanced Additions**

- Redux middleware: Thunk, Saga, Observable
- Zustand derived state, selectors
- Signals (React experimental)
- React Query cache hydration
- Context performance pitfalls

---

## **3.4 Testing**

- Jest, React Testing Library
- Mocking API calls
- Snapshot testing
- Coverage & CI setup

### 🧠 **Advanced Additions**

- Integration tests with MSW (Mock Service Worker)
- E2E testing (Cypress, Playwright)
- Accessibility tests (`jest-axe`)
- Visual regression (Chromatic, Percy)
- Unit tests for hooks

---

## **3.5 Accessibility (A11y)**

- ARIA attributes (`aria-label`, `aria-live`, roles)
- Keyboard navigation
- Focus management
- Screen reader testing (NVDA, VoiceOver)
- Color contrast ratios
- Semantic HTML usage
- `tabindex`, skip links
- Linting accessibility (`eslint-plugin-jsx-a11y`)
- Testing with axe-core
- `lang` attribute for multilingual sites

### 🧠 **Advanced Additions**

- Focus trapping in modals
- ARIA live regions for dynamic content
- Reduced motion accessibility
- Testing keyboard-only flows
- High-contrast & dark mode accessibility

---

# ⚙️ 4. Next.js & Framework-Level Skills

> The modern meta-framework.

---

- File-based routing
- App Router (Next 13+): Server Components, Client Components
- `getStaticProps`, `getServerSideProps`, ISR
- Middleware (auth, rewrites, redirects)
- Layouts, dynamic imports
- Image optimization
- API routes
- Caching, Edge Functions
- Authentication (NextAuth, Clerk)
- SEO (metadata, sitemap)
- Deployment on Vercel, preview builds

### 🧠 **Advanced Additions**

- Server Actions (Next.js 15+)
- Edge runtime vs Node runtime
- Streaming with Suspense
- Parallel & intercepted routes
- Dynamic metadata generation
- Route Handlers vs API Routes
- ISR cache revalidation
- Middleware-based auth guards
- Internationalization (i18n routing)
- Next.js + MongoDB/Prisma integration
- Environment variable management
- Testing Next apps (Jest, Playwright)
- Performance optimizations on Vercel

---

# 🧠 5. Tooling, Build & DevOps Awareness

- Webpack, Vite, SWC, ESBuild
- Babel configuration
- Tree-shaking, code splitting
- GitHub Actions, Vercel pipelines
- Linting & Prettier, Husky pre-commit hooks
- Type-checking in CI
- Environment secrets management

### 🧠 **Advanced Additions**

- Build performance optimization
- Source maps and debugging builds
- Bundle analyzer usage
- Error logging (Sentry)
- Web Vitals tracking

---

# 🎨 6. Styling & UI Architecture

- CSS Modules, Styled Components, Emotion
- Tailwind CSS
- CSS Grid, Flexbox
- Responsive design
- Design tokens, theming
- Critical CSS loading

### 🧠 **Advanced Additions**

- CSS architecture (BEM, ITCSS)
- CSS Layers, Cascade management
- CSS-in-JS tradeoffs
- Animation performance (FLIP technique)
- Design systems (MUI, shadcn, Radix)
- Storybook setup & visual documentation
- Accessibility-first design systems

---

# 🧮 7. Performance Optimization & Debugging

- Lazy loading & code splitting
- Avoiding unnecessary re-renders (`React.memo`, `useMemo`)
- Virtualization (React Window, React Virtualized)
- Chrome DevTools usage
- React Profiler
- Network throttling & offline testing

### 🧠 **Advanced Additions**

- Pre-rendering & hydration bottlenecks
- Core Web Vitals optimization
- Caching strategies & Service Worker debugging
- Memory profiling & leak detection
- Using `performance.mark`, `console.table`
