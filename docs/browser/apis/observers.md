# Browser Observers

## ⚡ Quick Revision
- **IntersectionObserver**: Detects when elements enter/exit viewport
- **ResizeObserver**: Monitors element size changes  
- **MutationObserver**: Watches DOM tree modifications
- **PerformanceObserver**: Observes performance metrics and timing
- **All async**: Don't block main thread, use callbacks for notifications

```javascript
// IntersectionObserver - Lazy loading
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      imageObserver.unobserve(entry.target);
    }
  });
});

// ResizeObserver - Responsive components
const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach(entry => {
    const { width } = entry.contentRect;
    entry.target.className = width > 600 ? 'large' : 'small';
  });
});

// MutationObserver - DOM changes
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    console.log('DOM changed:', mutation.type);
  });
});
```

**Common use cases:**
- Infinite scrolling, lazy loading, animations on scroll
- Container queries, responsive components
- Framework reactivity, debugging DOM changes

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Browser observers solve performance and usability problems with traditional event-based approaches:

**Performance benefits:**
- **Asynchronous**: Don't block main thread like synchronous property reads
- **Batched notifications**: Multiple changes reported together
- **Native optimization**: Browser can optimize when to fire callbacks

**Traditional problems solved:**
```javascript
// ❌ Performance issues with scroll events
window.addEventListener('scroll', () => {
  // Fires hundreds of times per second
  // Forces layout recalculation
  elements.forEach(el => {
    const rect = el.getBoundingClientRect(); // Expensive!
    if (rect.top < window.innerHeight) {
      // Handle intersection
    }
  });
});

// ✅ Optimized with IntersectionObserver
const observer = new IntersectionObserver(callback);
// Browser handles optimization internally
```

**Developer experience:**
- Declarative API instead of imperative event handling
- Built-in debouncing and optimization
- Consistent behavior across different browsers

</details>

<details>
<summary>How it works</summary>
**IntersectionObserver:**
```javascript
// Advanced intersection observer setup
const options = {
  // Root element (viewport by default)
  root: null,
  
  // Root margin - expand/shrink root area
  rootMargin: '50px 0px -100px 0px', // top right bottom left
  
  // Trigger thresholds
  threshold: [0, 0.25, 0.5, 0.75, 1.0] // Fire at each threshold
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    const ratio = entry.intersectionRatio;
    const element = entry.target;
    
    // Rich information available
    console.log({
      isIntersecting: entry.isIntersecting,
      ratio: ratio,
      intersectionRect: entry.intersectionRect,
      boundingClientRect: entry.boundingClientRect,
      rootBounds: entry.rootBounds,
      time: entry.time
    });
    
    // Progressive opacity based on visibility
    element.style.opacity = ratio;
  });
}, options);

// Usage patterns
class LazyImage extends HTMLElement {
  constructor() {
    super();
    this.observer = new IntersectionObserver(this.handleIntersection);
    this.observer.observe(this);
  }
  
  handleIntersection = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage();
        this.observer.unobserve(this);
      }
    });
  }
  
  loadImage() {
    const img = this.querySelector('img');
    img.src = img.dataset.src;
    img.classList.add('loaded');
  }
}
```

**ResizeObserver:**
```javascript
// Comprehensive resize observing
const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach(entry => {
    // Multiple measurement types available
    const { target } = entry;
    
    // Content box (content area only)
    const contentRect = entry.contentRect;
    
    // Border box (includes border and padding)  
    const borderBoxSize = entry.borderBoxSize?.[0];
    
    // Device pixel box (for high DPI)
    const devicePixelContentBoxSize = entry.devicePixelContentBoxSize?.[0];
    
    console.log({
      element: target,
      contentSize: {
        width: contentRect.width,
        height: contentRect.height
      },
      borderSize: borderBoxSize ? {
        inlineSize: borderBoxSize.inlineSize,
        blockSize: borderBoxSize.blockSize
      } : null
    });
    
    // Container query-like behavior
    if (contentRect.width > 800) {
      target.classList.add('large-container');
    } else {
      target.classList.remove('large-container');
    }
  });
});

// Responsive component pattern
class ResponsiveCard extends HTMLElement {
  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this);
  }
  
  handleResize = (entries) => {
    entries.forEach(entry => {
      const width = entry.contentRect.width;
      this.className = this.getLayoutClass(width);
    });
  }
  
  getLayoutClass(width) {
    if (width > 600) return 'card-horizontal';
    if (width > 300) return 'card-vertical';
    return 'card-minimal';
  }
}
```

**MutationObserver:**
```javascript
// Comprehensive mutation observing
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    switch (mutation.type) {
      case 'childList':
        // Nodes added/removed
        mutation.addedNodes.forEach(node => {
          console.log('Added:', node);
        });
        mutation.removedNodes.forEach(node => {
          console.log('Removed:', node);
        });
        break;
        
      case 'attributes':
        // Attribute changes
        console.log(`Attribute ${mutation.attributeName} changed on`, mutation.target);
        console.log('Old value:', mutation.oldValue);
        break;
        
      case 'characterData':
        // Text content changes
        console.log('Text changed:', mutation.target);
        break;
    }
  });
});

// Configuration options
mutationObserver.observe(document.body, {
  childList: true,        // Monitor child additions/removals
  subtree: true,          // Monitor entire subtree
  attributes: true,       // Monitor attribute changes
  attributeOldValue: true, // Include old attribute values
  characterData: true,    // Monitor text changes
  characterDataOldValue: true, // Include old text values
  attributeFilter: ['class', 'style'] // Only specific attributes
});

// Framework integration example
class ReactivitySystem {
  constructor() {
    this.dependencies = new Map();
    this.observer = new MutationObserver(this.handleMutations);
  }
  
  trackElement(element, callback) {
    this.dependencies.set(element, callback);
    this.observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }
  
  handleMutations = (mutations) => {
    const changedElements = new Set();
    
    mutations.forEach(mutation => {
      changedElements.add(mutation.target);
      // Also check parent elements
      let parent = mutation.target.parentElement;
      while (parent && this.dependencies.has(parent)) {
        changedElements.add(parent);
        parent = parent.parentElement;
      }
    });
    
    changedElements.forEach(element => {
      const callback = this.dependencies.get(element);
      if (callback) callback(element);
    });
  }
}
```

**PerformanceObserver:**
```javascript
// Monitor various performance metrics
const perfObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    switch (entry.entryType) {
      case 'paint':
        console.log(`${entry.name}: ${entry.startTime}ms`);
        break;
      case 'largest-contentful-paint':
        console.log(`LCP: ${entry.startTime}ms`, entry.element);
        break;
      case 'first-input':
        console.log(`FID: ${entry.processingStart - entry.startTime}ms`);
        break;
      case 'layout-shift':
        console.log(`Layout shift: ${entry.value}`, entry.sources);
        break;
    }
  });
});

// Observe multiple entry types
perfObserver.observe({ 
  entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
});
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Observers fire immediately when changes occur"**
- Observers are asynchronous and batched
- Callbacks fire when browser is ready, not immediately
- Use `requestAnimationFrame` for immediate visual updates

**❌ "IntersectionObserver threshold is percentage of element visible"**
```javascript
// ❌ Wrong interpretation
threshold: 0.5 // "Fire when 50% of element is visible"

// ✅ Correct interpretation  
threshold: 0.5 // "Fire when intersection ratio crosses 50%"
// Could be 50% of element OR 50% of root area, whichever is smaller
```

**❌ "ResizeObserver only fires when element size changes"**
- Can fire when content changes even if size doesn't
- Initial observation always fires callback
- May fire during layout/reflow cycles

**❌ "MutationObserver catches all DOM changes"**
```javascript
// ❌ Doesn't observe these changes:
element.textContent; // Reading doesn't trigger
element.style.color; // Only if observing attributes
element.focus(); // Focus changes not observed
element.scrollTop = 100; // Scroll changes not observed

// ✅ Observes these:
element.appendChild(child); // childList
element.setAttribute('class', 'new'); // attributes
element.textContent = 'new'; // characterData
```

**❌ "Observers don't need cleanup"**
```javascript
// ❌ Memory leaks
class Component {
  constructor() {
    this.observer = new IntersectionObserver(callback);
    this.observer.observe(element);
    // Missing cleanup!
  }
}

// ✅ Proper cleanup
class Component {
  constructor() {
    this.observer = new IntersectionObserver(callback);
    this.observer.observe(element);
  }
  
  destroy() {
    this.observer.disconnect();
    this.observer = null;
  }
}
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions:**

**Q: "How would you implement infinite scrolling?"**
```javascript
class InfiniteScroll {
  constructor(container, loadMore) {
    this.container = container;
    this.loadMore = loadMore;
    this.loading = false;
    
    // Create sentinel element
    this.sentinel = document.createElement('div');
    this.sentinel.className = 'scroll-sentinel';
    this.container.appendChild(this.sentinel);
    
    // Observe sentinel
    this.observer = new IntersectionObserver(this.handleIntersection, {
      rootMargin: '100px' // Load before sentinel is fully visible
    });
    this.observer.observe(this.sentinel);
  }
  
  handleIntersection = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loading) {
        this.loadMoreContent();
      }
    });
  }
  
  async loadMoreContent() {
    this.loading = true;
    this.sentinel.textContent = 'Loading...';
    
    try {
      const newItems = await this.loadMore();
      this.renderItems(newItems);
    } catch (error) {
      console.error('Failed to load more content:', error);
    } finally {
      this.loading = false;
      this.sentinel.textContent = '';
    }
  }
  
  renderItems(items) {
    items.forEach(item => {
      const element = this.createItemElement(item);
      this.container.insertBefore(element, this.sentinel);
    });
  }
  
  destroy() {
    this.observer.disconnect();
    this.sentinel.remove();
  }
}

// Usage
const infiniteScroll = new InfiniteScroll(
  document.getElementById('feed'),
  () => fetch('/api/posts').then(r => r.json())
);
```

**Q: "How do you implement container queries without CSS?"**
```javascript
class ContainerQueries {
  constructor() {
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.breakpoints = {
      sm: 320,
      md: 768,
      lg: 1024,
      xl: 1200
    };
  }
  
  observe(element, queries) {
    element.dataset.containerQueries = JSON.stringify(queries);
    this.resizeObserver.observe(element);
  }
  
  handleResize = (entries) => {
    entries.forEach(entry => {
      const { target, contentRect } = entry;
      const queries = JSON.parse(target.dataset.containerQueries || '{}');
      const width = contentRect.width;
      
      // Apply breakpoint classes
      Object.entries(this.breakpoints).forEach(([name, minWidth]) => {
        target.classList.toggle(`container-${name}`, width >= minWidth);
      });
      
      // Apply custom queries
      Object.entries(queries).forEach(([className, condition]) => {
        const matches = this.evaluateCondition(condition, width);
        target.classList.toggle(className, matches);
      });
    });
  }
  
  evaluateCondition(condition, width) {
    // Simple condition parser: "min-width: 600px"
    const match = condition.match(/min-width:\s*(\d+)px/);
    if (match) {
      return width >= parseInt(match[1]);
    }
    return false;
  }
}

// Usage
const cq = new ContainerQueries();
cq.observe(document.querySelector('.card'), {
  'card-wide': 'min-width: 400px',
  'card-narrow': 'max-width: 300px'
});
```

**Q: "How would you debug performance issues with observers?"**
```javascript
// Performance monitoring for observers
class ObserverProfiler {
  constructor() {
    this.metrics = {
      intersectionObserver: { count: 0, totalTime: 0 },
      resizeObserver: { count: 0, totalTime: 0 },
      mutationObserver: { count: 0, totalTime: 0 }
    };
  }
  
  wrapObserver(ObserverClass, type) {
    const self = this;
    return class extends ObserverClass {
      constructor(callback, options) {
        const wrappedCallback = (entries, observer) => {
          const startTime = performance.now();
          callback(entries, observer);
          const endTime = performance.now();
          
          self.metrics[type].count++;
          self.metrics[type].totalTime += endTime - startTime;
          
          // Warn about slow callbacks
          const duration = endTime - startTime;
          if (duration > 16) { // > 1 frame at 60fps
            console.warn(`Slow ${type} callback: ${duration.toFixed(2)}ms`);
          }
        };
        
        super(wrappedCallback, options);
      }
    };
  }
  
  getStats() {
    return Object.entries(this.metrics).map(([type, data]) => ({
      type,
      averageTime: data.count > 0 ? data.totalTime / data.count : 0,
      totalCalls: data.count,
      totalTime: data.totalTime
    }));
  }
}

// Usage
const profiler = new ObserverProfiler();
const ProfiledIntersectionObserver = profiler.wrapObserver(IntersectionObserver, 'intersectionObserver');

const observer = new ProfiledIntersectionObserver(callback);
// Monitor performance via profiler.getStats()
```

**Performance best practices:**
- **Debounce callbacks**: Avoid expensive operations on every callback
- **Batch updates**: Collect multiple changes before applying
- **Use passive observers**: Don't modify DOM synchronously in callbacks
- **Proper cleanup**: Always disconnect observers when done
- **Monitor performance**: Track callback execution time

</details>