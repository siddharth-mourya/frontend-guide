# Content Security Policy (CSP)

## ⚡ Quick Revision

- HTTP header that controls resources browser can load
- Mitigates XSS, clickjacking, and other code injection attacks
- Directive-based: `default-src`, `script-src`, `style-src`, `img-src`, etc.
- Source expressions: `'self'`, `'none'`, `'unsafe-inline'`, `'unsafe-eval'`, `nonce-`, `hash-`
- Report violations with `report-uri` or `report-to`
- Use `Content-Security-Policy-Report-Only` for testing

```
// Basic CSP header
Content-Security-Policy: default-src 'self'

// Allow scripts from self and CDN
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://cdn.example.com

// Strict CSP with nonces
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'nonce-random123'; 
  style-src 'nonce-random123'

// Block inline scripts, allow self and specific domain
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://trusted.com; 
  object-src 'none'; 
  base-uri 'self'; 
  frame-ancestors 'none'
```

**Common directives:**
- `default-src` - Fallback for other directives
- `script-src` - JavaScript sources
- `style-src` - CSS sources
- `img-src` - Image sources
- `connect-src` - AJAX, WebSocket, EventSource
- `font-src` - Font sources
- `frame-src` - iframe sources
- `frame-ancestors` - Sites that can embed (replaces X-Frame-Options)
- `base-uri` - Restricts `<base>` tag URLs
- `form-action` - Form submission targets

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
CSP is a defense-in-depth mechanism against XSS and other injection attacks. Even if an attacker injects a script, CSP can prevent it from executing.

It shifts security from "trust but verify" to "explicit allowlist," making it much harder for attackers to execute malicious code.
</details>

<details>
<summary>How it works</summary>
**CSP Evaluation:**
1. Browser receives CSP header with page
2. When resource loads (script, style, image), browser checks CSP
3. If resource violates policy, browser blocks it
4. Violation can be reported to server

**Source expressions:**

```
// Keyword sources
'none'           // Block everything
'self'           // Same origin
'unsafe-inline'  // Allow inline scripts/styles (⚠️ insecure)
'unsafe-eval'    // Allow eval(), new Function() (⚠️ insecure)

// URL-based sources
https:           // All HTTPS resources
https://cdn.com  // Specific domain
*.example.com    // All subdomains

// Cryptographic sources
'nonce-abc123'   // Specific nonce
'sha256-xyz...'  // Hash of script content
```

**Nonce-based CSP (recommended):**
```html
<!-- Server generates random nonce per request -->
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'nonce-2726c7f26c'">

<!-- Only scripts with matching nonce execute -->
<script nonce="2726c7f26c">
  console.log('Allowed');
</script>

<script>
  console.log('Blocked');  // No nonce
</script>
```

**Hash-based CSP:**
```
Content-Security-Policy: script-src 'sha256-abc123...'

<!-- Script hash must match -->
<script>console.log('Hello');</script>
<!-- Server calculates: sha256("console.log('Hello');") -->
```

**Progressive implementation:**

```
// Step 1: Report-only mode (doesn't block, just reports)
Content-Security-Policy-Report-Only: 
  default-src 'self'; 
  report-uri /csp-violations

// Step 2: Analyze violations, adjust policy

// Step 3: Enable enforcement
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'nonce-{random}'
```

**Example policies:**

```
// Strict policy (recommended)
Content-Security-Policy:
  default-src 'none';
  script-src 'nonce-{random}';
  style-src 'nonce-{random}';
  img-src 'self' https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'none';
  form-action 'self'

// Moderate policy
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'self'

// Legacy application (transitional)
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline'
```

**Violation reporting:**
```javascript
// Server receives violation reports
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "violated-directive": "script-src 'self'",
    "blocked-uri": "https://evil.com/script.js",
    "line-number": 12,
    "source-file": "https://example.com/page"
  }
}
```

**React implementation:**
```javascript
// Server-side (Express)
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'`
  );
  next();
});

// In React SSR
<script nonce={nonce}>
  // Your code
</script>

// With Next.js
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  }
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};
```
</details>

<details>
<summary>Common misconceptions</summary>
- CSP doesn't prevent all XSS (just makes it much harder)
- `'unsafe-inline'` defeats most CSP benefits
- Nonces must be regenerated per request (not per session)
- CSP can break legitimate inline scripts/styles
- `frame-ancestors` is not same as `frame-src` (one controls who can embed you, other controls who you can embed)
- Strict CSP requires code changes (can't be added retroactively without issues)
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Understanding CSP directives and purpose
- Difference between `default-src` and specific directives
- Nonce vs hash-based CSP
- How to implement CSP without breaking functionality
- CSP reporting and monitoring
- `frame-ancestors` vs X-Frame-Options
- Migrating legacy app to strict CSP
- Balance between security and functionality
</details>
