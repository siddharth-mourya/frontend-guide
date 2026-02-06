# Hydration

## ⚡ Quick Revision

- Hydration: Attaching React event listeners to server-rendered HTML
- Server sends static HTML, React "hydrates" it on client
- `hydrateRoot()` (React 18+) or `hydrate()` (React 17)
- Must match: Server HTML must match what React would render
- **Pitfall**: Hydration mismatch = React rebuilds entire tree (slow)
- **Pitfall**: Time-sensitive data (Date.now()) causes mismatches
- Use `suppressHydrationWarning` to suppress specific warnings

```jsx
// Server (Node.js)
import { renderToString } from 'react-dom/server';

const html = renderToString(<App />);
// Send HTML to browser

// Client
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(document.getElementById('root'), <App />);
// Attaches events to existing HTML

// Hydration mismatch example
function ServerClient() {
  // ❌ Mismatch: Different on server vs client
  return <div>{new Date().toString()}</div>;
  
  // ✅ Fix: Only render on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  return <div>{mounted ? new Date().toString() : null}</div>;
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**SEO and performance:**
- Server-rendered HTML visible immediately (fast FCP)
- Search engines can crawl static HTML
- JavaScript can be delayed/failed, content still visible
- Better UX: Content before interactivity

**Hydration advantages:**
- Preserves server-rendered HTML (no re-render)
- Fast initial paint (HTML already there)
- React adds interactivity to static content
- Progressive enhancement pattern

**Without hydration:**
- Would need to re-render entire tree on client
- Flicker as React replaces server HTML
- Slower time-to-interactive
- Lost SEO benefits

</details>

<details>
<summary>How it works</summary>
**SSR and hydration flow:**
```jsx
// 1. Server renders to string
// server.js
import { renderToString } from 'react-dom/server';

const html = renderToString(<App />);

res.send(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="root">${html}</div>
      <script src="/bundle.js"></script>
    </body>
  </html>
`);

// 2. Browser receives HTML
// <div id="root">
//   <div>Hello World</div>  <!-- Static HTML -->
// </div>

// 3. Bundle.js loads and hydrates
// client.js
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(document.getElementById('root'), <App />);

// 4. React:
// - Compares rendered HTML with what it would render
// - If match: Attach event listeners (fast)
// - If mismatch: Log warning, re-render tree (slow)
```

**Hydration process:**
```jsx
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}

// Server output:
// <div>
//   <p>Count: 0</p>
//   <button>+</button>
// </div>

// Hydration:
// 1. React walks the tree
// 2. Finds <button> in HTML
// 3. Attaches onClick handler
// 4. Button now interactive!
```

**Hydration mismatches:**
```jsx
// ❌ Mismatch: Random values
function Random() {
  return <div>{Math.random()}</div>;
  // Server: <div>0.123</div>
  // Client:  <div>0.456</div>
  // Warning: Text content did not match
}

// ❌ Mismatch: Timestamps
function Timestamp() {
  return <div>{new Date().toString()}</div>;
  // Server: <div>Thu Jan 01 2026 12:00:00</div>
  // Client:  <div>Thu Jan 01 2026 12:00:01</div>
  // Warning: Text content did not match
}

// ❌ Mismatch: Browser-only APIs
function BrowserAPI() {
  return <div>{window.innerWidth}</div>;
  // Server: ReferenceError: window is not defined
}

// ❌ Mismatch: Conditional rendering
function Conditional() {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? <div>Browser</div> : <div>Server</div>;
  // Server: <div>Server</div>
  // Client:  <div>Browser</div>
  // Warning: Expected server HTML to contain matching <div>
}

// ✅ Fix: Two-pass render
function FixedTimestamp() {
  const [timestamp, setTimestamp] = useState(null);
  
  useEffect(() => {
    setTimestamp(new Date().toString());
  }, []);
  
  return <div>{timestamp || 'Loading...'}</div>;
  // Server: <div>Loading...</div>
  // Client initial: <div>Loading...</div> ✅ Match
  // Client after useEffect: <div>Thu Jan 01 2026 12:00:01</div>
}

// ✅ Fix: Suppress warning (use sparingly)
function SuppressedMismatch() {
  return (
    <div suppressHydrationWarning>
      {new Date().toString()}
    </div>
  );
  // No warning, but still re-renders this node
}

// ✅ Fix: Server data in HTML
function ServerData({ serverTime }) {
  return <div>{serverTime}</div>;
}

// Server passes initial data:
// const serverTime = new Date().toString();
// const html = renderToString(<App serverTime={serverTime} />);
// Include serverTime in <script> tag for client
```

**useEffect vs useLayoutEffect in SSR:**
```jsx
function Effects() {
  // ✅ useEffect: Safe for SSR (doesn't run on server)
  useEffect(() => {
    console.log('Client only');
  }, []);
  
  // ⚠️ useLayoutEffect: Warning in SSR
  // Warning: useLayoutEffect does nothing on the server
  useLayoutEffect(() => {
    console.log('Client only, but warning');
  }, []);
  
  // ✅ Pattern: Suppress useLayoutEffect warning
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  
  useIsomorphicLayoutEffect(() => {
    console.log('No warning');
  }, []);
}
```

**Streaming SSR (React 18+):**
```jsx
// Server: Stream HTML in chunks
import { renderToPipeableStream } from 'react-dom/server';

function App() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Spinner />}>
        <SlowComponent /> {/* Streamed later */}
      </Suspense>
    </div>
  );
}

const { pipe } = renderToPipeableStream(<App />, {
  onShellReady() {
    // Send initial HTML (Header + Spinner)
    pipe(res);
  }
});

// Client receives:
// 1. <div><Header /><Spinner /></div>
// 2. Later: Script to replace Spinner with SlowComponent
// 3. Hydration happens progressively
```

**Selective hydration (React 18+):**
```jsx
function App() {
  return (
    <div>
      <Header /> {/* Hydrated first */}
      
      <Suspense fallback={<Spinner />}>
        <Sidebar /> {/* Hydrated when user interacts */}
      </Suspense>
      
      <Suspense fallback={<Spinner />}>
        <Content /> {/* Hydrated after Sidebar */}
      </Suspense>
    </div>
  );
}

// React 18 prioritizes hydration:
// 1. User clicks Sidebar before it's hydrated
// 2. React prioritizes Sidebar hydration
// 3. Content hydrates after
```

**Client-only components:**
```jsx
// Pattern 1: useEffect mount detection
function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <>{children}</>;
}

// Usage
function App() {
  return (
    <div>
      <ServerComponent />
      <ClientOnly>
        <BrowserOnlyComponent />
      </ClientOnly>
    </div>
  );
}

// Pattern 2: Dynamic import
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false,
  loading: () => <Spinner />
});

// Pattern 3: Lazy load after hydration
function App() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Spinner />}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

**Debugging mismatches:**
```jsx
// React logs detailed mismatch info:
// Warning: Text content did not match. Server: "0" Client: "1"
//     in div (at App.js:5)
//     in App (at index.js:8)

// Enable detailed logging:
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('Hydration')) {
      console.trace(); // Show stack trace
    }
    originalError(...args);
  };
}

// Common causes:
// 1. Date.now(), Math.random()
// 2. typeof window !== 'undefined' checks
// 3. useLayoutEffect (server warning)
// 4. Browser-only APIs (localStorage, window)
// 5. Different props server vs client
```

</details>

<details>
<summary>Common misconceptions</summary>
- **"Hydration re-renders everything"** - Only attaches events if HTML matches
- **"SSR is always faster"** - Depends on payload size and client device
- **"Hydration mismatches break the app"** - React recovers, but slower
- **"suppressHydrationWarning fixes mismatches"** - Just suppresses warning
- **"useEffect runs on server"** - Only on client (after hydration)
- **"Hydration is instant"** - Can be slow with large trees

</details>

<details>
<summary>Interview angle</summary>
Interviewers evaluate understanding of:
- **SSR flow**: Server render → send HTML → hydrate on client
- **Hydration process**: Matching HTML and attaching events
- **Mismatches**: Common causes and how to fix
- **Performance**: Trade-offs of SSR vs CSR

Critical concepts to explain:
- **What is hydration**: Making server HTML interactive
- **Why it exists**: SEO + fast initial paint + interactivity
- **Mismatch causes**: Time-based, random, browser-only
- **Fixing mismatches**: Two-pass render, server data, suppress
- **React 18 features**: Streaming, selective hydration

Common questions:
- "What is hydration in React?"
- "How does SSR work with React?"
- "What causes hydration mismatches?"
- "How do you fix hydration warnings?"
- "What's the difference between renderToString and hydrateRoot?"
- "When would you use suppressHydrationWarning?"
- "How does React 18 improve SSR?"

Key talking points:
- Hydration attaches events to server-rendered HTML
- Faster initial paint, better SEO
- HTML must match between server and client
- useEffect is client-only (safe for browser APIs)
- React 18 adds streaming and selective hydration
- Mismatches cause re-render (performance cost)

</details>

---

## 📝 Code Examples

<details>
<summary>Real-world SSR patterns</summary>
```jsx
// Full SSR setup
// server.js
import express from 'express';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import App from './App';

const app = express();

app.get('*', (req, res) => {
  const { pipe, abort } = renderToPipeableStream(
    <App url={req.url} />,
    {
      bootstrapScripts: ['/client.js'],
      onShellReady() {
        res.setHeader('content-type', 'text/html');
        pipe(res);
      },
      onShellError(error) {
        res.statusCode = 500;
        res.send('<!doctype html><h1>Error</h1>');
      },
      onError(error) {
        console.error(error);
      }
    }
  );
  
  setTimeout(abort, 10000); // Abort after 10s
});

app.listen(3000);

// client.js
import { hydrateRoot } from 'react-dom/client';
import App from './App';

hydrateRoot(document, <App url={window.location.pathname} />);

// App.js
function App({ url }) {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <div id="root">
          <Router url={url}>
            <Routes />
          </Router>
        </div>
      </body>
    </html>
  );
}
```

</details>

<details>
<summary>Handling hydration mismatches</summary>
```jsx
// Time-based content
function SafeTimestamp() {
  const [time, setTime] = useState(() => {
    // Server: null
    // Client first render: null (matches server)
    // Client after effect: actual time
    return null;
  });
  
  useEffect(() => {
    setTime(new Date().toString());
    
    // Optional: Update every second
    const interval = setInterval(() => {
      setTime(new Date().toString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      {time ? `Current time: ${time}` : 'Loading time...'}
    </div>
  );
}

// User-specific content
function UserGreeting({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Fetch user data on client only
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);
  
  // Server and initial client render: Loading state
  if (!user) return <div>Loading...</div>;
  
  // After hydration and fetch: User data
  return <div>Hello, {user.name}!</div>;
}

// Feature detection
function BrowserFeatures() {
  const [features, setFeatures] = useState({});
  
  useEffect(() => {
    setFeatures({
      geolocation: 'geolocation' in navigator,
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: typeof localStorage !== 'undefined'
    });
  }, []);
  
  return (
    <div>
      {features.geolocation ? 'Geolocation supported' : 'Not supported'}
    </div>
  );
}

// Media queries
function ResponsiveComponent() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    setIsMobile(mediaQuery.matches);
    
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Server: Render default (desktop) version
  // Client initial: Same default version (no mismatch)
  // Client after effect: Update if mobile
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}

// Safe random IDs
function useClientId(prefix = 'id') {
  const [id, setId] = useState('');
  
  useEffect(() => {
    setId(`${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  }, [prefix]);
  
  return id;
}

function FormField() {
  const id = useClientId('field');
  
  return (
    <>
      <label htmlFor={id || undefined}>Name</label>
      <input id={id || undefined} />
    </>
  );
}

// Third-party scripts
function GoogleAnalytics() {
  useEffect(() => {
    // Only load on client
    const script = document.createElement('script');
    script.src = 'https://www.google-analytics.com/analytics.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return null;
}

// LocalStorage with SSR
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);
  
  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  return [value, setStoredValue];
}
```

</details>

<details>
<summary>React 18 streaming patterns</summary>
```jsx
// Suspense-based streaming
function App() {
  return (
    <html>
      <body>
        <nav>
          <Logo />
          <Menu />
        </nav>
        
        {/* Shell content sent immediately */}
        
        <Suspense fallback={<Spinner />}>
          {/* Heavy component streamed later */}
          <Comments />
        </Suspense>
        
        <Suspense fallback={<Skeleton />}>
          {/* Another heavy component */}
          <Recommendations />
        </Suspense>
      </body>
    </html>
  );
}

// Comments component with data fetching
function Comments() {
  // This suspends rendering until data loads
  const comments = use(fetchComments());
  
  return (
    <div>
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

// Progressive enhancement
function InteractiveMap() {
  return (
    <Suspense fallback={<StaticMap />}>
      <DynamicMap />
    </Suspense>
  );
}

// StaticMap: Server-rendered, works without JS
function StaticMap() {
  return <img src="/map.png" alt="Map" />;
}

// DynamicMap: Interactive, hydrated later
function DynamicMap() {
  const map = use(loadMapLibrary());
  return <div ref={node => map.render(node)} />;
}
```

</details>
