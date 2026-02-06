# Streaming

## ⚡ Quick Revision
- **React Suspense**: Wrap async components to show fallback UI during loading
- **Streaming SSR**: Stream HTML chunks as they become ready
- **Loading UI**: Special `loading.tsx` files for route-level loading states
- **Error Boundaries**: Handle streaming errors gracefully with `error.tsx`
- **Parallel Data Fetching**: Multiple async components render independently
- **Progressive Enhancement**: Content loads as soon as available

```javascript
// Streaming with Suspense
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <UserStats />
      </Suspense>
    </div>
  );
}

// Async Server Component
async function UserProfile() {
  const user = await fetchUser(); // Slow API call
  return <div>{user.name}</div>;
}

// Route-level loading UI
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// Nested Suspense for granular loading
<Suspense fallback={<PageSkeleton />}>
  <Suspense fallback={<HeaderSkeleton />}>
    <Header />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <Content />
  </Suspense>
</Suspense>
```

**Common Pitfalls:**
- Not using Suspense boundaries for slow async components
- Creating loading states that are too generic
- Missing error boundaries for streaming failures

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**User Experience:**
- Faster perceived performance with progressive loading
- Reduce time to first meaningful paint
- Show content as soon as available instead of waiting for everything

**Performance Benefits:**
- Parallel data fetching instead of waterfall requests
- Reduced Time to Interactive (TTI)
- Better Core Web Vitals scores

**Scalability:**
- Handle slow APIs without blocking entire page
- Better resource utilization on server
- Graceful degradation for failing services
</details>

<details>
<summary>How it works</summary>
**Streaming Flow:**
1. Initial HTML shell sent immediately
2. Suspense boundaries show fallback UI
3. Async components resolve independently
4. HTML chunks stream as components complete
5. Client hydrates progressively

**Server-Side Streaming:**
```javascript
// Fast initial content streams first
export default function BlogPost() {
  return (
    <div>
      <h1>Blog Title</h1> {/* Streams immediately */}
      <p>Static content...</p>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments /> {/* Streams when data ready */}
      </Suspense>
      
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedPosts /> {/* Streams independently */}
      </Suspense>
    </div>
  );
}

// Parallel data fetching
async function Comments() {
  const comments = await fetchComments(); // Slow API
  return <CommentsList comments={comments} />;
}

async function RelatedPosts() {
  const posts = await fetchRelated(); // Different API
  return <RelatedPostsList posts={posts} />;
}
```

**Advanced Streaming Patterns:**
```javascript
// Conditional streaming based on user state
export default function PersonalizedDashboard({ userId }) {
  return (
    <div>
      <Suspense fallback={<QuickStatsSkeleton />}>
        <QuickStats userId={userId} />
      </Suspense>
      
      {/* Only stream expensive content for premium users */}
      <Suspense fallback={<PremiumContentSkeleton />}>
        <PremiumContent userId={userId} />
      </Suspense>
    </div>
  );
}

async function PremiumContent({ userId }) {
  const user = await getUser(userId);
  
  if (!user.isPremium) {
    return <PremiumUpsell />;
  }
  
  const expensiveData = await fetchExpensiveData(userId);
  return <PremiumDashboard data={expensiveData} />;
}

// Error boundaries with streaming
// app/dashboard/error.tsx
'use client';

export default function DashboardError({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// Component-level error handling
async function RiskyComponent() {
  try {
    const data = await riskyAPICall();
    return <DataView data={data} />;
  } catch (error) {
    return <ErrorState message="Failed to load data" />;
  }
}
```

**Loading State Hierarchy:**
```
app/
├── loading.tsx           // Global loading
├── dashboard/
│   ├── loading.tsx       // Dashboard loading
│   ├── page.tsx          // With Suspense boundaries
│   └── settings/
│       ├── loading.tsx   // Settings loading
│       └── page.tsx
```

**Performance Optimization:**
```javascript
// Preload critical data
export default async function OptimizedPage() {
  // Start all requests in parallel
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  const statsPromise = fetchStats();
  
  // Wait for critical data
  const user = await userPromise;
  
  return (
    <div>
      <UserHeader user={user} />
      
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList postsPromise={postsPromise} />
      </Suspense>
      
      <Suspense fallback={<StatsSkeleton />}>
        <StatsWidget statsPromise={statsPromise} />
      </Suspense>
    </div>
  );
}

// Use promises directly in components
async function PostsList({ postsPromise }) {
  const posts = await postsPromise;
  return <div>{posts.map(post => <Post key={post.id} post={post} />)}</div>;
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"Streaming makes pages slower"**
- Actually improves perceived performance
- First content appears faster than traditional SSR

**"All components need Suspense boundaries"**
- Only async components that fetch data need Suspense
- Over-granular Suspense can hurt UX with too many loading states

**"Streaming doesn't work with static generation"**
- Works with both SSR and SSG
- Static pages can still have client-side streaming

**"Error boundaries catch all streaming errors"**
- Only catches errors during rendering
- Network errors in data fetching need separate handling
</details>

<details>
<summary>Interview angle</summary>
**Performance Strategy:**
- "How do you decide where to place Suspense boundaries?"
- "What's your approach to loading state design?"
- "How do you handle error states in streaming applications?"

**Real-world Implementation:**
```javascript
// E-commerce product page with streaming
export default function ProductPage({ params }) {
  return (
    <div>
      {/* Critical above-fold content */}
      <Suspense fallback={<ProductHeroSkeleton />}>
        <ProductHero productId={params.id} />
      </Suspense>
      
      {/* Below-fold content streams later */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={params.id} />
      </Suspense>
      
      <Suspense fallback={<RecommendationsSkeleton />}>
        <ProductRecommendations productId={params.id} />
      </Suspense>
    </div>
  );
}

// News homepage with priority-based streaming
export default function NewsHomepage() {
  return (
    <div className="grid">
      {/* Hero story loads first */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroStory />
      </Suspense>
      
      {/* Breaking news streams quickly */}
      <Suspense fallback={<BreakingSkeleton />}>
        <BreakingNews />
      </Suspense>
      
      {/* Heavy content streams last */}
      <Suspense fallback={<TrendingSkeleton />}>
        <TrendingStories />
      </Suspense>
    </div>
  );
}

// Progressive enhancement with JavaScript disabled
export default function AccessibleStreaming() {
  return (
    <div>
      <noscript>
        {/* Full content for non-JS users */}
        <CompleteContent />
      </noscript>
      
      {/* Progressive streaming for JS users */}
      <Suspense fallback={<BasicFallback />}>
        <EnhancedContent />
      </Suspense>
    </div>
  );
}
```

**Architecture Decisions:**
- Streaming strategy for different types of applications
- Balancing loading states vs content flash
- SEO considerations with streaming content
- Monitoring and debugging streaming performance
</details>