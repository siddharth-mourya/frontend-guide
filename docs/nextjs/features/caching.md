# Caching

## ⚡ Quick Revision
- **Four Cache Types**: Request Memoization, Data Cache, Full Route Cache, Router Cache
- **Data Cache**: Persistent cache for `fetch()` requests across deployments
- **Full Route Cache**: Static/dynamic route rendering results cached
- **Request Memoization**: Dedupes identical requests in single render
- **Revalidation**: Time-based (`revalidate`) or on-demand (`revalidateTag`)
- **Cache Controls**: `cache: 'no-store'`, `next: { revalidate: 3600 }`

```javascript
// Data Cache with revalidation
const posts = await fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 } // 1 hour
});

// Tag-based revalidation
const user = await fetch(`https://api.example.com/users/${id}`, {
  next: { tags: ['user'] }
});

// No caching
const realtime = await fetch('https://api.example.com/realtime', {
  cache: 'no-store'
});

// Manual revalidation
import { revalidateTag } from 'next/cache';
revalidateTag('user');

// Route-level cache control
export const revalidate = 3600; // Static page with 1-hour ISR
export const dynamic = 'force-dynamic'; // Always dynamic
```

**Common Pitfalls:**
- Not understanding the difference between cache types
- Using wrong revalidation strategy for use case
- Cache invalidation complexity in tag-based systems

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Performance Optimization:**
- Reduces API calls and database queries
- Faster page loads through cached responses
- Lower server costs with fewer compute cycles

**Scalability:**
- Handle traffic spikes with cached responses
- Reduce load on external APIs and databases
- Better user experience with instant page loads

**Data Freshness Balance:**
- Static generation performance with dynamic data needs
- Granular control over cache invalidation
- Background updates without blocking user experience
</details>

<details>
<summary>How it works</summary>
**Cache Hierarchy:**
```
Browser Request
    ↓
Router Cache (client-side)
    ↓
Full Route Cache (server)
    ↓
Data Cache (persistent)
    ↓
Request Memoization (render-time)
    ↓
External API/Database
```

**Request Memoization:**
```javascript
// Multiple components calling same data in single render
async function getUser(id) {
  const user = await fetch(`/api/users/${id}`); // Called once, memoized
  return user.json();
}

// Both components get memoized result
function UserProfile({ id }) {
  const user = await getUser(id); // Original call
  return <div>{user.name}</div>;
}

function UserAvatar({ id }) {
  const user = await getUser(id); // Memoized result
  return <img src={user.avatar} />;
}
```

**Data Cache Mechanics:**
```javascript
// Time-based revalidation
const posts = await fetch('/api/posts', {
  next: { 
    revalidate: 3600, // 1 hour
    tags: ['posts'] // Also tag for on-demand revalidation
  }
});

// Conditional caching
const dynamicData = await fetch('/api/data', {
  next: { 
    revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0
  }
});

// Cache configuration per environment
const cacheConfig = {
  next: {
    revalidate: 3600,
    tags: ['products']
  }
};

if (process.env.NODE_ENV === 'development') {
  cacheConfig.cache = 'no-store';
}

const products = await fetch('/api/products', cacheConfig);
```

**Tag-based Invalidation System:**
```javascript
// Server Action for data mutation
'use server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function updateUser(userId, userData) {
  await updateUserInDatabase(userId, userData);
  
  // Invalidate specific user data
  revalidateTag('user');
  revalidateTag(`user-${userId}`);
  
  // Invalidate entire route
  revalidatePath(`/users/${userId}`);
}

// API route with on-demand revalidation
export async function POST(request) {
  const { userId } = await request.json();
  
  // Update data
  await updateUser(userId);
  
  // Trigger revalidation
  revalidateTag(`user-${userId}`);
  
  return Response.json({ revalidated: true });
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"Data Cache is the same as browser cache"**
- Data Cache is server-side and persists across deployments
- Browser cache is client-side and temporary

**"All fetch requests are cached"**
- Only GET requests to external URLs are cached by default
- POST requests and internal API routes are not cached

**"Revalidation happens immediately"**
- Time-based revalidation happens in background after expiry
- First user after expiry sees stale data, triggers regeneration

**"Tags are automatically applied to related data"**
- You must manually tag related data that should invalidate together
- No automatic relationship detection
</details>

<details>
<summary>Interview angle</summary>
**Architecture Questions:**
- "How do you design a caching strategy for a news website?"
- "What's your approach to cache invalidation in microservices?"
- "How do you handle cache warming for critical pages?"

**Performance Optimization:**
```javascript
// Strategic caching for e-commerce
export default async function ProductPage({ params }) {
  // High cache time for stable data
  const product = await fetch(`/api/products/${params.id}`, {
    next: { revalidate: 86400, tags: ['product', `product-${params.id}`] }
  });
  
  // Lower cache time for dynamic data
  const inventory = await fetch(`/api/products/${params.id}/inventory`, {
    next: { revalidate: 300, tags: ['inventory', `inventory-${params.id}`] }
  });
  
  // No cache for real-time data
  const livePrice = await fetch(`/api/products/${params.id}/price`, {
    cache: 'no-store'
  });
  
  return (
    <ProductDetails 
      product={product}
      inventory={inventory}
      livePrice={livePrice}
    />
  );
}
```

**Real-world Scenarios:**
- Blog with comments: Article cached long-term, comments short-term
- User dashboard: Profile data cached, activity feed real-time
- E-commerce: Product details cached, inventory/pricing dynamic

**Cache Strategy Decisions:**
- When to use ISR vs on-demand revalidation
- Balancing freshness vs performance
- Handling cache consistency across multiple data sources

**Monitoring and Debugging:**
- Cache hit/miss ratio monitoring
- Identifying cache invalidation bottlenecks
- Debug cache behavior in development vs production
</details>