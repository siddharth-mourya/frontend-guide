# App Router

## ⚡ Quick Revision
- **App Router (13+)**: File-system based routing using `app/` directory
- **Server Components**: Default in App Router, render on server, zero JS bundle
- **Client Components**: Use `'use client'` directive, hydrated on client
- **RSC (React Server Components)**: Stream HTML from server, compose with Client Components
- **Route Groups**: Use `(folder)` to organize without affecting URL structure
- **Parallel Routes**: Use `@slot` syntax for simultaneous rendering
- **Intercepting Routes**: Use `(.)` syntax to intercept route navigation

```javascript
// Server Component (default)
export default function Page() {
  return <div>Server rendered</div>;
}

// Client Component
'use client';
export default function Interactive() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Layout with metadata
export const metadata = {
  title: 'My App',
  description: 'Built with Next.js'
};
```

**Common Pitfalls:**
- Trying to use hooks in Server Components
- Not understanding when to use Client Components
- Mixing Server/Client component patterns incorrectly

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Evolution from Pages Router:**
- Pages Router had limitations with layouts and data fetching
- App Router provides better co-location of components and data
- Improved performance with Server Components by default
- Better streaming and Suspense integration

**Performance Benefits:**
- Reduced JavaScript bundle size (Server Components)
- Improved SEO with server-side rendering
- Better caching strategies with granular control
- Streaming for faster perceived performance
</details>

<details>
<summary>How it works</summary>
**File System Conventions:**
```
app/
├── layout.tsx          // Root layout
├── page.tsx           // Home page
├── globals.css        // Global styles
├── dashboard/
│   ├── layout.tsx     // Dashboard layout
│   ├── page.tsx       // Dashboard page
│   └── analytics/
│       └── page.tsx   // /dashboard/analytics
└── (marketing)/       // Route group
    ├── about/
    └── contact/
```

**Server Components Flow:**
1. Request hits Next.js server
2. Server Component renders on server
3. RSC payload streamed to client
4. Client hydrates only Client Components
5. Navigation updates via RSC stream

**Component Composition:**
```javascript
// Server Component can import Client Components
import ClientCounter from './client-counter';

export default function ServerPage() {
  const data = await fetchData(); // Server-side data fetching
  return (
    <div>
      <h1>Server Data: {data.title}</h1>
      <ClientCounter initialValue={data.count} />
    </div>
  );
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"All components are Server Components"**
- Only components in `app/` directory are Server Components by default
- Client Components still exist and are necessary for interactivity

**"Server Components can't be interactive"**
- Server Components can handle forms via Server Actions
- They just can't use client-side state or effects

**"App Router is slower"**
- Actually faster due to streaming and reduced JS bundles
- Initial perception might be slower due to server rendering time

**"You can't share state between Server and Client"**
- You can pass props from Server to Client Components
- Use URL state, cookies, or database for persistent state
</details>

<details>
<summary>Interview angle</summary>
**Senior-level Questions:**
- "How do you decide when to use Server vs Client Components?"
- "Explain the RSC payload and how it differs from traditional SSR"
- "How would you implement authentication in App Router?"
- "What are the performance implications of Client Components?"

**Architecture Decisions:**
- When to create route groups vs actual routes
- How to structure layouts for complex applications
- Strategies for migrating from Pages Router

**Performance Considerations:**
- Bundle size impact of Client Components
- Streaming strategies for large pages
- Caching implications in App Router
</details>