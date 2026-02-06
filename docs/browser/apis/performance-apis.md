# Performance APIs

## ⚡ Quick Revision
- **Performance.now()**: High-precision timestamps for accurate measurements
- **Performance.mark()**: Create named timestamps for specific events
- **Performance.measure()**: Calculate duration between marks or navigation events
- **PerformanceObserver**: Monitor performance entries asynchronously
- **User Timing API**: Custom performance measurements for application code

```javascript
// Basic performance measurement
const start = performance.now();
await heavyOperation();
const end = performance.now();
console.log(`Operation took: ${end - start}ms`);

// User Timing API
performance.mark('data-fetch-start');
await fetchData();
performance.mark('data-fetch-end');
performance.measure('data-fetch', 'data-fetch-start', 'data-fetch-end');

// Get measurements
const measures = performance.getEntriesByType('measure');
console.log(measures[0].duration); // Duration in milliseconds
```

**Key APIs:**
- `performance.now()` - Current timestamp
- `performance.mark(name)` - Create marker
- `performance.measure(name, start, end)` - Create measurement
- `performance.getEntriesByType(type)` - Retrieve performance data

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Performance APIs provide accurate, standardized ways to measure web application performance:

**Precision requirements:**
- `Date.now()` has millisecond precision and can go backwards
- `performance.now()` has microsecond precision and is monotonic
- Critical for measuring short operations and detecting performance regressions

**Standardization:**
- Consistent measurement across browsers and environments
- Integration with browser DevTools and performance monitoring tools
- Enables automated performance tracking and alerting

**Real User Monitoring (RUM):**
- Measure actual user experience, not just synthetic tests
- Capture performance in real network conditions and devices
- Identify performance bottlenecks in production

**Developer experience:**
- Built-in browser APIs, no external dependencies
- Structured data format for easy analysis
- Integration with performance budgets and CI/CD pipelines

</details>

<details>
<summary>How it works</summary>
**High-Resolution Time:**
```javascript
// performance.now() characteristics
console.log(performance.now()); // 1234.5678901234 (microsecond precision)
console.log(Date.now());       // 1672531200000 (millisecond precision)

// Monotonic - always increases
const t1 = performance.now();
// Even if system clock changes
const t2 = performance.now();
console.log(t2 > t1); // Always true

// Time origin is navigation start
console.log(performance.timeOrigin); // Absolute timestamp when page started loading
```

**User Timing API Deep Dive:**
```javascript
// Performance marks - named timestamps
performance.mark('app-start');
performance.mark('dom-ready');
performance.mark('first-paint');
performance.mark('app-ready');

// Performance measures - duration calculations
performance.measure('dom-load-time', 'navigationStart', 'dom-ready');
performance.measure('app-startup-time', 'app-start', 'app-ready');
performance.measure('paint-to-ready', 'first-paint', 'app-ready');

// Advanced measure with custom start time
performance.measure('async-operation', undefined, 'operation-end', {
  start: 1234.5678,
  detail: { operationType: 'data-fetch', userId: 'user123' }
});

// Retrieve and analyze
const measures = performance.getEntriesByType('measure');
measures.forEach(measure => {
  console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
  
  // Rich metadata available
  console.log({
    startTime: measure.startTime,
    duration: measure.duration,
    detail: measure.detail
  });
});
```

**Performance Observer Pattern:**
```javascript
// Comprehensive performance monitoring
class PerformanceMonitor {
  constructor() {
    this.observers = new Map();
    this.setupObservers();
  }
  
  setupObservers() {
    // Monitor user timing
    this.createObserver('measure', (entries) => {
      entries.forEach(entry => {
        console.log(`Custom measure: ${entry.name} = ${entry.duration}ms`);
        this.sendToAnalytics('user-timing', entry);
      });
    });
    
    // Monitor navigation timing
    this.createObserver('navigation', (entries) => {
      const [entry] = entries;
      const metrics = {
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        tcp: entry.connectEnd - entry.connectStart,
        tls: entry.secureConnectionStart ? entry.connectEnd - entry.secureConnectionStart : 0,
        ttfb: entry.responseStart - entry.requestStart,
        download: entry.responseEnd - entry.responseStart,
        domParse: entry.domInteractive - entry.responseEnd,
        domReady: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        load: entry.loadEventEnd - entry.loadEventStart
      };
      
      console.log('Navigation metrics:', metrics);
      this.sendToAnalytics('navigation', metrics);
    });
    
    // Monitor resource timing
    this.createObserver('resource', (entries) => {
      entries.forEach(entry => {
        const metrics = {
          name: entry.name,
          type: this.getResourceType(entry),
          duration: entry.duration,
          size: entry.transferSize,
          cached: entry.transferSize === 0 && entry.decodedBodySize > 0
        };
        
        // Flag slow resources
        if (metrics.duration > 1000) {
          console.warn('Slow resource:', metrics);
        }
        
        this.sendToAnalytics('resource', metrics);
      });
    });
  }
  
  createObserver(type, callback) {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });
    
    observer.observe({ entryTypes: [type] });
    this.observers.set(type, observer);
  }
  
  getResourceType(entry) {
    if (entry.initiatorType) return entry.initiatorType;
    
    const url = new URL(entry.name);
    const extension = url.pathname.split('.').pop().toLowerCase();
    
    const typeMap = {
      'js': 'script',
      'css': 'stylesheet',
      'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'gif': 'image', 'svg': 'image',
      'woff': 'font', 'woff2': 'font', 'ttf': 'font', 'otf': 'font'
    };
    
    return typeMap[extension] || 'other';
  }
  
  // Custom timing utilities
  time(name) {
    performance.mark(`${name}-start`);
  }
  
  timeEnd(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }
  
  async timeAsync(name, operation) {
    this.time(name);
    try {
      return await operation();
    } finally {
      this.timeEnd(name);
    }
  }
  
  sendToAnalytics(type, data) {
    // Send to your analytics service
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        event_category: type,
        value: Math.round(data.duration || 0),
        custom_map: { metric_data: JSON.stringify(data) }
      });
    }
  }
  
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Usage
const monitor = new PerformanceMonitor();

// Time custom operations
monitor.time('page-setup');
// ... setup code ...
monitor.timeEnd('page-setup');

// Time async operations
const data = await monitor.timeAsync('api-call', () => 
  fetch('/api/data').then(r => r.json())
);
```

**Advanced Performance Analysis:**
```javascript
class PerformanceAnalyzer {
  static analyzePageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    const metrics = {
      // Core Web Vitals approximations
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      
      // Navigation timing
      ttfb: navigation.responseStart - navigation.requestStart,
      domLoad: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      windowLoad: navigation.loadEventEnd - navigation.navigationStart,
      
      // Network timing
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.secureConnectionStart > 0 ? 
           navigation.connectEnd - navigation.secureConnectionStart : 0,
      
      // Resource timing summary
      resources: this.analyzeResources()
    };
    
    return metrics;
  }
  
  static analyzeResources() {
    const resources = performance.getEntriesByType('resource');
    
    const summary = {
      total: resources.length,
      byType: {},
      slowest: [],
      cached: 0,
      totalSize: 0
    };
    
    resources.forEach(resource => {
      const type = resource.initiatorType || 'other';
      
      // Group by type
      if (!summary.byType[type]) {
        summary.byType[type] = { count: 0, totalDuration: 0 };
      }
      summary.byType[type].count++;
      summary.byType[type].totalDuration += resource.duration;
      
      // Track cached resources
      if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
        summary.cached++;
      }
      
      // Track total size
      summary.totalSize += resource.transferSize || 0;
      
      // Track slowest resources
      if (resource.duration > 100) {
        summary.slowest.push({
          name: resource.name,
          duration: resource.duration,
          type: type
        });
      }
    });
    
    // Sort slowest resources
    summary.slowest.sort((a, b) => b.duration - a.duration);
    summary.slowest = summary.slowest.slice(0, 10); // Top 10
    
    return summary;
  }
  
  static reportPerformanceBudget(budget) {
    const metrics = this.analyzePageLoad();
    const violations = [];
    
    if (budget.ttfb && metrics.ttfb > budget.ttfb) {
      violations.push(`TTFB: ${metrics.ttfb}ms > ${budget.ttfb}ms`);
    }
    
    if (budget.fcp && metrics.fcp > budget.fcp) {
      violations.push(`FCP: ${metrics.fcp}ms > ${budget.fcp}ms`);
    }
    
    if (budget.totalSize && metrics.resources.totalSize > budget.totalSize) {
      violations.push(`Total size: ${metrics.resources.totalSize} > ${budget.totalSize}`);
    }
    
    return {
      passed: violations.length === 0,
      violations,
      metrics
    };
  }
}

// Usage
const budget = {
  ttfb: 200,      // 200ms TTFB
  fcp: 1800,      // 1.8s First Contentful Paint
  totalSize: 2000000 // 2MB total resources
};

const report = PerformanceAnalyzer.reportPerformanceBudget(budget);
console.log('Performance budget:', report);
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "performance.now() returns absolute time"**
- Returns time relative to page navigation start
- Use `performance.timeOrigin + performance.now()` for absolute time
- Time origin differs from Unix timestamp format

**❌ "Performance marks persist across page navigations"**
- Marks and measures are cleared on page navigation
- Use `performance.setResourceTimingBufferSize()` to increase buffer
- Store critical metrics before navigation if needed

**❌ "All performance entries are immediately available"**
```javascript
// ❌ Wrong: Entries may not be available immediately
performance.mark('start');
const entries = performance.getEntriesByName('start'); // Might be empty

// ✅ Correct: Use PerformanceObserver for real-time monitoring
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('New performance entry:', entry);
  });
});
observer.observe({ entryTypes: ['mark', 'measure'] });
```

**❌ "Performance APIs don't affect performance"**
- Frequent `performance.now()` calls have minimal but measurable impact
- Large numbers of marks/measures consume memory
- PerformanceObserver callbacks can block main thread if heavy

**❌ "Resource timing includes all network requests"**
```javascript
// ❌ Not captured by Resource Timing API:
// - Cross-origin resources without Timing-Allow-Origin header
// - Data URLs and blob URLs
// - Some browser-internal requests

// ✅ Use Navigation Timing for main document
// ✅ Use User Timing for custom application metrics
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions:**

**Q: "How would you implement a performance monitoring system?"**
```javascript
class PerformanceTracker {
  constructor(config = {}) {
    this.config = {
      enableUserTiming: true,
      enableResourceTiming: true,
      enableNavigationTiming: true,
      sampleRate: 0.1, // 10% sampling
      endpoint: '/analytics/performance',
      ...config
    };
    
    this.metrics = [];
    this.setupObservers();
    this.setupReporting();
  }
  
  setupObservers() {
    if (!this.shouldSample()) return;
    
    // Core Web Vitals
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'largest-contentful-paint') {
          this.recordMetric('LCP', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          this.recordMetric('CLS', entry.value);
        }
      });
    }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    
    // Custom metrics
    if (this.config.enableUserTiming) {
      new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.recordMetric(`custom.${entry.name}`, entry.duration);
        });
      }).observe({ entryTypes: ['measure'] });
    }
  }
  
  setupReporting() {
    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.sendBeacon();
    });
    
    // Periodic reporting for long-lived pages
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.sendBeacon();
      }
    }, 30000); // Every 30 seconds
  }
  
  recordMetric(name, value, tags = {}) {
    this.metrics.push({
      name,
      value,
      timestamp: performance.now(),
      url: location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      ...tags
    });
  }
  
  // Timing utilities
  startTiming(name) {
    performance.mark(`${name}-start`);
    return {
      end: () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
    };
  }
  
  async timeAsync(name, operation) {
    const timer = this.startTiming(name);
    try {
      const result = await operation();
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      this.recordMetric(`${name}.error`, 1);
      throw error;
    }
  }
  
  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    } : null;
  }
  
  shouldSample() {
    return Math.random() < this.config.sampleRate;
  }
  
  sendBeacon() {
    if (this.metrics.length === 0) return;
    
    const payload = {
      metrics: this.metrics,
      session: this.getSessionId(),
      page: {
        url: location.href,
        title: document.title,
        referrer: document.referrer
      }
    };
    
    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch(this.config.endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {}); // Ignore errors on page unload
    }
    
    this.metrics = [];
  }
  
  getSessionId() {
    let sessionId = sessionStorage.getItem('perf-session-id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('perf-session-id', sessionId);
    }
    return sessionId;
  }
}

// Usage
const tracker = new PerformanceTracker({
  sampleRate: 0.1,
  endpoint: '/api/metrics'
});

// Track custom operations
const timer = tracker.startTiming('component-render');
renderComponent();
timer.end();

// Track async operations
const data = await tracker.timeAsync('api-call', () =>
  fetch('/api/data').then(r => r.json())
);
```

**Q: "How do you optimize performance measurement overhead?"**
```javascript
// Techniques to minimize performance impact

// 1. Sampling
const SAMPLE_RATE = 0.05; // Only measure 5% of sessions
if (Math.random() > SAMPLE_RATE) return;

// 2. Batching
class BatchedPerformanceTracker {
  constructor() {
    this.buffer = [];
    this.batchSize = 10;
    this.flushInterval = 5000;
    
    setInterval(() => this.flush(), this.flushInterval);
  }
  
  record(metric) {
    this.buffer.push(metric);
    if (this.buffer.length >= this.batchSize) {
      this.flush();
    }
  }
  
  flush() {
    if (this.buffer.length === 0) return;
    
    // Send batch
    this.sendBatch([...this.buffer]);
    this.buffer.length = 0;
  }
}

// 3. Debouncing
const debouncedMeasure = debounce((name, duration) => {
  // Avoid flooding with rapid measurements
  sendMetric(name, duration);
}, 100);

// 4. Conditional measurement
const shouldMeasure = (name) => {
  // Only measure critical paths
  const criticalPaths = ['page-load', 'first-paint', 'user-interaction'];
  return criticalPaths.includes(name);
};
```

**Q: "How do you handle performance across different devices/networks?"**
```javascript
class AdaptivePerformanceMonitor {
  constructor() {
    this.deviceClass = this.getDeviceClass();
    this.connectionType = this.getConnectionType();
    this.setupAdaptiveTracking();
  }
  
  getDeviceClass() {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    if (memory <= 2 || cores <= 2) return 'low-end';
    if (memory <= 4 || cores <= 4) return 'mid-range';
    return 'high-end';
  }
  
  getConnectionType() {
    const connection = navigator.connection;
    if (!connection) return 'unknown';
    
    const effectiveType = connection.effectiveType;
    if (['slow-2g', '2g'].includes(effectiveType)) return 'slow';
    if (['3g'].includes(effectiveType)) return 'medium';
    return 'fast';
  }
  
  setupAdaptiveTracking() {
    // Adjust sampling based on device capabilities
    const sampleRates = {
      'low-end': 0.01,   // 1% - minimal impact
      'mid-range': 0.05, // 5% - moderate tracking
      'high-end': 0.1    // 10% - comprehensive tracking
    };
    
    this.sampleRate = sampleRates[this.deviceClass];
    
    // Adjust tracking granularity
    if (this.deviceClass === 'low-end' || this.connectionType === 'slow') {
      // Only track essential metrics
      this.trackOnlyEssential = true;
    }
  }
  
  shouldTrack(metricName) {
    if (Math.random() > this.sampleRate) return false;
    
    if (this.trackOnlyEssential) {
      const essentialMetrics = ['FCP', 'LCP', 'FID'];
      return essentialMetrics.includes(metricName);
    }
    
    return true;
  }
}
```

**Best practices to mention:**
- **Sample wisely**: Don't measure 100% of users
- **Use PerformanceObserver**: More efficient than polling
- **Batch data**: Reduce network overhead
- **Graceful degradation**: Handle API unavailability
- **Privacy considerations**: Be careful with sensitive timing data

</details>