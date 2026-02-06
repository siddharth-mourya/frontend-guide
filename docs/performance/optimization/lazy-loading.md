# Lazy Loading

## ⚡ Quick Revision
- **Code splitting**: Break application into smaller chunks loaded on demand
- **React.lazy()**: Dynamic imports for component-level code splitting
- **Suspense boundary**: Provides fallback UI while lazy components load
- **Route-based splitting**: Most effective - split by pages/routes
- **Common pitfall**: Over-splitting small components, creating network overhead
- **Bundle analysis**: Use webpack-bundle-analyzer to identify large chunks

```jsx
// Dynamic import with React.lazy
const LazyDashboard = React.lazy(() => import('./Dashboard'));
const LazySettings = React.lazy(() => import('./Settings'));

// Route-based code splitting
function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<LazyDashboard />} />
          <Route path="/settings" element={<LazySettings />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// Dynamic imports in event handlers
async function loadChart() {
  const { Chart } = await import('./Chart');
  return Chart;
}

// Preloading for better UX
const chartPromise = import('./Chart');
function PreloadChart() {
  const [ChartComponent, setChartComponent] = useState(null);
  
  useEffect(() => {
    chartPromise.then(module => setChartComponent(() => module.Chart));
  }, []);
  
  return ChartComponent ? <ChartComponent /> : <div>Loading chart...</div>;
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Lazy loading exists to solve **performance problems** with large JavaScript bundles:

**Problems It Solves:**
1. **Initial bundle size**: Large apps create massive initial downloads
2. **Unused code loading**: Users download code they may never use
3. **Time to Interactive (TTI)**: Large bundles delay when app becomes usable
4. **Network efficiency**: Reduce bandwidth usage, especially on mobile

**Performance Impact:**
```jsx
// ❌ Without code splitting - 2MB bundle
import Dashboard from './Dashboard';        // 500KB
import AdminPanel from './AdminPanel';      // 800KB
import Reports from './Reports';            // 700KB

function App() {
  // All code loaded upfront, even for routes user may never visit
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

// ✅ With code splitting - 200KB initial, chunks on demand
const Dashboard = lazy(() => import('./Dashboard'));    // 500KB chunk
const AdminPanel = lazy(() => import('./AdminPanel'));  // 800KB chunk
const Reports = lazy(() => import('./Reports'));        // 700KB chunk

// Initial bundle: 200KB
// Dashboard visited: +500KB
// Admin visited: +800KB
```
</details>

<details>
<summary>How it works</summary>
Lazy loading uses **dynamic imports** and **webpack's code splitting**:

**1. Module Bundling Process:**
```
Source Code → Webpack Analysis → Bundle Splitting → Chunk Loading
```

**2. Dynamic Import Mechanics:**
```jsx
// Static import (bundled together)
import Chart from './Chart';

// Dynamic import (separate chunk)
const chartModule = await import('./Chart');
const Chart = chartModule.default;

// React.lazy wrapper
const LazyChart = React.lazy(() => import('./Chart'));
```

**3. Webpack Code Splitting:**
```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          chunks: 'async',
          minChunks: 2,
          priority: -10,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

**4. Advanced Splitting Strategies:**
```jsx
// Feature-based splitting
const FeatureA = lazy(() => import('./features/FeatureA'));
const FeatureB = lazy(() => import('./features/FeatureB'));

// Conditional splitting
const AdminFeatures = lazy(() => 
  user.role === 'admin' 
    ? import('./AdminFeatures')
    : import('./UserFeatures')
);

// Named exports
const AsyncComponents = lazy(() => 
  import('./Charts').then(module => ({ default: module.LineChart }))
);

// Retry mechanism for failed loads
function lazyWithRetry(componentImport) {
  return lazy(() =>
    componentImport().catch(error => {
      console.error('Chunk load error:', error);
      return import('./ErrorFallback').then(module => ({ 
        default: module.ChunkLoadError 
      }));
    })
  );
}
```

**5. Preloading Strategies:**
```jsx
// Prefetch (idle time)
const Dashboard = lazy(() => import(/* webpackPrefetch: true */ './Dashboard'));

// Preload (immediately)
const CriticalComponent = lazy(() => import(/* webpackPreload: true */ './Critical'));

// Manual preloading
function usePreloadRoute(routePath) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const routeMap = {
          '/dashboard': () => import('./Dashboard'),
          '/settings': () => import('./Settings'),
        };
        routeMap[routePath]?.();
      });
    }
  }, [routePath]);
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Split every component"**
```jsx
// ❌ Over-splitting creates overhead
const TinyComponent = lazy(() => import('./TinyComponent')); // 2KB component
const SmallButton = lazy(() => import('./SmallButton'));     // 1KB component

// ✅ Split meaningful chunks
const FeaturePage = lazy(() => import('./FeaturePage'));     // 200KB feature
const AdminPanel = lazy(() => import('./AdminPanel'));      // 500KB feature
```

**❌ "React.lazy works with named exports"**
```jsx
// ❌ Named exports don't work directly
const LazyChart = lazy(() => import('./Charts')); // Import default, not { LineChart }

// ✅ Proper named export handling
const LazyLineChart = lazy(() => 
  import('./Charts').then(module => ({ default: module.LineChart }))
);

// ✅ Or restructure exports
// Charts/index.js
export { default } from './LineChart';
```

**❌ "Suspense boundary is optional"**
```jsx
// ❌ No Suspense boundary causes error
function App() {
  const LazyComponent = lazy(() => import('./Component'));
  return <LazyComponent />; // Error: Suspense boundary required
}

// ✅ Always wrap in Suspense
function App() {
  const LazyComponent = lazy(() => import('./Component'));
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

**❌ "Lazy loading always improves performance"**
```jsx
// ❌ Lazy loading critical above-the-fold content
const Hero = lazy(() => import('./Hero')); // User sees loading spinner first

// ✅ Lazy load below-the-fold or conditional content
const AdminPanel = lazy(() => import('./AdminPanel')); // Only for admin users
```
</details>

<details>
<summary>Interview angle</summary>
**Key Interview Questions:**

1. **"When would you use code splitting?"**
   - Route-based splitting for different pages
   - Feature-based splitting for admin panels, dashboards
   - Library-based splitting for heavy dependencies (charts, editors)

2. **"How do you decide what to split?"**
   - Analyze bundle size with webpack-bundle-analyzer
   - Split routes first (biggest impact)
   - Split features used by subset of users
   - Don't split small, frequently used components

3. **"What's the difference between lazy loading and preloading?"**
   - Lazy: Load when needed (user navigates to route)
   - Prefetch: Load during idle time (likely to be needed)
   - Preload: Load immediately (definitely needed soon)

**Real-world Implementation:**

**1. Route-based Splitting with Error Boundaries:**
```jsx
import { ErrorBoundary } from 'react-error-boundary';

const routes = [
  { path: '/', component: lazy(() => import('./pages/Home')) },
  { path: '/dashboard', component: lazy(() => import('./pages/Dashboard')) },
  { path: '/profile', component: lazy(() => import('./pages/Profile')) },
];

function AppRouter() {
  return (
    <Router>
      <Routes>
        {routes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <ErrorBoundary fallback={<ChunkErrorFallback />}>
                <Suspense fallback={<PageLoadingSpinner />}>
                  <Component />
                </Suspense>
              </ErrorBoundary>
            }
          />
        ))}
      </Routes>
    </Router>
  );
}

function ChunkErrorFallback({ error, resetError }) {
  useEffect(() => {
    if (error?.message?.includes('Loading chunk')) {
      // Auto-retry for chunk load errors
      setTimeout(resetError, 1000);
    }
  }, [error, resetError]);

  return (
    <div>
      <h2>Something went wrong loading this page</h2>
      <button onClick={resetError}>Try again</button>
    </div>
  );
}
```

**2. Progressive Enhancement with Lazy Loading:**
```jsx
function useProgressiveFeature(featureName, fallbackComponent) {
  const [Component, setComponent] = useState(() => fallbackComponent);
  const [isLoading, setIsLoading] = useState(false);

  const loadFeature = useCallback(async () => {
    if (Component === fallbackComponent) {
      setIsLoading(true);
      try {
        const module = await import(`./features/${featureName}`);
        setComponent(() => module.default);
      } catch (error) {
        console.error(`Failed to load ${featureName}:`, error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [Component, fallbackComponent, featureName]);

  return { Component, loadFeature, isLoading };
}

// Usage
function Dashboard() {
  const { Component: AdvancedChart, loadFeature, isLoading } = useProgressiveFeature(
    'AdvancedChart',
    BasicChart
  );

  return (
    <div>
      <h1>Dashboard</h1>
      <Component data={chartData} />
      {Component === BasicChart && (
        <button onClick={loadFeature} disabled={isLoading}>
          {isLoading ? 'Loading advanced features...' : 'Enable advanced charts'}
        </button>
      )}
    </div>
  );
}
```

**3. Bundle Analysis and Optimization:**
```jsx
// Performance monitoring
function useBundleMetrics() {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Page load time:', entry.loadEventEnd - entry.fetchStart);
        }
        if (entry.entryType === 'resource' && entry.name.includes('chunk')) {
          console.log('Chunk load time:', entry.duration);
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'resource'] });
    
    return () => observer.disconnect();
  }, []);
}

// webpack-bundle-analyzer configuration
module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
      openAnalyzer: false,
    }),
  ],
};
```

**Performance Best Practices:**
- Implement proper loading states for better UX
- Use error boundaries to handle chunk load failures
- Consider network conditions (navigator.connection)
- Measure real-world impact with Core Web Vitals
- Use service workers for chunk caching strategies
</details>