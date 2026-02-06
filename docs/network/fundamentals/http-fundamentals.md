# HTTP Fundamentals

## ⚡ Quick Revision
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove), PATCH (partial update)
- **Status Codes**: 2xx success, 3xx redirect, 4xx client error, 5xx server error
- **Key Headers**: Content-Type, Accept, Authorization, Cache-Control, User-Agent
- **Caching**: ETags, Last-Modified, Cache-Control, max-age, no-cache, no-store
- **HTTP/2**: Multiplexing, server push, header compression, binary protocol

```javascript
// HTTP request with modern fetch
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'Cache-Control': 'no-cache'
  },
  body: JSON.stringify({ name: 'John', email: 'john@example.com' })
});

// Handle different status codes
if (response.status === 201) {
  const user = await response.json();
} else if (response.status === 409) {
  throw new Error('User already exists');
}
```

**Critical headers:**
- `Content-Type`: `application/json`, `text/html`, `multipart/form-data`
- `Accept`: Client preferences for response format
- `Cache-Control`: Caching directives (`max-age=3600`, `no-cache`)

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
HTTP is the foundation of web communication, designed for distributed, collaborative, hypermedia information systems:

**Stateless protocol:**
- Each request is independent, enabling scalability
- No server-side session state required between requests
- Enables load balancing and horizontal scaling

**Client-server architecture:**
- Clear separation of concerns between client and server
- Enables independent evolution of client and server code
- Supports caching at multiple levels

**Human-readable format (HTTP/1.x):**
- Easy debugging and development
- Self-documenting protocol
- Wide tool support

**Extensible design:**
- Custom headers for application-specific needs
- Method extensibility for different operations
- Content negotiation for format flexibility

</details>

<details>
<summary>How it works</summary>
**HTTP Request Structure:**
```
GET /api/users/123 HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cache-Control: no-cache
If-None-Match: "abc123"

[Optional request body]
```

**HTTP Response Structure:**
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 156
ETag: "def456"
Cache-Control: max-age=3600
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT

{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**HTTP Methods in Detail:**
```javascript
// RESTful API patterns
class UserAPI {
  // GET - Retrieve data (idempotent, safe)
  async getUser(id) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 404) {
      throw new Error('User not found');
    }
  }
  
  // POST - Create new resource (not idempotent)
  async createUser(userData) {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (response.status === 201) {
      return response.json();
    } else if (response.status === 409) {
      throw new Error('User already exists');
    }
  }
  
  // PUT - Replace entire resource (idempotent)
  async updateUser(id, userData) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    return response.status === 200 ? response.json() : null;
  }
  
  // PATCH - Partial update (may or may not be idempotent)
  async patchUser(id, changes) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json-patch+json' },
      body: JSON.stringify([
        { op: 'replace', path: '/email', value: changes.email }
      ])
    });
    
    return response.json();
  }
  
  // DELETE - Remove resource (idempotent)
  async deleteUser(id) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE'
    });
    
    return response.status === 204; // No content
  }
  
  // HEAD - Get headers only (useful for checking existence)
  async userExists(id) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'HEAD'
    });
    
    return response.status === 200;
  }
  
  // OPTIONS - Check available methods (CORS preflight)
  async getAvailableMethods() {
    const response = await fetch('/api/users', {
      method: 'OPTIONS'
    });
    
    return response.headers.get('Allow');
  }
}
```

**Status Codes Deep Dive:**
```javascript
// Comprehensive status code handling
class HTTPStatusHandler {
  static handle(response) {
    const { status, statusText } = response;
    
    // 1xx Informational
    if (status === 100) return this.handleContinue(response);
    if (status === 101) return this.handleSwitchingProtocols(response);
    
    // 2xx Success
    if (status === 200) return this.handleSuccess(response);
    if (status === 201) return this.handleCreated(response);
    if (status === 202) return this.handleAccepted(response);
    if (status === 204) return this.handleNoContent(response);
    if (status === 206) return this.handlePartialContent(response);
    
    // 3xx Redirection
    if (status === 301) return this.handleMovedPermanently(response);
    if (status === 302) return this.handleFound(response);
    if (status === 304) return this.handleNotModified(response);
    
    // 4xx Client Error
    if (status === 400) throw new Error('Bad Request: Invalid syntax');
    if (status === 401) throw new Error('Unauthorized: Authentication required');
    if (status === 403) throw new Error('Forbidden: Access denied');
    if (status === 404) throw new Error('Not Found: Resource does not exist');
    if (status === 405) throw new Error('Method Not Allowed');
    if (status === 409) throw new Error('Conflict: Resource already exists');
    if (status === 422) throw new Error('Unprocessable Entity: Validation failed');
    if (status === 429) throw new Error('Too Many Requests: Rate limited');
    
    // 5xx Server Error
    if (status === 500) throw new Error('Internal Server Error');
    if (status === 502) throw new Error('Bad Gateway');
    if (status === 503) throw new Error('Service Unavailable');
    if (status === 504) throw new Error('Gateway Timeout');
    
    throw new Error(`Unhandled status: ${status} ${statusText}`);
  }
  
  static handleNotModified(response) {
    // Resource hasn't changed, use cached version
    return this.getCachedResponse(response.url);
  }
  
  static handlePartialContent(response) {
    // Handle range requests for large files
    const range = response.headers.get('Content-Range');
    return { data: response, range };
  }
}
```

**Header Management:**
```javascript
// Comprehensive header handling
class HTTPHeaders {
  static createRequest(options = {}) {
    const headers = new Headers();
    
    // Content negotiation
    if (options.accept) {
      headers.set('Accept', options.accept);
    } else {
      headers.set('Accept', 'application/json, text/plain, */*');
    }
    
    // Language preferences
    headers.set('Accept-Language', navigator.language || 'en-US');
    
    // Encoding preferences
    headers.set('Accept-Encoding', 'gzip, deflate, br');
    
    // Authentication
    if (options.token) {
      headers.set('Authorization', `Bearer ${options.token}`);
    }
    
    // Content type for POST/PUT/PATCH
    if (options.contentType) {
      headers.set('Content-Type', options.contentType);
    }
    
    // Custom headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
    
    // Security headers
    headers.set('X-Requested-With', 'XMLHttpRequest');
    
    return headers;
  }
  
  static parseResponse(response) {
    const headers = {};
    
    // Extract important headers
    headers.contentType = response.headers.get('Content-Type');
    headers.contentLength = response.headers.get('Content-Length');
    headers.etag = response.headers.get('ETag');
    headers.lastModified = response.headers.get('Last-Modified');
    headers.cacheControl = response.headers.get('Cache-Control');
    
    // Security headers
    headers.csp = response.headers.get('Content-Security-Policy');
    headers.xFrameOptions = response.headers.get('X-Frame-Options');
    
    // CORS headers
    headers.accessControlAllowOrigin = response.headers.get('Access-Control-Allow-Origin');
    headers.accessControlAllowMethods = response.headers.get('Access-Control-Allow-Methods');
    
    return headers;
  }
}
```

**HTTP/2 vs HTTP/1.1:**
```javascript
// HTTP/2 optimization strategies
class HTTP2Optimizer {
  static optimizeRequests() {
    // HTTP/1.1 optimization (avoid these in HTTP/2)
    // - Domain sharding (unnecessary)
    // - Resource concatenation (can be counterproductive)
    // - Sprite sheets (unless very small images)
    
    // HTTP/2 best practices
    return {
      // 1. Use many small resources instead of few large ones
      enableResourceSplitting: true,
      
      // 2. Prioritize critical resources
      prioritization: {
        css: 'highest',
        js: 'high',
        images: 'low',
        fonts: 'medium'
      },
      
      // 3. Leverage server push (if available)
      serverPush: [
        '/css/critical.css',
        '/js/app.js'
      ],
      
      // 4. Optimize headers (HPACK compression)
      compressHeaders: true,
      
      // 5. Use multiplexing effectively
      maxConcurrentStreams: 100
    };
  }
  
  static detectHTTP2Support() {
    // Check if current connection uses HTTP/2
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const entries = performance.getEntriesByName(img.src);
        const entry = entries[entries.length - 1];
        
        // HTTP/2 connections often show nextHopProtocol
        resolve(entry.nextHopProtocol === 'h2');
      };
      img.src = '/1px.gif?' + Math.random();
    });
  }
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "PUT and POST are interchangeable"**
- **PUT**: Idempotent, replaces entire resource, specific URL
- **POST**: Not idempotent, creates resource, collection URL
- PUT `/api/users/123` vs POST `/api/users`

**❌ "HTTPS just encrypts HTTP"**
- HTTPS includes authentication and integrity checking
- Prevents man-in-the-middle attacks
- Required for modern web APIs (geolocation, service workers, etc.)

**❌ "HTTP is stateless so no session management"**
```javascript
// HTTP is stateless, but applications add state via:
// - Cookies
// - JWT tokens
// - Session storage
// - URL parameters

// The protocol itself remains stateless
```

**❌ "Status codes are just suggestions"**
- Status codes have semantic meaning
- Important for caching, error handling, and debugging
- RESTful APIs rely on correct status codes

**❌ "HTTP/2 is always faster than HTTP/1.1"**
- HTTP/2 shines with multiple small resources
- Single large resource might not see improvement
- Server and client both need optimization

</details>

<details>
<summary>Interview angle</summary>
**Common questions:**

**Q: "Explain the difference between PUT and PATCH"**
```javascript
// PUT - Replace entire resource
const putUser = {
  id: 123,
  name: 'John Doe',
  email: 'john.new@example.com',
  phone: '555-0123',
  address: '123 Main St'
};

await fetch('/api/users/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(putUser) // Must include all fields
});

// PATCH - Partial update
const patchOperations = [
  { op: 'replace', path: '/email', value: 'john.new@example.com' },
  { op: 'add', path: '/phone', value: '555-0123' }
];

await fetch('/api/users/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json-patch+json' },
  body: JSON.stringify(patchOperations) // Only changed fields
});

// Or simple PATCH
await fetch('/api/users/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john.new@example.com' })
});
```

**Q: "How do you handle HTTP caching effectively?"**
```javascript
class CacheManager {
  async fetchWithCache(url, options = {}) {
    const cacheKey = this.generateCacheKey(url, options);
    const cached = this.getFromCache(cacheKey);
    
    // Check if cached response is still valid
    if (cached && this.isCacheValid(cached)) {
      return cached.response;
    }
    
    // Add conditional headers if we have cached data
    const headers = new Headers(options.headers);
    
    if (cached) {
      if (cached.etag) {
        headers.set('If-None-Match', cached.etag);
      }
      if (cached.lastModified) {
        headers.set('If-Modified-Since', cached.lastModified);
      }
    }
    
    const response = await fetch(url, { ...options, headers });
    
    // Handle 304 Not Modified
    if (response.status === 304) {
      this.updateCacheTimestamp(cacheKey);
      return cached.response;
    }
    
    // Cache successful responses
    if (response.ok) {
      this.storeInCache(cacheKey, response);
    }
    
    return response;
  }
  
  isCacheValid(cached) {
    const now = Date.now();
    const age = now - cached.timestamp;
    
    // Check max-age directive
    if (cached.maxAge && age > cached.maxAge * 1000) {
      return false;
    }
    
    // Check expires header
    if (cached.expires && now > new Date(cached.expires).getTime()) {
      return false;
    }
    
    return true;
  }
  
  parseCacheControl(cacheControl) {
    const directives = {};
    
    if (!cacheControl) return directives;
    
    cacheControl.split(',').forEach(directive => {
      const [key, value] = directive.trim().split('=');
      directives[key] = value || true;
    });
    
    return directives;
  }
}
```

**Q: "How do you implement proper error handling for HTTP requests?"**
```javascript
class HTTPClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = options.headers || {};
    this.timeout = options.timeout || 30000;
    this.retryConfig = options.retry || { attempts: 3, delay: 1000 };
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = this.buildConfig(options);
    
    for (let attempt = 1; attempt <= this.retryConfig.attempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle different status codes
        if (response.ok) {
          return this.parseResponse(response);
        }
        
        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new HTTPError(response.status, await response.text());
        }
        
        // Retry server errors (5xx) and network errors
        if (attempt === this.retryConfig.attempts) {
          throw new HTTPError(response.status, await response.text());
        }
        
        // Wait before retry
        await this.delay(this.retryConfig.delay * attempt);
        
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new HTTPTimeoutError('Request timeout');
        }
        
        if (error instanceof HTTPError) {
          throw error;
        }
        
        // Network error - retry if attempts remaining
        if (attempt === this.retryConfig.attempts) {
          throw new HTTPNetworkError('Network error: ' + error.message);
        }
        
        await this.delay(this.retryConfig.delay * attempt);
      }
    }
  }
  
  async parseResponse(response) {
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      return response.json();
    }
    
    if (contentType.includes('text/')) {
      return response.text();
    }
    
    if (contentType.includes('multipart/form-data')) {
      return response.formData();
    }
    
    return response.blob();
  }
  
  buildConfig(options) {
    return {
      method: options.method || 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      body: options.body,
      credentials: options.credentials || 'same-origin',
      mode: options.mode || 'cors'
    };
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Custom error classes
class HTTPError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HTTPError';
    this.status = status;
  }
}

class HTTPTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HTTPTimeoutError';
  }
}

class HTTPNetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HTTPNetworkError';
  }
}
```

**Q: "How would you optimize HTTP requests for performance?"**

**Key optimization strategies:**
- **HTTP/2**: Use multiplexing, avoid concatenation
- **Caching**: Implement proper cache headers and ETags
- **Compression**: Enable gzip/brotli compression
- **CDN**: Use content delivery networks for static assets
- **Resource hints**: Preload, prefetch, preconnect
- **Request batching**: Combine related requests when possible

</details>