# Authentication

## ⚡ Quick Revision
- **JWT (JSON Web Tokens)**: Stateless, URL-safe tokens with header.payload.signature structure
- **OAuth 2.0**: Authorization framework for third-party access (Google, Facebook login)
- **Session-based**: Server stores session data, client gets session ID in cookie
- **Token-based**: Client stores token, sends in Authorization header
- **Refresh tokens**: Long-lived tokens to get new access tokens
- **PKCE**: Proof Key for Code Exchange, secures OAuth for SPAs

```javascript
// JWT structure: header.payload.signature
const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Using JWT in requests
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${jwt}`
  }
});

// OAuth flow redirect
window.location.href = 'https://accounts.google.com/oauth/authorize?client_id=123&redirect_uri=https://app.com/callback&response_type=code&scope=email profile';
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Authentication solves identity verification:**
- Confirms user identity before granting access
- Enables personalized experiences and data protection
- Provides audit trails and access control

**Different approaches for different needs:**
- **Sessions**: Traditional server-rendered apps, tight security control
- **JWT**: Microservices, stateless scaling, cross-domain auth
- **OAuth**: Third-party integration, social login, API access delegation

**Security vs usability trade-offs:**
- Strong authentication (2FA) vs user convenience
- Long token expiry vs security risk
- Stateless tokens vs revocation capability

**Compliance and standards:**
- GDPR, SOX, HIPAA compliance requirements
- Industry standards (OAuth, OpenID Connect, SAML)
- Enterprise security requirements

</details>

<details>
<summary>How it works</summary>
**JWT Authentication Flow:**
```javascript
class JWTAuth {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.algorithms = ['HS256', 'RS256'];
  }
  
  // Create JWT token
  createToken(payload, options = {}) {
    const header = {
      alg: options.algorithm || 'HS256',
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now, // Issued at
      exp: now + (options.expiresIn || 3600), // Expires in 1 hour
      iss: options.issuer || 'myapp', // Issuer
      aud: options.audience || 'myapp-users' // Audience
    };
    
    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(tokenPayload));
    
    const signature = this.createSignature(
      `${headerEncoded}.${payloadEncoded}`,
      this.secretKey,
      header.alg
    );
    
    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }
  
  // Verify and decode JWT
  verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const [headerEncoded, payloadEncoded, signature] = parts;
    
    // Decode header and payload
    const header = JSON.parse(this.base64UrlDecode(headerEncoded));
    const payload = JSON.parse(this.base64UrlDecode(payloadEncoded));
    
    // Verify signature
    const expectedSignature = this.createSignature(
      `${headerEncoded}.${payloadEncoded}`,
      this.secretKey,
      header.alg
    );
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    // Check not before
    if (payload.nbf && payload.nbf > now) {
      throw new Error('Token not yet valid');
    }
    
    return payload;
  }
  
  createSignature(data, secret, algorithm) {
    // Simplified - would use proper crypto libraries
    switch (algorithm) {
      case 'HS256':
        return this.hmacSha256(data, secret);
      case 'RS256':
        return this.rsaSha256(data, secret);
      default:
        throw new Error('Unsupported algorithm');
    }
  }
  
  base64UrlEncode(str) {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  base64UrlDecode(str) {
    str += '='.repeat((4 - str.length % 4) % 4);
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }
}

// JWT token management
class TokenManager {
  constructor() {
    this.accessTokenKey = 'access_token';
    this.refreshTokenKey = 'refresh_token';
    this.tokenStorage = localStorage; // or sessionStorage
  }
  
  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const tokens = await response.json();
      
      this.setTokens(tokens.access_token, tokens.refresh_token);
      
      return tokens;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  setTokens(accessToken, refreshToken) {
    this.tokenStorage.setItem(this.accessTokenKey, accessToken);
    
    if (refreshToken) {
      this.tokenStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }
  
  getAccessToken() {
    return this.tokenStorage.getItem(this.accessTokenKey);
  }
  
  getRefreshToken() {
    return this.tokenStorage.getItem(this.refreshTokenKey);
  }
  
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const tokens = await response.json();
      
      this.setTokens(tokens.access_token, tokens.refresh_token);
      
      return tokens.access_token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
  
  clearTokens() {
    this.tokenStorage.removeItem(this.accessTokenKey);
    this.tokenStorage.removeItem(this.refreshTokenKey);
  }
  
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  }
  
  logout() {
    this.clearTokens();
    // Optional: Call logout endpoint to invalidate refresh token
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`
      }
    }).catch(console.error);
  }
}
```

**OAuth 2.0 Implementation:**
```javascript
class OAuth2Client {
  constructor(config) {
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.authUrl = config.authUrl;
    this.tokenUrl = config.tokenUrl;
    this.scope = config.scope || 'openid email profile';
    this.usePKCE = config.usePKCE || true;
  }
  
  // Step 1: Redirect to authorization server
  async initiateAuth() {
    const state = this.generateRandomString(32);
    const nonce = this.generateRandomString(32);
    
    // Store state for validation
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);
    
    let authUrl = `${this.authUrl}?` + new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state: state,
      nonce: nonce
    });
    
    // PKCE for SPAs
    if (this.usePKCE) {
      const codeVerifier = this.generateRandomString(128);
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      
      sessionStorage.setItem('code_verifier', codeVerifier);
      
      authUrl += `&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    }
    
    window.location.href = authUrl;
  }
  
  // Step 2: Handle callback with authorization code
  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }
    
    if (!code) {
      throw new Error('No authorization code received');
    }
    
    // Validate state
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    
    // Exchange code for tokens
    return this.exchangeCodeForTokens(code);
  }
  
  // Step 3: Exchange authorization code for access token
  async exchangeCodeForTokens(code) {
    const tokenParams = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId
    };
    
    // Add PKCE code verifier
    if (this.usePKCE) {
      const codeVerifier = sessionStorage.getItem('code_verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }
      tokenParams.code_verifier = codeVerifier;
    }
    
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(tokenParams)
      });
      
      if (!response.ok) {
        throw new Error('Token exchange failed');
      }
      
      const tokens = await response.json();
      
      // Validate ID token if present (OpenID Connect)
      if (tokens.id_token) {
        await this.validateIdToken(tokens.id_token);
      }
      
      // Store tokens
      this.storeTokens(tokens);
      
      // Clean up temporary data
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_nonce');
      sessionStorage.removeItem('code_verifier');
      
      return tokens;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }
  
  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array, byte => charset[byte % charset.length]).join('');
  }
  
  async validateIdToken(idToken) {
    // Simplified validation - would need proper JWT library
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      
      // Check nonce
      const storedNonce = sessionStorage.getItem('oauth_nonce');
      if (payload.nonce !== storedNonce) {
        throw new Error('Invalid nonce');
      }
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new Error('ID token expired');
      }
      
      return payload;
    } catch (error) {
      console.error('ID token validation failed:', error);
      throw error;
    }
  }
  
  storeTokens(tokens) {
    if (tokens.access_token) {
      localStorage.setItem('access_token', tokens.access_token);
    }
    
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    
    if (tokens.id_token) {
      localStorage.setItem('id_token', tokens.id_token);
    }
  }
}
```

**Session-Based Authentication:**
```javascript
class SessionAuth {
  constructor() {
    this.sessionCookie = 'session_id';
    this.csrfToken = null;
  }
  
  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const result = await response.json();
      
      // Store CSRF token if provided
      if (result.csrf_token) {
        this.csrfToken = result.csrf_token;
      }
      
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  async checkSession() {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        return response.json();
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': this.csrfToken
        }
      });
      
      this.csrfToken = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Middleware to add CSRF token to requests
  async authenticatedFetch(url, options = {}) {
    const config = {
      ...options,
      credentials: 'include'
    };
    
    // Add CSRF token for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase())) {
      config.headers = {
        ...config.headers,
        'X-CSRF-Token': this.csrfToken
      };
    }
    
    const response = await fetch(url, config);
    
    // Handle session expiry
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    return response;
  }
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "JWT tokens should be stored in localStorage for security"**
```javascript
// ❌ XSS vulnerable
localStorage.setItem('token', jwt);

// ✅ More secure options
// 1. Secure httpOnly cookies (immune to XSS)
// 2. In-memory storage (lost on refresh)
// 3. Secure sessionStorage with proper CSP
```

**❌ "JWT tokens are encrypted"**
- JWT tokens are signed, not encrypted
- Payload is base64-encoded, easily readable
- Use JWE (JSON Web Encryption) if encryption needed

**❌ "Refresh tokens should have the same expiry as access tokens"**
- Refresh tokens should be long-lived (days/weeks)
- Access tokens should be short-lived (minutes/hours)
- This enables revocation while maintaining usability

**❌ "OAuth is just for social login"**
- OAuth is for authorization delegation
- Can be used for API access, microservices, etc.
- OpenID Connect adds authentication layer on top

**❌ "Session-based auth doesn't scale"**
- Can scale with session stores (Redis, database)
- Stateless doesn't always mean more scalable
- Consider your specific scaling requirements

</details>

<details>
<summary>Interview angle</summary>
**Common questions:**

**Q: "Compare JWT vs session-based authentication"**
```javascript
// Session-based Authentication
const sessionAuth = {
  pros: [
    'Server controls session lifecycle',
    'Can revoke sessions immediately',
    'Less data sent with each request',
    'Secure by default (httpOnly cookies)'
  ],
  cons: [
    'Requires server-side storage',
    'Harder to scale horizontally',
    'CSRF protection needed',
    'Cross-domain challenges'
  ],
  bestFor: [
    'Traditional web applications',
    'High-security requirements',
    'Single domain applications'
  ]
};

// JWT Authentication
const jwtAuth = {
  pros: [
    'Stateless and scalable',
    'Works across domains',
    'Self-contained user info',
    'Good for microservices'
  ],
  cons: [
    'Can\'t revoke easily',
    'Larger payload size',
    'XSS vulnerable if not stored properly',
    'Token replay attacks possible'
  ],
  bestFor: [
    'SPAs and mobile apps',
    'Microservices architecture',
    'Cross-domain authentication'
  ]
};
```

**Q: "How would you implement secure token storage in an SPA?"**
```javascript
// Secure token storage strategy
class SecureTokenStorage {
  constructor() {
    this.memoryStorage = new Map();
    this.useMemoryStorage = true; // Safest but lost on refresh
  }
  
  // Option 1: In-memory storage (most secure)
  storeInMemory(key, value) {
    this.memoryStorage.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  // Option 2: Secure cookie (if backend supports)
  async storeInSecureCookie(token) {
    // Let backend set httpOnly, secure, sameSite cookie
    await fetch('/api/auth/store-token', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
  }
  
  // Option 3: Encrypted localStorage (fallback)
  async storeEncrypted(key, value) {
    const encryptionKey = await this.getEncryptionKey();
    const encrypted = await this.encrypt(value, encryptionKey);
    localStorage.setItem(key, encrypted);
  }
  
  async getEncryptionKey() {
    // Generate or retrieve encryption key
    // Could be derived from user password or stored securely
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('user-specific-key'),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('app-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encrypt(text, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    return btoa(JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    }));
  }
  
  // Automatic token refresh
  setupAutoRefresh() {
    setInterval(async () => {
      const token = this.getToken();
      if (token && this.willExpireSoon(token)) {
        try {
          await this.refreshToken();
        } catch (error) {
          this.logout();
        }
      }
    }, 60000); // Check every minute
  }
  
  willExpireSoon(token, minutesBuffer = 5) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const bufferTime = minutesBuffer * 60 * 1000;
      return Date.now() + bufferTime > expiryTime;
    } catch {
      return true;
    }
  }
}
```

**Q: "How do you handle authentication in a React application?"**
```javascript
// React Authentication Context
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem('access_token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }
      
      // Validate token with backend
      const response = await fetch('/api/auth/validate', {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(storedToken);
      } else {
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const { user, access_token } = await response.json();
      
      localStorage.setItem('access_token', access_token);
      setUser(user);
      setToken(access_token);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
  };
  
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Usage in components
const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

**Best practices to mention:**
- **Token storage**: In-memory > secure cookies > encrypted localStorage
- **Token expiry**: Short access tokens (15min), longer refresh tokens (7 days)
- **HTTPS only**: All authentication must use HTTPS in production
- **Rate limiting**: Prevent brute force attacks on login endpoints
- **Multi-factor authentication**: Add second factor for sensitive applications

</details>