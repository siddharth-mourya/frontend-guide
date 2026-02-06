# Caching

## ⚡ Quick Revision
- **Browser cache**: Stores resources locally to avoid network requests
- **Cache-Control**: `max-age`, `no-cache`, `no-store`, `public`, `private`, `must-revalidate`
- **ETags**: Resource fingerprint for validation-based caching
- **Service Workers**: Programmable cache with full control over requests
- **Cache strategies**: Cache-first, Network-first, Stale-while-revalidate
- **Memory vs Disk cache**: Fast vs persistent storage

```javascript
// Cache-Control examples
'Cache-Control: max-age=3600'              // Cache for 1 hour
'Cache-Control: no-cache'                  // Validate before use
'Cache-Control: no-store'                  // Don't cache at all
'Cache-Control: max-age=3600, must-revalidate'  // Validate after expiry
'Cache-Control: public, max-age=31536000'  // Cache for 1 year (immutable assets)

// ETag validation
// Server sends: ETag: "abc123"
// Browser requests with: If-None-Match: "abc123"
// Server responds: 304 Not Modified (if unchanged)

// Service Worker caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Cache hit
      }
      return fetch(event.request).then(response => {
        // Cache the new response
        return caches.open('v1').then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
```

**Cache decision tree:**
```
Is it user-specific data? → no-store or private
Is it static asset with hash? → max-age=31536000, immutable
Is it API data that changes? → max-age=60, must-revalidate
Is it HTML page? → no-cache or short max-age
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Caching solves performance and cost problems:**

1. **Reduced latency**
   - Serving from cache: ~0ms
   - Network request: ~50-300ms
   - Loading from disk vs network is 100-1000x faster
   - Critical for perceived performance

2. **Reduced bandwidth costs**
   - Images, CSS, JS can be megabytes
   - Millions of users = expensive bandwidth
   - CDN costs reduced with client-side caching
   - Mobile users save data usage

3. **Reduced server load**
   - Cached responses don't hit server
   - Enables scaling to more users
   - Database queries avoided
   - Cost savings on infrastructure

4. **Offline functionality**
   - Service Workers enable offline-first apps
   - Progressive Web Apps work without network
   - Better user experience in poor network conditions

**Evolution of caching:**
- **HTTP/1.0**: `Expires` header with absolute dates
- **HTTP/1.1**: `Cache-Control` with relative times
- **Modern**: ETags, Service Workers, sophisticated strategies
- **Future**: Speculation rules API, predictive prefetching

**Trade-offs:**
- Freshness vs performance
- Storage limits (~50MB per origin)
- Privacy concerns (cache-based tracking)
- Complexity in invalidation

</details>

<details>
<summary>How it works</summary>
**Browser Cache Flow:**

```
Request → Memory Cache? → Disk Cache? → Network
            ↓ Hit            ↓ Hit         ↓
          Return          Return       Fetch & Cache
```

**Cache-Control Directives in Detail:**

```javascript
// max-age: Cache for N seconds
'Cache-Control: max-age=3600'  // 1 hour
// Browser won't make network request for 3600 seconds

// no-cache: Validate before use (ETag check)
'Cache-Control: no-cache'
// Browser checks with server (304 if unchanged)

// no-store: Don't cache at all
'Cache-Control: no-store'
// For sensitive data, user-specific content

// public vs private
'Cache-Control: public'   // Can be cached by CDN, proxy
'Cache-Control: private'  // Only browser cache, not CDN

// must-revalidate: Validate after expiration
'Cache-Control: max-age=3600, must-revalidate'
// After 3600s, must check with server

// immutable: Never changes (content-hashed assets)
'Cache-Control: max-age=31536000, immutable'
// main.abc123.js - hash changes if content changes
```

**ETag Validation Process:**

```
1. First request:
   GET /api/users
   
   Response:
   ETag: "abc123"
   Content: [user data]
   Cache-Control: no-cache

2. Second request (from cache):
   GET /api/users
   If-None-Match: "abc123"
   
   Response if unchanged:
   304 Not Modified
   ETag: "abc123"
   (No body, browser uses cached content)
   
   Response if changed:
   200 OK
   ETag: "xyz789"
   Content: [new user data]
```

**Service Worker Cache Strategies:**

**1. Cache First (Cache, falling back to network)**
```javascript
// Best for: Static assets, images, fonts
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        return caches.open('v1').then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
```

**2. Network First (Network, falling back to cache)**
```javascript
// Best for: API requests, dynamic content
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      const clonedResponse = response.clone();
      caches.open('v1').then(cache => {
        cache.put(event.request, clonedResponse);
      });
      return response;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
```

**3. Stale-While-Revalidate (Cache, update in background)**
```javascript
// Best for: Balance of speed and freshness
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('v1').then(cache => {
      return cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      });
    })
  );
});
```

**4. Network Only**
```javascript
// Best for: Real-time data, POST requests
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
```

**5. Cache Only**
```javascript
// Best for: Offline-first apps
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request));
});
```

**Memory Cache vs Disk Cache:**

```javascript
// Memory Cache (fast, volatile)
- Stores decoded resources (parsed CSS, decompressed images)
- Lost on tab close
- ~10-50MB per tab
- Used for: Images, scripts, stylesheets in current session

// Disk Cache (slower, persistent)
- Stores compressed resources
- Survives browser restart
- ~50-100MB per origin
- Used for: Everything per Cache-Control headers

// Browser decides based on:
1. Resource size (large → disk)
2. Request frequency (frequent → memory)
3. Available memory
```

**Cache Busting Techniques:**

```javascript
// 1. Query strings (simple but bypasses some proxies)
<script src="/app.js?v=1.2.3"></script>
<script src="/app.js?v=1648392840"></script> // timestamp

// 2. Filename hashing (best practice)
<script src="/app.abc123.js"></script>
// Webpack/Vite generates: [name].[contenthash].js

// 3. Cache-Control for different content types
// HTML: short cache or no-cache
<meta http-equiv="Cache-Control" content="no-cache, must-revalidate">

// CSS/JS with hash: long cache
Cache-Control: public, max-age=31536000, immutable

// API responses: short cache with validation
Cache-Control: max-age=60, must-revalidate

// User-specific data: no cache
Cache-Control: private, no-store
```

**Storage Limits:**

```javascript
// Check available storage
navigator.storage.estimate().then(estimate => {
  console.log(`Used: ${estimate.usage} bytes`);
  console.log(`Quota: ${estimate.quota} bytes`);
  console.log(`Percentage: ${(estimate.usage / estimate.quota * 100).toFixed(2)}%`);
});

// Typical limits:
// - Chrome: ~60% of disk space (or 6-50% depending on available space)
// - Firefox: ~50% of disk space (max 2GB per origin)
// - Safari: 1GB default, user can grant more
// - Edge: Similar to Chrome
```

**Cache API (Service Worker storage):**

```javascript
// Open cache
const cache = await caches.open('v1');

// Add to cache
await cache.add('/api/users'); // Single request
await cache.addAll(['/styles.css', '/script.js']); // Multiple

// Put response manually
const response = await fetch('/api/users');
await cache.put('/api/users', response);

// Retrieve from cache
const cached = await cache.match('/api/users');
if (cached) {
  const data = await cached.json();
}

// Delete from cache
await cache.delete('/api/users');

// List all cached requests
const keys = await cache.keys();
keys.forEach(request => console.log(request.url));

// Delete entire cache
await caches.delete('v1');

// List all caches
const cacheNames = await caches.keys();
```

**Vary Header (cache key variations):**

```javascript
// Server response:
Vary: Accept-Encoding, Accept-Language

// Creates separate cache entries for:
Accept-Encoding: gzip     → cached separately
Accept-Encoding: br       → cached separately
Accept-Language: en-US    → cached separately
Accept-Language: es       → cached separately

// Common Vary headers:
Vary: Accept-Encoding     // Compressed vs uncompressed
Vary: Accept-Language     // Different languages
Vary: Accept              // JSON vs HTML
Vary: Cookie              // User-specific (careful!)
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Cache-Control: no-cache means don't cache"**
- ✅ Actually means "cache but validate before use"
- Browser caches the response
- Sends `If-None-Match` (ETag) or `If-Modified-Since` on next request
- Server responds 304 if unchanged (saves bandwidth)
- For truly no caching, use `Cache-Control: no-store`

**❌ "Max-age is relative to when resource was created"**
- ✅ Max-age is relative to when response was received
- `max-age=3600` means browser won't request again for 1 hour from now
- Not related to when file was created on server
- Clock skew doesn't affect it (unlike `Expires` header)

**❌ "Clearing browser cache clears Service Worker cache"**
- ✅ These are separate storage systems
- "Clear browsing data" clears HTTP cache
- Service Worker cache persists (Cache API)
- Must manually delete Service Worker caches:
```javascript
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

**❌ "Private means don't cache"**
- ✅ `private` means only browser caches, not CDN/proxy
- Still cached in user's browser
- For no caching at all, use `no-store`
```javascript
Cache-Control: private       // ✅ Cached in browser only
Cache-Control: public        // ✅ Cached everywhere
Cache-Control: no-store      // ❌ Not cached anywhere
```

**❌ "ETags prevent caching"**
- ✅ ETags enable validation-based caching
- Content is still cached locally
- ETag allows conditional requests (304 responses)
- Saves bandwidth but still requires network round-trip

**❌ "Ctrl+F5 (hard refresh) clears cache"**
- ✅ Only for current page's resources
- Sends `Cache-Control: no-cache` with request
- Doesn't delete cached items
- Other pages still use cache
- For full clear: DevTools → Network → Disable cache

**❌ "HTTPS breaks caching"**
- ✅ HTTPS resources cache exactly like HTTP
- `Cache-Control` works identically
- Service Workers require HTTPS but cache normally
- Myth from early SSL days (no longer relevant)

**❌ "Versioned URLs need no-cache"**
- ✅ Content-hashed filenames can use max-age=31536000
- `/app.abc123.js` never changes (hash changes if content changes)
- No need for validation
- Add `immutable` directive for best performance:
```javascript
Cache-Control: public, max-age=31536000, immutable
```

**❌ "Service Workers make websites faster automatically"**
- ✅ Badly configured Service Workers can make sites slower
- Serving stale data when fresh is needed
- Caching API responses that should be fresh
- Large cache size can slow down cache lookups
- Need careful strategy per resource type

</details>

<details>
<summary>Interview angle</summary>
**Common Interview Questions:**

**Q1: "Explain the difference between no-cache, no-store, and must-revalidate"**

```javascript
// no-cache: Cache but validate before use
Cache-Control: no-cache
// Process: Check with server (ETag), use cache if 304

// no-store: Don't cache at all
Cache-Control: no-store
// Process: Always fetch from network, don't save locally

// must-revalidate: After expiry, must validate (no stale serving)
Cache-Control: max-age=3600, must-revalidate
// Process: Use cache for 1h, then MUST check server (can't serve stale)

// Use cases:
no-cache       → HTML pages (validate freshness)
no-store       → Sensitive data (banking, PII)
must-revalidate → Critical data that can't be stale
```

**Q2: "How would you implement a caching strategy for a React app?"**

```javascript
// Strategy:
// 1. HTML: no-cache (always check for updates)
// 2. JS/CSS with hash: max-age=31536000 (immutable)
// 3. API: depends on endpoint
// 4. Images: public, max-age=86400

// webpack/vite config (content hashing)
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js'
  }
};

// Service Worker for offline support
// sw.js
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll([
        '/',
        '/static/css/main.abc123.css',
        '/static/js/main.xyz789.js'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Static assets: Cache First
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request);
      })
    );
  }
  
  // API: Network First
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        const clone = response.clone();
        caches.open(API_CACHE).then(cache => {
          cache.put(request, clone);
        });
        return response;
      }).catch(() => caches.match(request))
    );
  }
  
  // HTML: Network First
  else {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});

// Express server headers
app.use('/static', express.static('build/static', {
  maxAge: '1y',
  immutable: true
}));

app.get('*.html', (req, res) => {
  res.set('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(/*...*/);
});
```

**Q3: "When would you use ETags vs Last-Modified?"**

```javascript
// ETags: Fingerprint of content
ETag: "abc123hash"
Pro: Detects any change, byte-level accuracy
Con: Server must calculate hash

// Last-Modified: Timestamp
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
Pro: Easy to generate (file mtime)
Con: 1-second granularity, clock skew issues

// Use ETags when:
- Content changes frequently
- Changes within same second
- Content-based caching needed
- API responses (data changes)

// Use Last-Modified when:
- Static files (images, PDFs)
- Less frequent changes
- Lower server overhead needed
- Legacy system compatibility

// Both together (best practice):
app.get('/api/users', (req, res) => {
  const users = getUsersFromDB();
  const etag = hash(JSON.stringify(users));
  const lastModified = users.updatedAt;
  
  // Check If-None-Match first (stronger validation)
  if (req.header('If-None-Match') === etag) {
    return res.status(304).end();
  }
  
  // Fallback to If-Modified-Since
  if (req.header('If-Modified-Since') === lastModified) {
    return res.status(304).end();
  }
  
  res.set('ETag', etag);
  res.set('Last-Modified', lastModified);
  res.set('Cache-Control', 'no-cache');
  res.json(users);
});
```

**Q4: "How do you handle cache invalidation in a CDN?"**

```javascript
// Problem: CDN caches content at edge locations
// How to invalidate when content changes?

// 1. Cache Busting (preferred)
// Old: /assets/app.js
// New: /assets/app.v2.js or /assets/app.abc123.js
// HTML references new URL → CDN fetches new file
// Old cached version becomes unused

// 2. Cache Purging (API call to CDN)
// Cloudflare example
await fetch('https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    files: ['https://example.com/app.js']
  })
});

// 3. Cache Tags (group invalidation)
// Tag responses:
Cache-Tag: product-123, category-electronics

// Purge all product-123:
X-Cache-Tags: product-123

// 4. Stale-While-Revalidate (gradual updates)
Cache-Control: max-age=3600, stale-while-revalidate=86400
// Serve cached version, update in background

// Best practice: Combine approaches
- Immutable assets with hash: long cache
- HTML: short cache or CDN bypass
- API: cache tags for granular control
```

**Q5: "Implement a cache with size limits and LRU eviction"**

```javascript
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map(); // Maintains insertion order
  }
  
  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  put(key, value) {
    // Remove if exists (we'll re-add to end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

// Usage
const cache = new LRUCache(3);
cache.put('a', 1);
cache.put('b', 2);
cache.put('c', 3);
cache.put('d', 4); // Evicts 'a'
console.log(cache.has('a')); // false
console.log(cache.get('b')); // 2 (moved to end)
cache.put('e', 5); // Evicts 'c' (b was accessed recently)
```

**Q6: "How would you debug caching issues?"**

```javascript
// Tools and techniques:

// 1. Chrome DevTools Network Tab
// - Size column shows "(from memory cache)" or "(from disk cache)"
// - Disable cache checkbox
// - Filter by has-response-body to see 304 responses

// 2. Check headers
// Request:
If-None-Match: "abc123"
If-Modified-Since: Wed, 21 Oct 2023 07:28:00 GMT
Cache-Control: no-cache (from hard refresh)

// Response:
Cache-Control: max-age=3600
ETag: "abc123"
Age: 1234 (seconds in cache)
X-Cache: HIT (from CDN)

// 3. Service Worker debugging
// Application tab → Service Workers
// - Unregister to test without SW
// - Update on reload
// - Bypass for network

// 4. Clear specific caches
// Console:
caches.keys().then(names => console.log(names));
caches.delete('v1');

// 5. Test with curl
curl -I https://example.com/app.js
curl -H "If-None-Match: abc123" https://example.com/app.js

// 6. Common issues:
// - Mixed cached/uncached versions (version mismatch)
// - Service Worker stuck on old version
// - CDN caching HTML pages
// - No cache busting on updated assets
// - Overly aggressive caching on API responses

// 7. Lighthouse audit
// Checks:
// - Long cache duration for static assets
// - Efficient cache policy
// - Proper use of ETags
```

**Q7: "Explain the performance difference between these caching strategies"**

```javascript
// Measure with Performance API

// 1. No cache (always network)
// Time: ~100-500ms
performance.mark('start');
await fetch('/api/users');
performance.mark('end');
performance.measure('fetch', 'start', 'end');
// Result: ~200ms

// 2. Memory cache (fastest)
// Time: ~0-5ms
// Preloaded resources, same session

// 3. Disk cache (fast)
// Time: ~5-20ms
// Cached across sessions

// 4. 304 Not Modified (moderate)
// Time: ~50-100ms
// Network round-trip, but no body transfer

// 5. Service Worker cache (very fast)
// Time: ~1-10ms
// Programmable, can be faster than disk cache

// Benchmark example:
async function benchmarkCaching() {
  const results = {};
  
  // Network
  performance.mark('network-start');
  await fetch('/api/data?nocache=' + Date.now());
  performance.mark('network-end');
  results.network = performance.measure('network', 'network-start', 'network-end').duration;
  
  // First cache
  performance.mark('cache1-start');
  await fetch('/api/data');
  performance.mark('cache1-end');
  results.firstLoad = performance.measure('cache1', 'cache1-start', 'cache1-end').duration;
  
  // From cache
  performance.mark('cache2-start');
  await fetch('/api/data');
  performance.mark('cache2-end');
  results.cached = performance.measure('cache2', 'cache2-start', 'cache2-end').duration;
  
  console.table(results);
  // network: 245ms
  // firstLoad: 230ms
  // cached: 2ms (memory cache)
}
```

**Red flags in interview responses:**
- Confusing no-cache with no-store
- Not understanding ETag validation
- Thinking cache clearing affects Service Worker caches
- Not considering different strategies for different resources
- Ignoring cache size limits

**Strong answers demonstrate:**
- Understanding of Cache-Control directives
- Knowledge of cache strategies (network-first, cache-first, etc.)
- Awareness of validation (ETags, Last-Modified)
- Practical experience with Service Workers
- Performance impact of caching decisions
- Debugging techniques for cache issues

</details>

---

## 📝 Practice Problems

**Problem 1**: Design caching strategy for e-commerce site
```javascript
// Resources:
// - Product images (rarely change)
// - Product data (changes hourly)
// - User cart (user-specific)
// - Homepage HTML (changes daily)
// - CSS/JS bundles (versioned)

// Design Cache-Control headers for each
```

**Problem 2**: Fix the caching issue
```javascript
// Issue: Users see old content after deployment
app.use(express.static('public', {
  maxAge: '1y'
}));

// index.html references app.js
// Deployed new app.js, but users still see old version
// What's wrong and how to fix?
```

**Problem 3**: Implement stale-while-revalidate
```javascript
// Create fetch wrapper that:
// 1. Returns cached response immediately
// 2. Fetches fresh data in background
// 3. Updates cache for next request

async function staleWhileRevalidate(url) {
  // Your implementation
}
```

---

## 🎯 Key Takeaways

1. **Cache-Control** is the primary caching directive with multiple options
2. **no-cache** means validate, **no-store** means don't cache
3. **ETags** enable validation-based caching (304 responses save bandwidth)
4. **Service Workers** provide programmable caching with full control
5. **Content hashing** (app.abc123.js) enables long cache times safely
6. **Different strategies** for different resource types (HTML vs CSS vs API)
7. **Memory cache** fastest, **disk cache** persistent, **network** slowest
8. **Stale-while-revalidate** balances performance and freshness
9. **Cache invalidation** is hard - prefer cache busting with versioned URLs
10. **Storage limits** exist - implement LRU or other eviction strategies
