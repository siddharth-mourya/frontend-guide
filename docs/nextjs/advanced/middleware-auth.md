# Middleware & Authentication

## ⚡ Quick Revision
- **Middleware**: Runs before request completion, can modify requests/responses
- **Edge Runtime**: Lightweight runtime for middleware, faster cold starts
- **Request Modification**: Rewrite URLs, add headers, redirect users
- **Authentication Flow**: JWT validation, session management, route protection
- **Matcher Config**: Control which routes middleware runs on
- **NextResponse**: Modify responses, set cookies, add headers

```javascript
// middleware.js
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/login')) {
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const payload = verify(token, process.env.JWT_SECRET);
      
      // Add user info to request headers
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId);
      return response;
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Matcher configuration
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/dashboard/:path*',
    '/api/protected/:path*'
  ]
};

// Advanced middleware with role-based access
export async function middleware(request) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Role-based access control
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await getSession(request);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return response;
}
```

**Common Pitfalls:**
- Running heavy computations in middleware (use Edge Runtime limitations)
- Not configuring matcher properly (middleware runs on every route)
- Forgetting to handle edge cases in authentication logic

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Performance Benefits:**
- Runs at the edge, closer to users
- Lightweight Edge Runtime for faster execution
- Avoids full page renders for redirects and access control

**Security Enhancement:**
- Centralized authentication and authorization
- Request sanitization and validation
- Protection against common attacks (CSRF, XSS headers)

**User Experience:**
- Instant redirects without page flashes
- Seamless authentication flows
- Personalized content based on user context
</details>

<details>
<summary>How it works</summary>
**Middleware Execution Flow:**
```
Incoming Request
    ↓
Edge Runtime (Middleware)
    ↓ 
Response Modification
    ↓
Next.js Server/API Routes
    ↓
Final Response
```

**Authentication Patterns:**
```javascript
// Session-based authentication
import { getIronSession } from 'iron-session/edge';

export async function middleware(request) {
  const response = NextResponse.next();
  
  try {
    const session = await getIronSession(request, response, {
      password: process.env.SESSION_SECRET,
      cookieName: 'user-session',
    });
    
    if (request.nextUrl.pathname.startsWith('/protected')) {
      if (!session.user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Add user context to headers
      response.headers.set('x-user-id', session.user.id);
      response.headers.set('x-user-role', session.user.role);
    }
    
    return response;
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// JWT-based authentication with refresh
export async function middleware(request) {
  const accessToken = request.cookies.get('access-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;
  
  if (isProtectedRoute(request.nextUrl.pathname)) {
    if (!accessToken) {
      return redirectToLogin(request);
    }
    
    try {
      const payload = await verifyJWT(accessToken);
      return addUserToHeaders(payload);
    } catch (error) {
      // Try to refresh token
      if (refreshToken) {
        try {
          const newTokens = await refreshAccessToken(refreshToken);
          const response = NextResponse.next();
          
          // Set new tokens
          response.cookies.set('access-token', newTokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
          });
          
          return response;
        } catch (refreshError) {
          return redirectToLogin(request);
        }
      }
      
      return redirectToLogin(request);
    }
  }
  
  return NextResponse.next();
}
```

**Advanced Middleware Patterns:**
```javascript
// A/B testing middleware
export async function middleware(request) {
  const response = NextResponse.next();
  
  // Skip A/B testing for bots
  const userAgent = request.headers.get('user-agent') || '';
  if (isBot(userAgent)) {
    return response;
  }
  
  // Get or set experiment variant
  let variant = request.cookies.get('experiment-variant')?.value;
  
  if (!variant) {
    variant = Math.random() > 0.5 ? 'A' : 'B';
    response.cookies.set('experiment-variant', variant, {
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }
  
  // Rewrite URL based on variant
  if (request.nextUrl.pathname === '/pricing' && variant === 'B') {
    return NextResponse.rewrite(new URL('/pricing-v2', request.url));
  }
  
  return response;
}

// Geographic redirects
export async function middleware(request) {
  const country = request.geo?.country || 'US';
  const { pathname } = request.nextUrl;
  
  // Redirect EU users to GDPR-compliant version
  if (isEUCountry(country) && !pathname.startsWith('/eu')) {
    return NextResponse.redirect(
      new URL(`/eu${pathname}`, request.url)
    );
  }
  
  // Block certain countries
  if (isBlockedCountry(country)) {
    return NextResponse.redirect(
      new URL('/blocked', request.url)
    );
  }
  
  return NextResponse.next();
}

// Rate limiting middleware
const rateLimiter = new Map();

export async function middleware(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for');
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100;
  
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const current = rateLimiter.get(key) || 0;
  
  if (current >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  rateLimiter.set(key, current + 1);
  
  // Cleanup old entries
  if (Math.random() < 0.1) {
    const cutoff = now - windowMs;
    for (const [k] of rateLimiter) {
      const [, timestamp] = k.split(':');
      if (parseInt(timestamp) * windowMs < cutoff) {
        rateLimiter.delete(k);
      }
    }
  }
  
  return NextResponse.next();
}
```

**Integration with Server Components:**
```javascript
// Reading middleware headers in Server Components
export default async function ProtectedPage() {
  const userId = headers().get('x-user-id');
  const userRole = headers().get('x-user-role');
  
  if (!userId) {
    redirect('/login');
  }
  
  const userData = await fetchUserData(userId);
  
  return (
    <div>
      <h1>Welcome, {userData.name}</h1>
      {userRole === 'admin' && <AdminPanel />}
    </div>
  );
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"Middleware can access database directly"**
- Edge Runtime has limited APIs, no Node.js APIs
- Use external services or API routes for database access

**"Middleware runs on every request"**
- Only runs on routes matching the matcher config
- Properly configure matcher to avoid unnecessary execution

**"Middleware can modify request body"**
- Request body is read-only in middleware
- Use headers or cookies to pass data to downstream handlers

**"Middleware replaces API route authentication"**
- Middleware handles routing-level auth
- API routes still need their own validation for direct access
</details>

<details>
<summary>Interview angle</summary>
**Security Questions:**
- "How do you implement role-based access control with middleware?"
- "What's your strategy for handling authentication in a microservices architecture?"
- "How do you prevent common security vulnerabilities in middleware?"

**Real-world Scenarios:**
```javascript
// Multi-tenant SaaS application
export async function middleware(request) {
  const hostname = request.headers.get('host');
  const subdomain = hostname?.split('.')[0];
  
  // Handle custom domains
  if (hostname && !hostname.includes('myapp.com')) {
    const tenant = await getTenantByDomain(hostname);
    if (tenant) {
      const response = NextResponse.rewrite(
        new URL(`/tenant/${tenant.id}${request.nextUrl.pathname}`, request.url)
      );
      response.headers.set('x-tenant-id', tenant.id);
      return response;
    }
  }
  
  // Handle subdomains
  if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
    const tenant = await getTenantBySubdomain(subdomain);
    if (tenant) {
      return NextResponse.rewrite(
        new URL(`/tenant/${tenant.id}${request.nextUrl.pathname}`, request.url)
      );
    }
  }
  
  return NextResponse.next();
}

// Feature flag middleware
export async function middleware(request) {
  const userId = await getUserId(request);
  const features = await getFeatureFlags(userId);
  
  // Block access to beta features
  if (request.nextUrl.pathname.startsWith('/beta') && !features.betaAccess) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }
  
  // A/B test routing
  if (features.newDashboard) {
    if (request.nextUrl.pathname === '/dashboard') {
      return NextResponse.rewrite(new URL('/dashboard-v2', request.url));
    }
  }
  
  const response = NextResponse.next();
  response.headers.set('x-features', JSON.stringify(features));
  return response;
}
```

**Performance Optimization:**
- Caching strategies for authentication checks
- Optimizing middleware for high-traffic applications
- Balancing security vs performance in middleware

**Architecture Decisions:**
- When to use middleware vs API routes for auth
- Structuring middleware for complex applications
- Handling middleware failures and fallbacks
</details>