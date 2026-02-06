# Core Web Vitals

## ⚡ Quick Revision
- **LCP (Largest Contentful Paint)**: Largest visible element render time - Target: < 2.5s
- **FID (First Input Delay)**: Time from user input to browser response - Target: < 100ms  
- **CLS (Cumulative Layout Shift)**: Visual stability score - Target: < 0.1
- **INP (Interaction to Next Paint)**: Responsiveness to user interactions - Target: < 200ms
- **Google ranking factor**: Affects SEO and user experience scores

```javascript
// Measure Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay  
getLCP(console.log);  // Largest Contentful Paint
getFCP(console.log);  // First Contentful Paint
getTTFB(console.log); // Time to First Byte

// Manual measurement with PerformanceObserver
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime);
    }
  });
});
observer.observe({ entryTypes: ['largest-contentful-paint'] });
```

**Optimization quick wins:**
- Optimize images and use modern formats (WebP, AVIF)
- Minimize layout shifts with size attributes
- Reduce JavaScript execution time
- Use resource hints and preloading

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Core Web Vitals represent Google's attempt to standardize user experience metrics:

**User-centric approach:**
- Traditional metrics (load time, DOMContentLoaded) don't reflect user experience
- Focus on when users can see and interact with content
- Align developer incentives with user satisfaction

**Business impact:**
- Page experience signals affect Google search rankings
- Better vitals correlate with higher conversion rates
- Provide actionable metrics for performance optimization

**Standardization:**
- Create consistent measurement across different sites
- Enable comparison and benchmarking
- Provide clear optimization targets

**Quality gates:**
- Encourage minimum performance standards
- Help prioritize performance work
- Measure real user experience, not just lab conditions

</details>

<details>
<summary>How it works</summary>
**Largest Contentful Paint (LCP):**
```javascript
// LCP measures the largest visible element in the viewport
// Elements considered: <img>, <image> (SVG), <video>, block-level elements with text

class LCPTracker {
  constructor() {
    this.lcpValue = 0;
    this.lcpElement = null;
    this.observer = new PerformanceObserver(this.handleLCP.bind(this));
    this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  handleLCP(list) {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    this.lcpValue = lastEntry.startTime;
    this.lcpElement = lastEntry.element;
    
    // LCP can change as new larger elements appear
    console.log(`LCP: ${this.lcpValue}ms`, this.lcpElement);
    
    // Stop observing after user interaction (LCP becomes final)
    if (!this.hasUserInteracted) {
      document.addEventListener('click', this.finalizeLCP.bind(this), { once: true });
      document.addEventListener('keydown', this.finalizeLCP.bind(this), { once: true });
      document.addEventListener('scroll', this.finalizeLCP.bind(this), { once: true });
    }
  }
  
  finalizeLCP() {
    this.hasUserInteracted = true;
    this.observer.disconnect();
    this.reportLCP(this.lcpValue, this.lcpElement);
  }
  
  reportLCP(value, element) {
    // Send final LCP value to analytics
    gtag('event', 'web_vitals', {
      name: 'LCP',
      value: Math.round(value),
      element_selector: this.getElementSelector(element)
    });
  }
  
  getElementSelector(element) {
    // Generate unique selector for LCP element
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
}

// Optimize LCP
const LCPOptimizations = {
  // 1. Image optimization
  optimizeHeroImage() {
    const heroImg = document.querySelector('.hero-image');
    
    // Preload critical images
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroImg.src;
    document.head.appendChild(link);
    
    // Use responsive images
    heroImg.srcset = `
      hero-400.webp 400w,
      hero-800.webp 800w,
      hero-1200.webp 1200w
    `;
    heroImg.sizes = '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px';
  },
  
  // 2. Critical CSS inlining
  inlineCriticalCSS() {
    const criticalCSS = `
      .hero { width: 100%; height: 400px; }
      .hero-image { width: 100%; height: 100%; object-fit: cover; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }
};
```

**First Input Delay (FID) & Interaction to Next Paint (INP):**
```javascript
// FID measures delay between first user input and browser response
// INP measures responsiveness throughout page lifetime

class InteractionTracker {
  constructor() {
    this.setupFIDTracking();
    this.setupINPTracking();
  }
  
  setupFIDTracking() {
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const fid = entry.processingStart - entry.startTime;
        console.log(`FID: ${fid}ms`);
        this.reportFID(fid, entry);
      });
    }).observe({ entryTypes: ['first-input'] });
  }
  
  setupINPTracking() {
    // INP requires more complex measurement
    let interactions = [];
    
    ['click', 'keydown', 'pointerdown'].forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        // Measure time to next paint
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          interactions.push({
            type,
            duration,
            timestamp: startTime
          });
          
          // Keep only recent interactions
          interactions = interactions.filter(i => 
            startTime - i.timestamp < 5000 // Last 5 seconds
          );
          
          // Calculate INP (98th percentile of interactions)
          const inp = this.calculateINP(interactions);
          console.log(`INP: ${inp}ms`);
        });
      });
    });
  }
  
  calculateINP(interactions) {
    if (interactions.length === 0) return 0;
    
    const sorted = interactions.map(i => i.duration).sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.98); // 98th percentile
    return sorted[index] || sorted[sorted.length - 1];
  }
  
  reportFID(fid, entry) {
    gtag('event', 'web_vitals', {
      name: 'FID',
      value: Math.round(fid),
      event_type: entry.name // 'mousedown', 'keydown', etc.
    });
  }
}

// Optimize FID/INP
const InteractionOptimizations = {
  // 1. Break up long tasks
  async breakUpLongTask(items) {
    const CHUNK_SIZE = 50;
    
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      
      // Process chunk
      chunk.forEach(processItem);
      
      // Yield to browser
      if (i + CHUNK_SIZE < items.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  },
  
  // 2. Use scheduler API
  scheduleWork(callback) {
    if ('scheduler' in window && 'postTask' in scheduler) {
      scheduler.postTask(callback, { priority: 'user-blocking' });
    } else {
      // Fallback
      requestIdleCallback(callback, { timeout: 100 });
    }
  },
  
  // 3. Debounce expensive operations
  debounceInput(callback, delay = 100) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => callback.apply(this, args), delay);
    };
  }
};
```

**Cumulative Layout Shift (CLS):**
```javascript
// CLS measures visual stability - unexpected layout shifts

class CLSTracker {
  constructor() {
    this.clsValue = 0;
    this.sessionValue = 0;
    this.sessionEntries = [];
    this.observer = new PerformanceObserver(this.handleCLS.bind(this));
    this.observer.observe({ entryTypes: ['layout-shift'] });
  }
  
  handleCLS(list) {
    list.getEntries().forEach(entry => {
      // Only count shifts without recent user input
      if (!entry.hadRecentInput) {
        this.sessionValue += entry.value;
        this.sessionEntries.push(entry);
        
        // Session window: 1 second gap or 5 second maximum
        this.updateSessions(entry);
        
        console.log(`CLS: ${entry.value}`, entry.sources);
        this.analyzeSources(entry.sources);
      }
    });
  }
  
  updateSessions(entry) {
    const GAP_THRESHOLD = 1000; // 1 second
    const MAX_SESSION_DURATION = 5000; // 5 seconds
    
    const lastEntry = this.sessionEntries[this.sessionEntries.length - 2];
    
    if (lastEntry && 
        (entry.startTime - lastEntry.startTime > GAP_THRESHOLD ||
         entry.startTime - this.sessionEntries[0].startTime > MAX_SESSION_DURATION)) {
      
      // Start new session
      this.clsValue = Math.max(this.clsValue, this.sessionValue);
      this.sessionValue = entry.value;
      this.sessionEntries = [entry];
    }
  }
  
  analyzeSources(sources) {
    sources.forEach(source => {
      const element = source.node;
      const selector = this.getElementSelector(element);
      
      console.log(`Layout shift caused by: ${selector}`);
      console.log(`Shift amount:`, {
        previousRect: source.previousRect,
        currentRect: source.currentRect
      });
    });
  }
  
  getElementSelector(element) {
    if (!element) return 'unknown';
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
  
  getFinalCLS() {
    return Math.max(this.clsValue, this.sessionValue);
  }
}

// Optimize CLS
const CLSOptimizations = {
  // 1. Reserve space for content
  reserveImageSpace() {
    // CSS approach
    const style = document.createElement('style');
    style.textContent = `
      .responsive-image {
        aspect-ratio: 16/9; /* Reserve space */
        width: 100%;
      }
      
      .image-placeholder {
        min-height: 200px; /* Fallback for older browsers */
        background: #f0f0f0;
      }
    `;
    document.head.appendChild(style);
  },
  
  // 2. Use size attributes
  addImageDimensions() {
    document.querySelectorAll('img').forEach(img => {
      if (!img.width || !img.height) {
        console.warn('Image missing dimensions:', img.src);
        
        // Add dimensions if known
        if (img.dataset.width && img.dataset.height) {
          img.width = img.dataset.width;
          img.height = img.dataset.height;
        }
      }
    });
  },
  
  // 3. Avoid inserting content above existing content
  insertContentSafely(newContent, container) {
    // Insert at end instead of beginning
    container.appendChild(newContent);
    
    // Or use transform to avoid layout
    newContent.style.transform = 'translateY(-100%)';
    newContent.style.transition = 'transform 0.3s ease';
    requestAnimationFrame(() => {
      newContent.style.transform = 'translateY(0)';
    });
  },
  
  // 4. Preload fonts to avoid FOIT/FOUT
  preloadFonts() {
    const fonts = [
      '/fonts/roboto-regular.woff2',
      '/fonts/roboto-bold.woff2'
    ];
    
    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = font;
      document.head.appendChild(link);
    });
  }
};
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Core Web Vitals are just performance metrics"**
- They're user experience metrics that happen to be performance-related
- Focus on user perception, not technical benchmarks
- Include visual stability (CLS) which isn't about speed

**❌ "Lab scores and field scores should be the same"**
```javascript
// Lab conditions (Lighthouse, PageSpeed Insights)
// - Consistent device/network
// - No user interactions
// - Predictable content

// Field conditions (Real User Monitoring)
// - Varied devices/networks  
// - Real user behavior
// - Dynamic content

// Expect differences between lab and field scores
```

**❌ "A good LCP means a fast page"**
- LCP only measures the largest element
- Page might have slow subsequent loading
- Other elements might be more important to user

**❌ "CLS only happens during initial load"**
```javascript
// CLS continues to be measured throughout page lifetime
// Common post-load causes:
// - Ads that load late
// - Font swaps (FOIT/FOUT)
// - Dynamic content insertion
// - Images without dimensions

// Monitor ongoing CLS
let clsValue = 0;
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
      console.log('Ongoing CLS:', clsValue);
    }
  });
}).observe({ entryTypes: ['layout-shift'] });
```

**❌ "FID and INP measure the same thing"**
- **FID**: Only first interaction, input delay only
- **INP**: All interactions, full processing + rendering time
- INP is more comprehensive and replacing FID

</details>

<details>
<summary>Interview angle</summary>
**Common questions:**

**Q: "How would you debug a poor LCP score?"**
```javascript
// Debugging approach
class LCPDebugger {
  static analyze() {
    // 1. Identify LCP element
    new PerformanceObserver((list) => {
      const entry = list.getEntries().pop();
      console.log('LCP element:', entry.element);
      console.log('LCP time:', entry.startTime);
      
      this.analyzeLCPElement(entry.element);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // 2. Check resource timing
    this.analyzeResourceTiming();
    
    // 3. Check critical path
    this.analyzeCriticalPath();
  }
  
  static analyzeLCPElement(element) {
    console.group('LCP Element Analysis');
    
    if (element.tagName === 'IMG') {
      console.log('Image source:', element.src);
      console.log('Image natural size:', element.naturalWidth, 'x', element.naturalHeight);
      console.log('Image displayed size:', element.width, 'x', element.height);
      
      // Check if image is optimized
      if (element.src.includes('.jpg') || element.src.includes('.png')) {
        console.warn('Consider using WebP format');
      }
      
      // Check if image is above the fold
      const rect = element.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        console.warn('LCP image is below the fold');
      }
    }
    
    console.groupEnd();
  }
  
  static analyzeResourceTiming() {
    const lcpResources = performance.getEntriesByType('resource')
      .filter(resource => resource.duration > 1000) // Slow resources
      .sort((a, b) => b.duration - a.duration);
    
    console.log('Slow resources that might affect LCP:', lcpResources);
  }
  
  static analyzeCriticalPath() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    console.log('Critical path timing:', {
      'DNS': navigation.domainLookupEnd - navigation.domainLookupStart,
      'Connection': navigation.connectEnd - navigation.connectStart,
      'TTFB': navigation.responseStart - navigation.requestStart,
      'Document download': navigation.responseEnd - navigation.responseStart,
      'DOM processing': navigation.domComplete - navigation.responseEnd
    });
  }
}

// Optimization strategies
const LCPOptimizationStrategies = {
  // Strategy 1: Preload critical resources
  preloadCriticalResources() {
    // Preload hero image
    const heroImage = document.querySelector('.hero img');
    if (heroImage) {
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'image';
      preload.href = heroImage.src;
      document.head.appendChild(preload);
    }
    
    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.as = 'style';
    criticalCSS.href = '/css/critical.css';
    document.head.appendChild(criticalCSS);
  },
  
  // Strategy 2: Optimize images
  optimizeImages() {
    document.querySelectorAll('img').forEach(img => {
      // Add loading attribute
      if (!img.loading) {
        const rect = img.getBoundingClientRect();
        img.loading = rect.top < window.innerHeight * 2 ? 'eager' : 'lazy';
      }
      
      // Add width/height to prevent CLS
      if (!img.width && img.dataset.width) {
        img.width = img.dataset.width;
        img.height = img.dataset.height;
      }
    });
  }
};
```

**Q: "How do you optimize for all Core Web Vitals together?"**
```javascript
class WebVitalsOptimizer {
  constructor() {
    this.optimizations = {
      lcp: [],
      fid: [], 
      cls: []
    };
    
    this.measureBaseline();
    this.implementOptimizations();
  }
  
  measureBaseline() {
    // Measure current performance
    import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
      getCLS((metric) => this.baselineCLS = metric.value);
      getFID((metric) => this.baselineFID = metric.value);
      getLCP((metric) => this.baselineLCP = metric.value);
    });
  }
  
  implementOptimizations() {
    // LCP optimizations
    this.optimizeImages();
    this.optimizeCriticalPath();
    
    // FID optimizations  
    this.optimizeJavaScript();
    this.implementCodeSplitting();
    
    // CLS optimizations
    this.reserveSpace();
    this.optimizeFonts();
    
    // Measure improvement
    setTimeout(() => this.measureImprovement(), 5000);
  }
  
  optimizeImages() {
    // WebP conversion, responsive images, lazy loading
    this.optimizations.lcp.push('Image optimization');
  }
  
  optimizeCriticalPath() {
    // Critical CSS, resource hints, server optimization
    this.optimizations.lcp.push('Critical path optimization');
  }
  
  optimizeJavaScript() {
    // Code splitting, tree shaking, bundle optimization
    this.optimizations.fid.push('JavaScript optimization');
  }
  
  reserveSpace() {
    // Image dimensions, skeleton screens, container queries
    this.optimizations.cls.push('Space reservation');
  }
  
  measureImprovement() {
    import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
      getCLS((metric) => {
        const improvement = this.baselineCLS - metric.value;
        console.log(`CLS improved by: ${improvement}`);
      });
      
      // Similar for FID and LCP
    });
  }
}
```

**Q: "How do you set up monitoring for Core Web Vitals?"**
```javascript
class WebVitalsMonitoring {
  constructor(config = {}) {
    this.config = {
      endpoint: '/analytics/web-vitals',
      sampleRate: 0.1,
      reportAllChanges: false,
      ...config
    };
    
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    if (Math.random() > this.config.sampleRate) return;
    
    import('web-vitals').then(({
      getCLS, getFID, getFCP, getLCP, getTTFB
    }) => {
      getCLS(this.sendToAnalytics.bind(this), this.config.reportAllChanges);
      getFID(this.sendToAnalytics.bind(this));
      getFCP(this.sendToAnalytics.bind(this));
      getLCP(this.sendToAnalytics.bind(this), this.config.reportAllChanges);
      getTTFB(this.sendToAnalytics.bind(this));
    });
  }
  
  sendToAnalytics(metric) {
    const data = {
      name: metric.name,
      value: metric.value,
      rating: this.getRating(metric),
      url: location.href,
      timestamp: Date.now(),
      connection: this.getConnectionInfo(),
      device: this.getDeviceInfo()
    };
    
    // Send to analytics
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.endpoint, JSON.stringify(data));
    }
    
    // Also send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: { metric_rating: data.rating }
      });
    }
  }
  
  getRating(metric) {
    const thresholds = {
      CLS: [0.1, 0.25],
      FID: [100, 300],
      LCP: [2500, 4000],
      FCP: [1800, 3000],
      TTFB: [800, 1800]
    };
    
    const [good, poor] = thresholds[metric.name] || [0, 0];
    
    if (metric.value <= good) return 'good';
    if (metric.value <= poor) return 'needs-improvement';
    return 'poor';
  }
  
  getConnectionInfo() {
    const connection = navigator.connection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    } : null;
  }
  
  getDeviceInfo() {
    return {
      memory: navigator.deviceMemory,
      cores: navigator.hardwareConcurrency,
      platform: navigator.platform
    };
  }
}

// Initialize monitoring
const monitoring = new WebVitalsMonitoring({
  sampleRate: 0.1, // 10% of users
  reportAllChanges: true // Track improvements during session
});
```

**Performance optimization priorities:**
1. **LCP**: Critical resource optimization, image optimization
2. **FID/INP**: JavaScript optimization, code splitting
3. **CLS**: Layout stability, font optimization
4. **Monitoring**: Real user monitoring, performance budgets

</details>