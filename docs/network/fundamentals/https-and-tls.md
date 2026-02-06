# HTTPS and TLS

## ⚡ Quick Revision
- **HTTPS = HTTP + TLS**: Encrypted HTTP communication using Transport Layer Security
- **TLS Handshake**: Client Hello → Server Hello → Certificate → Key Exchange → Finished
- **Certificates**: Digital documents binding public key to identity, signed by Certificate Authority (CA)
- **Encryption**: Symmetric (AES) for data, Asymmetric (RSA/ECDSA) for key exchange
- **TLS 1.3**: Faster handshake (1-RTT), stronger ciphers, removed legacy algorithms
- **Common ports**: HTTP (80), HTTPS (443)

```javascript
// Modern HTTPS request (TLS handled by browser)
const response = await fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Node.js HTTPS server
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  ca: fs.readFileSync('ca-bundle.pem') // Chain of trust
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Secure connection!');
}).listen(443);

// Check certificate in browser DevTools
// Security tab shows: Protocol (TLS 1.3), Cipher Suite, Certificate chain
```

**TLS Handshake Steps:**
1. **Client Hello**: Supported TLS versions, cipher suites, random bytes
2. **Server Hello**: Chosen cipher suite, server random, certificate
3. **Key Exchange**: Client generates pre-master secret, encrypts with server public key
4. **Finished**: Both derive session keys, verify integrity with MAC

**Certificate Validation:**
- Chain of trust: Root CA → Intermediate CA → Server Certificate
- Expiration date check
- Domain name validation (CN or SAN)
- Revocation check (OCSP/CRL)

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**HTTPS solves three critical security problems:**

1. **Confidentiality (Encryption)**
   - Prevents eavesdropping on sensitive data
   - Essential for passwords, credit cards, personal information
   - Without HTTPS, data travels in plain text across the internet

2. **Integrity (Tampering detection)**
   - Ensures data isn't modified in transit
   - HMAC (Hash-based Message Authentication Code) verifies integrity
   - Prevents man-in-the-middle attacks that alter content

3. **Authentication (Identity verification)**
   - Certificates prove server identity
   - Prevents impersonation attacks
   - Users can trust they're connected to the real website

**Evolution from HTTP:**
- HTTP was designed when internet was academic/research-focused
- E-commerce and sensitive data required encryption
- SSL (Netscape, 1994) → TLS 1.0 (1999) → TLS 1.3 (2018)
- Now mandatory for modern web (browsers show warnings for HTTP)

**Performance impact:**
- Older TLS versions had 2-RTT handshake overhead
- TLS 1.3 reduced to 1-RTT (or 0-RTT with session resumption)
- HTTP/2 over TLS enables multiplexing, compression
- Modern CPUs have AES-NI instruction set for hardware acceleration

</details>

<details>
<summary>How it works</summary>
**TLS Handshake in Detail:**

```
Client                                              Server
  |                                                   |
  |  1. ClientHello                                   |
  |  - TLS versions (1.2, 1.3)                        |
  |  - Cipher suites (ECDHE-RSA-AES256-GCM-SHA384)    |
  |  - Client random (32 bytes)                       |
  |  - Supported extensions (SNI, ALPN)               |
  | ------------------------------------------------> |
  |                                                   |
  |                      2. ServerHello               |
  |                      - Chosen TLS version (1.3)   |
  |                      - Chosen cipher suite        |
  |                      - Server random              |
  | <------------------------------------------------ |
  |                                                   |
  |                      3. Certificate               |
  |                      - Server certificate chain   |
  |                      - Public key                 |
  | <------------------------------------------------ |
  |                                                   |
  |                      4. ServerKeyExchange         |
  |                      - ECDH parameters            |
  | <------------------------------------------------ |
  |                                                   |
  |  5. ClientKeyExchange                             |
  |  - Pre-master secret (encrypted with server key)  |
  | ------------------------------------------------> |
  |                                                   |
  |  6. ChangeCipherSpec + Finished                   |
  |  - Switch to encrypted communication              |
  |  - Verify handshake integrity                     |
  | ------------------------------------------------> |
  |                                                   |
  |                      7. ChangeCipherSpec+Finished |
  | <------------------------------------------------ |
  |                                                   |
  |  8. Encrypted Application Data                    |
  | <----------------------------------------------> |
```

**Key Generation Process:**

1. **Pre-Master Secret**: 
   - Client generates random 48-byte value
   - Encrypted with server's public key (from certificate)
   - Only server can decrypt (has private key)

2. **Master Secret Derivation**:
   ```
   master_secret = PRF(pre_master_secret, 
                       "master secret",
                       client_random + server_random)
   ```

3. **Session Keys Generation**:
   ```
   key_block = PRF(master_secret,
                   "key expansion",
                   server_random + client_random)
   ```
   - Generates: client write MAC key, server write MAC key
   - client write encryption key, server write encryption key
   - client write IV, server write IV

**Cipher Suite Breakdown:**

`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`:
- **ECDHE**: Elliptic Curve Diffie-Hellman Ephemeral (key exchange)
- **RSA**: Certificate signature algorithm
- **AES_256**: Symmetric encryption (256-bit Advanced Encryption Standard)
- **GCM**: Galois/Counter Mode (authenticated encryption mode)
- **SHA384**: Hash function for HMAC

**Certificate Chain Validation:**

```javascript
// Example certificate chain
Root CA (VeriSign/DigiCert) 
  ↓ signed by root
Intermediate CA (Google Internet Authority)
  ↓ signed by intermediate
Server Certificate (www.google.com)
```

Validation process:
1. Browser has root CA certificates pre-installed
2. Server sends its certificate + intermediate certificates
3. Browser verifies each signature up to trusted root
4. Checks expiration dates, revocation status
5. Validates domain name matches (CN or SAN field)

**TLS 1.3 Improvements:**

```
TLS 1.2 Handshake: 2-RTT
Client Hello → 
               ← Server Hello, Certificate, ServerKeyExchange
ClientKeyExchange, ChangeCipherSpec →
               ← ChangeCipherSpec, Finished
Application Data →

TLS 1.3 Handshake: 1-RTT
Client Hello (+ key share) →
               ← Server Hello, Certificate, Finished
               ← [Encrypted Application Data]
```

Benefits:
- Faster connection (1-RTT vs 2-RTT)
- 0-RTT resumption for repeat connections
- Removed weak ciphers (RC4, MD5, SHA-1)
- Forward secrecy by default (ECDHE required)
- Encrypted handshake (more privacy)

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "HTTPS makes websites slower"**
- ✅ TLS 1.3 has minimal overhead (1-RTT handshake)
- ✅ HTTP/2 over TLS enables better performance
- ✅ Hardware acceleration (AES-NI) makes encryption fast
- ✅ Session resumption eliminates repeated handshakes
- Reality: HTTPS is now faster due to HTTP/2, compression, server push

**❌ "Certificate encryption protects data at rest"**
- ✅ TLS only protects data in transit (network layer)
- Server still receives unencrypted data
- Need separate encryption for databases, backups
- HTTPS ≠ end-to-end encryption (that requires client-side encryption)

**❌ "Self-signed certificates provide same security as CA-signed"**
- ✅ Encryption level is same
- ❌ No identity verification (anyone can create)
- Browsers show security warnings
- Vulnerable to MITM attacks (attacker can replace with their cert)
- CA-signed certificates provide trust through third-party verification

**❌ "HTTPS prevents all attacks"**
- Only protects data in transit
- Doesn't protect against: XSS, SQL injection, CSRF, phishing
- Malicious HTTPS sites exist (phishing sites with valid certs)
- Application-level security still required

**❌ "TLS and SSL are the same thing"**
- SSL (Secure Sockets Layer) is deprecated (SSL 3.0 from 1996)
- TLS (Transport Layer Security) is the successor
- TLS 1.0 released in 1999, current is TLS 1.3 (2018)
- "SSL certificate" is outdated terminology (should be TLS certificate)
- SSL 2.0/3.0 have serious vulnerabilities (POODLE attack)

**❌ "One certificate per server"**
- ✅ Wildcard certificates: `*.example.com`
- ✅ SAN (Subject Alternative Names): multiple domains
- ✅ SNI (Server Name Indication): multiple certs on same IP
- One server can host many HTTPS sites with different certificates

**❌ "HTTPS breaks caching"**
- Modern browsers cache HTTPS resources
- `Cache-Control` headers work same as HTTP
- CDNs can cache HTTPS content
- Service Workers can cache HTTPS pages

</details>

<details>
<summary>Interview angle</summary>
**Common Interview Questions:**

**Q1: "Walk me through what happens when I type https://google.com and press Enter"**

Focus on HTTPS-specific steps:
1. DNS lookup resolves domain to IP
2. TCP handshake (SYN, SYN-ACK, ACK)
3. **TLS handshake**:
   - Client Hello with cipher suites
   - Server Hello, Certificate, Key Exchange
   - Client verifies certificate chain
   - Key derivation
   - Encrypted connection established
4. HTTP request sent (encrypted)
5. HTTP response received (encrypted)
6. Browser decrypts and renders

**Q2: "How does TLS prevent man-in-the-middle attacks?"**

Key points:
- **Certificate validation**: Server must present valid certificate signed by trusted CA
- **Public key encryption**: Attacker can't decrypt pre-master secret without private key
- **Chain of trust**: Root CAs pre-installed in browsers
- **Certificate pinning**: Apps can require specific certificates (advanced)

Example attack prevention:
```javascript
// Without TLS: Attacker can intercept and modify
Client → Attacker (reads/modifies) → Server

// With TLS: Attacker can't decrypt
Client → Attacker (sees encrypted data) → Server
// Attacker can't forge valid certificate
```

**Q3: "What's the difference between symmetric and asymmetric encryption in TLS?"**

```javascript
// Asymmetric (RSA/ECDH) - Slow, for key exchange only
- Client encrypts pre-master secret with server's public key
- Server decrypts with private key
- Used only during handshake

// Symmetric (AES) - Fast, for data encryption
- Both parties derive same session keys
- All application data encrypted with AES
- ~1000x faster than RSA
```

**Q4: "How would you implement certificate pinning in a mobile app?"**

```javascript
// iOS/Swift example
let session = URLSession(
  configuration: .default,
  delegate: self,
  delegateQueue: nil
)

func urlSession(_ session: URLSession,
                didReceive challenge: URLAuthenticationChallenge,
                completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
  
  guard let serverTrust = challenge.protectionSpace.serverTrust,
        let certificate = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
    completionHandler(.cancelAuthenticationChallenge, nil)
    return
  }
  
  let serverCertData = SecCertificateCopyData(certificate) as Data
  let pinnedCertData = // Load from app bundle
  
  if serverCertData == pinnedCertData {
    completionHandler(.useCredential, URLCredential(trust: serverTrust))
  } else {
    completionHandler(.cancelAuthenticationChallenge, nil)
  }
}
```

**Q5: "What's the performance impact of HTTPS?"**

Modern optimizations:
```javascript
// TLS 1.3 features
- 1-RTT handshake (vs 2-RTT in TLS 1.2)
- 0-RTT resumption for repeat visitors
- Session tickets avoid full handshake

// Implementation
// First visit: Full handshake
Time: ~50ms (1-RTT)

// Return visit with session resumption
Time: ~0ms (0-RTT)

// Plus HTTP/2 benefits over HTTPS
- Multiplexing (multiple requests in one connection)
- Header compression
- Server push
```

**Q6: "How do you handle mixed content warnings?"**

```html
<!-- ❌ Bad: HTTP resource on HTTPS page -->
<img src="http://example.com/image.jpg">
<script src="http://cdn.com/script.js"></script>

<!-- ✅ Good: Protocol-relative or HTTPS -->
<img src="//example.com/image.jpg">
<script src="https://cdn.com/script.js"></script>

<!-- ✅ Better: Content Security Policy -->
<meta http-equiv="Content-Security-Policy" 
      content="upgrade-insecure-requests">
```

Browsers block mixed content:
- **Active mixed content**: Scripts, stylesheets, iframes (blocked)
- **Passive mixed content**: Images, audio, video (warning)

**Q7: "Explain Perfect Forward Secrecy"**

```javascript
// Without PFS (RSA key exchange)
- Same key pair used for multiple sessions
- If private key compromised → all past sessions decryptable
- Attacker can record encrypted traffic, decrypt later

// With PFS (ECDHE key exchange)
- Ephemeral keys generated for each session
- Even if server private key compromised → past sessions safe
- Each session has unique encryption keys

// TLS 1.3 enforces PFS (removed RSA key exchange)
```

**Q8: "How would you debug HTTPS issues?"**

Tools and approaches:
```bash
# Check certificate
openssl s_client -connect example.com:443 -showcerts

# Test specific TLS version
openssl s_client -connect example.com:443 -tls1_3

# View cipher suites
nmap --script ssl-enum-ciphers -p 443 example.com

# Check certificate expiration
openssl s_client -connect example.com:443 | openssl x509 -noout -dates
```

Browser DevTools:
- Security tab: Certificate details, TLS version, cipher suite
- Network tab: Protocol column shows h2 (HTTP/2 over TLS)
- Console: Mixed content warnings

**Practical Implementation Scenarios:**

**Scenario 1: Setting up HTTPS for production**
```javascript
// nginx configuration
server {
  listen 443 ssl http2;
  server_name example.com;
  
  ssl_certificate /path/to/fullchain.pem;
  ssl_certificate_key /path/to/privkey.pem;
  
  # Modern cipher suites only
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
  ssl_prefer_server_ciphers off;
  
  # OCSP stapling
  ssl_stapling on;
  ssl_stapling_verify on;
  
  # HSTS
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name example.com;
  return 301 https://$server_name$request_uri;
}
```

**Red flags in interview responses:**
- Confusing encryption with authentication
- Not mentioning certificate validation in MITM prevention
- Thinking HTTPS alone prevents all attacks
- Not knowing difference between SSL and TLS
- Claiming HTTPS significantly slows down websites

**Strong answers demonstrate:**
- Understanding of handshake process
- Knowledge of cipher suites and their purposes
- Awareness of TLS 1.3 improvements
- Practical experience with certificate configuration
- Security considerations beyond just encryption

</details>

---

## 📝 Practice Problems

**Problem 1**: Implement certificate validation check
```javascript
// Validate certificate before making request
async function validateCertificate(url) {
  // Your implementation
  // Should check: expiration, issuer, domain match
}
```

**Problem 2**: Explain why this fails
```javascript
// On https://example.com page:
fetch('http://api.example.com/data')
  .then(res => res.json())
  .catch(err => console.error(err)); // Why does this fail?
```

**Problem 3**: Implement HSTS header middleware
```javascript
// Express middleware to add HSTS header
function hstsMiddleware(req, res, next) {
  // Your implementation
}
```

---

## 🎯 Key Takeaways

1. **HTTPS = HTTP + TLS** - Encrypted communication with authentication
2. **TLS handshake** establishes secure connection through certificate validation and key exchange
3. **Asymmetric encryption** (RSA/ECDH) for handshake, **symmetric encryption** (AES) for data
4. **Certificate chain** provides trust through CA signatures
5. **TLS 1.3** is faster (1-RTT) and more secure than previous versions
6. **Perfect Forward Secrecy** protects past sessions even if key compromised
7. **HTTPS prevents**: eavesdropping, tampering, impersonation
8. **HTTPS doesn't prevent**: XSS, CSRF, SQL injection, phishing
