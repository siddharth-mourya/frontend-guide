# CORS and CSRF

## ⚡ Quick Revision
- **CORS (Cross-Origin Resource Sharing)**: Browser security feature controlling cross-origin requests
- **CSRF (Cross-Site Request Forgery)**: Attack using user's authentication to perform unauthorized actions
- **Preflight requests**: OPTIONS requests for complex CORS requests
- **Same-origin policy**: Protocol + domain + port must match
- **CORS headers**: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`

```javascript
// CORS preflight triggered by:
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'  // Custom header triggers preflight
  },
  body: JSON.stringify({ name: 'John' })
});

// CSRF protection with token
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
  },
  credentials: 'same-origin'
});
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**CORS exists for security:**
- Prevents malicious sites from accessing user data on other domains
- Enables controlled sharing of resources across origins
- Replaces older, more restrictive same-origin policy

**CSRF protection prevents attacks:**
- Malicious sites can't perform actions on behalf of authenticated users
- Protects against hidden forms and image requests that carry credentials
- Ensures requests originate from legitimate sources

**Balance between security and functionality:**
- CORS enables modern web apps while maintaining security
- CSRF protection allows state-changing operations safely
- Both prevent unauthorized access while enabling legitimate use cases

</details>

<details>
<summary>How it works</summary>
**CORS Request Flow:**
```javascript
// Simple CORS request (no preflight)
class CORSSimpleRequest {
  static isSimple(method, headers, contentType) {
    // Simple methods
    const simpleMethods = ['GET', 'HEAD', 'POST'];
    if (!simpleMethods.includes(method)) return false;
    
    // Simple headers only
    const simpleHeaders = [
      'accept', 'accept-language', 'content-language', 'content-type'
    ];
    
    const customHeaders = Object.keys(headers).filter(header => 
      !simpleHeaders.includes(header.toLowerCase())
    );
    
    if (customHeaders.length > 0) return false;
    
    // Simple content types
    const simpleContentTypes = [
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    ];
    
    if (contentType && !simpleContentTypes.includes(contentType)) {
      return false;
    }
    
    return true;
  }
  
  static async makeRequest(url, options = {}) {
    // Simple request - goes directly
    const response = await fetch(url, options);
    
    // Check CORS headers in response
    const allowedOrigin = response.headers.get('Access-Control-Allow-Origin');
    
    if (allowedOrigin !== '*' && allowedOrigin !== window.location.origin) {
      throw new Error('CORS error: Origin not allowed');
    }
    
    return response;
  }
}

// Preflight CORS request
class CORSPreflightRequest {
  static needsPreflight(method, headers, contentType) {
    return !CORSSimpleRequest.isSimple(method, headers, contentType);
  }
  
  static async makeRequest(url, options = {}) {
    // 1. Browser automatically sends preflight OPTIONS request
    const preflightResponse = await this.simulatePreflight(url, options);
    
    // 2. Check preflight response
    if (!this.isPreflightSuccessful(preflightResponse, options)) {
      throw new Error('CORS preflight failed');
    }
    
    // 3. Make actual request
    return fetch(url, options);
  }
  
  static async simulatePreflight(url, options) {
    // This is what the browser does automatically
    return fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': options.method,
        'Access-Control-Request-Headers': Object.keys(options.headers || {}).join(', ')
      }
    });
  }
  
  static isPreflightSuccessful(response, originalOptions) {
    const allowedMethods = response.headers.get('Access-Control-Allow-Methods');
    const allowedHeaders = response.headers.get('Access-Control-Allow-Headers');
    const allowedOrigin = response.headers.get('Access-Control-Allow-Origin');
    
    // Check method is allowed
    if (!allowedMethods.includes(originalOptions.method)) {
      return false;
    }
    
    // Check headers are allowed
    const requestHeaders = Object.keys(originalOptions.headers || {});
    const allowedHeadersList = allowedHeaders.toLowerCase().split(', ');
    
    for (const header of requestHeaders) {
      if (!allowedHeadersList.includes(header.toLowerCase())) {
        return false;
      }
    }
    
    // Check origin is allowed
    const currentOrigin = window.location.origin;
    if (allowedOrigin !== '*' && allowedOrigin !== currentOrigin) {
      return false;
    }
    
    return true;
  }
}

// CORS configuration examples
class CORSConfig {
  // Server-side CORS configuration (Express.js example)
  static expressMiddleware() {
    return (req, res, next) => {
      const allowedOrigins = [
        'https://app.example.com',
        'https://admin.example.com'
      ];
      
      const origin = req.headers.origin;
      
      if (allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
      
      next();
    };
  }
  
  // Client-side CORS handling
  static async handleCORSRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors', // Explicit CORS mode
        credentials: 'include' // Include cookies
      });
      
      return response;
    } catch (error) {
      if (error.message.includes('CORS')) {
        console.error('CORS error. Check server configuration.');
        throw new Error('Cross-origin request blocked');
      }
      throw error;
    }
  }
}
```

**CSRF Attack and Protection:**
```javascript
// CSRF Attack Example (what we're protecting against)
class CSRFAttack {
  // Malicious website creates hidden form
  static createMaliciousForm() {
    // This would be on attacker's site
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://bank.example.com/transfer';
    form.style.display = 'none';
    
    const amountInput = document.createElement('input');
    amountInput.name = 'amount';
    amountInput.value = '1000';
    
    const toInput = document.createElement('input');
    toInput.name = 'to';
    toInput.value = 'attacker@evil.com';
    
    form.appendChild(amountInput);
    form.appendChild(toInput);
    
    // Auto-submit when user visits page
    document.body.appendChild(form);
    form.submit(); // Uses user's authentication cookies!
  }
}

// CSRF Protection Implementation
class CSRFProtection {
  constructor() {
    this.token = this.generateToken();
    this.setupTokenManagement();
  }
  
  generateToken() {
    // Generate cryptographically secure token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  setupTokenManagement() {
    // Add token to all forms
    document.addEventListener('DOMContentLoaded', () => {
      this.addTokensToForms();
      this.setupAjaxInterceptor();
    });
  }
  
  addTokensToForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Skip GET forms
      if (form.method.toLowerCase() === 'get') return;
      
      // Check if token already exists
      if (form.querySelector('input[name="_csrf_token"]')) return;
      
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = '_csrf_token';
      tokenInput.value = this.token;
      
      form.appendChild(tokenInput);
    });
  }
  
  setupAjaxInterceptor() {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      // Add CSRF token to state-changing requests
      if (this.isStateChanging(options.method)) {
        options.headers = {
          ...options.headers,
          'X-CSRF-Token': this.token
        };
      }
      
      return originalFetch(url, options);
    };
    
    // Intercept XMLHttpRequest
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.send = function(data) {
      if (this.method && this.isStateChanging(this.method)) {
        this.setRequestHeader('X-CSRF-Token', this.token);
      }
      
      return originalSend.call(this, data);
    };
  }
  
  isStateChanging(method = 'GET') {
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    return stateChangingMethods.includes(method.toUpperCase());
  }
  
  // Token refresh mechanism
  async refreshToken() {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      this.token = data.token;
      
      // Update all existing forms
      this.updateExistingTokens();
      
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
  }
  
  updateExistingTokens() {
    document.querySelectorAll('input[name="_csrf_token"]').forEach(input => {
      input.value = this.token;
    });
    
    // Update meta tag if present
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      metaTag.setAttribute('content', this.token);
    }
  }
  
  // Validate token on server (example)
  static validateToken(req, res, next) {
    const token = req.headers['x-csrf-token'] || req.body._csrf_token;
    const sessionToken = req.session.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    next();
  }
}

// SameSite cookie protection (additional CSRF protection)
class SameSiteProtection {
  static setCookie(name, value, options = {}) {
    const cookieOptions = {
      sameSite: 'Strict', // or 'Lax' for more compatibility
      secure: location.protocol === 'https:', // Require HTTPS
      httpOnly: true, // Prevent JavaScript access
      ...options
    };
    
    let cookieString = `${name}=${value}`;
    
    Object.entries(cookieOptions).forEach(([key, val]) => {
      if (val === true) {
        cookieString += `; ${key}`;
      } else if (val !== false) {
        cookieString += `; ${key}=${val}`;
      }
    });
    
    document.cookie = cookieString;
  }
  
  // Different SameSite modes
  static configureSameSite() {
    return {
      // Strict: Cookie only sent for same-site requests
      strict: { sameSite: 'Strict' },
      
      // Lax: Cookie sent for top-level navigation (links)
      lax: { sameSite: 'Lax' },
      
      // None: Cookie sent for all cross-site requests (requires Secure)
      none: { sameSite: 'None', secure: true }
    };
  }
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "CORS is a client-side security feature"**
- CORS is enforced by the browser, not the server
- Server sets headers, browser enforces the policy
- Malicious actors can bypass CORS by not using a browser

**❌ "Setting Access-Control-Allow-Origin: * is safe"**
```javascript
// ❌ Dangerous with credentials
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Credentials', 'true');

// ✅ Safe approach
const allowedOrigins = ['https://app.example.com'];
if (allowedOrigins.includes(req.headers.origin)) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
```

**❌ "CSRF tokens prevent all attack types"**
- CSRF tokens only prevent cross-site request forgery
- Don't protect against XSS, injection, or other attacks
- Must be combined with other security measures

**❌ "SameSite cookies eliminate need for CSRF tokens"**
- SameSite provides defense in depth, not complete protection
- Browser support varies
- CSRF tokens still recommended for sensitive operations

**❌ "Preflight requests happen for all cross-origin requests"**
- Only complex requests trigger preflight
- Simple requests (GET, POST with simple headers) go directly
- Browser automatically handles preflight, not developer-controlled

</details>

<details>
<summary>Interview angle</summary>
**Common questions:**

**Q: "Explain when and why CORS preflight requests are triggered"**
```javascript
// Examples of requests that trigger preflight

// 1. Custom headers
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer token',  // Custom header
    'X-Custom-Header': 'value'       // Custom header
  }
});

// 2. Non-simple methods
fetch('https://api.example.com/data', {
  method: 'PUT'  // Not GET, HEAD, or POST
});

// 3. Complex content types
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'  // Not simple content type
  },
  body: JSON.stringify({ data: 'value' })
});

// Requests that DON'T trigger preflight
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'name=john&email=john@example.com'
});
```

**Q: "How would you implement CSRF protection in a React application?"**
```javascript
// React CSRF Protection Hook
import { useState, useEffect, useContext, createContext } from 'react';

const CSRFContext = createContext();

export const CSRFProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    fetchCSRFToken();
  }, []);
  
  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'same-origin'
      });
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  };
  
  const refreshToken = () => {
    fetchCSRFToken();
  };
  
  return (
    <CSRFContext.Provider value={{ token, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  );
};

export const useCSRF = () => {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within CSRFProvider');
  }
  return context;
};

// Protected fetch hook
export const useProtectedFetch = () => {
  const { token } = useCSRF();
  
  const protectedFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error('CSRF token not available');
    }
    
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      options.method?.toUpperCase()
    );
    
    if (isStateChanging) {
      options.headers = {
        ...options.headers,
        'X-CSRF-Token': token
      };
    }
    
    options.credentials = options.credentials || 'same-origin';
    
    return fetch(url, options);
  };
  
  return protectedFetch;
};

// Usage in component
const UserForm = () => {
  const protectedFetch = useProtectedFetch();
  
  const handleSubmit = async (userData) => {
    try {
      const response = await protectedFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Submit failed');
      
      const result = await response.json();
      console.log('User created:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
};
```

**Q: "How do you handle CORS in different deployment scenarios?"**
```javascript
// Development vs Production CORS handling
class CORSManager {
  static getConfig(environment) {
    switch (environment) {
      case 'development':
        return {
          origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
          credentials: true,
          optionsSuccessStatus: 200
        };
        
      case 'staging':
        return {
          origin: ['https://staging.example.com'],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization']
        };
        
      case 'production':
        return {
          origin: (origin, callback) => {
            const allowedOrigins = [
              'https://app.example.com',
              'https://admin.example.com'
            ];
            
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('Not allowed by CORS'));
            }
          },
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
          maxAge: 86400 // 24 hours
        };
        
      default:
        throw new Error('Unknown environment');
    }
  }
  
  // Dynamic CORS based on request
  static dynamicCORS(req, res, next) {
    const origin = req.headers.origin;
    const userAgent = req.headers['user-agent'];
    
    // Different rules for different clients
    if (userAgent && userAgent.includes('Mobile')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (origin && origin.includes('admin')) {
      // Admin interface gets full access
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', '*');
    } else {
      // Limited access for public clients
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    }
    
    next();
  }
}
```

**Security best practices to mention:**
- **CORS**: Use specific origins, not `*` with credentials
- **CSRF**: Implement double-submit cookies or synchronizer tokens
- **SameSite**: Use `Strict` or `Lax` for session cookies
- **Content Security Policy**: Add additional layer of protection
- **HTTPS**: Required for secure cookies and modern browser features

</details>