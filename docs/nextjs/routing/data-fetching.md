# Data Fetching

## ⚡ Quick Revision
- **getStaticProps**: Build-time data fetching, static generation
- **getServerSideProps**: Request-time data fetching, SSR
- **ISR (Incremental Static Regeneration)**: Static + dynamic with revalidation
- **Server Components**: Built-in async data fetching in App Router
- **Data Cache**: Automatic caching with `fetch()` in Server Components
- **generateStaticParams**: App Router equivalent to getStaticPaths

```javascript
// Pages Router - getStaticProps
export async function getStaticProps() {
  const data = await fetch('https://api.example.com/posts');
  return {
    props: { posts: data },
    revalidate: 60 // ISR - revalidate every 60 seconds
  };
}

// App Router - Server Component
export default async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 } // Built-in caching
  });
  return <PostsList posts={posts} />;
}

// Dynamic routes with static generation
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts');
  return posts.map((post) => ({ slug: post.slug }));
}
```

**Common Pitfalls:**
- Using `getServerSideProps` when `getStaticProps` would suffice
- Not implementing proper error handling for async data fetching
- Misunderstanding ISR revalidation timing

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Performance Optimization:**
- Static generation provides best performance (CDN cacheable)
- SSR provides fresh data but slower response times
- ISR combines benefits of both approaches

**SEO and UX:**
- Server-side data fetching ensures content is available for crawlers
- Reduces client-side loading states and layout shifts
- Better perceived performance with pre-rendered content

**Scalability:**
- Static generation reduces server load
- ISR allows for large sites with dynamic content
- Proper caching strategies reduce API calls
</details>

<details>
<summary>How it works</summary>
**Build-time vs Runtime:**
```javascript
// Build-time (getStaticProps)
// - Runs at build time
// - HTML pre-generated
// - Served from CDN
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}

// Runtime (getServerSideProps)
// - Runs on each request
// - Fresh data every time
// - Slower response
export async function getServerSideProps(context) {
  const data = await fetchData(context.params.id);
  return { props: { data } };
}
```

**ISR Flow:**
1. Initial request serves static page
2. Background regeneration triggered after revalidate time
3. Next request receives updated static page
4. Process repeats for continuous updates

**App Router Data Fetching:**
```javascript
// Parallel data fetching
async function getUser(id) {
  const user = await fetch(`/api/users/${id}`);
  return user.json();
}

async function getPosts(userId) {
  const posts = await fetch(`/api/users/${userId}/posts`);
  return posts.json();
}

export default async function UserProfile({ params }) {
  // These run in parallel
  const [user, posts] = await Promise.all([
    getUser(params.id),
    getPosts(params.id)
  ]);
  
  return (
    <div>
      <UserInfo user={user} />
      <UserPosts posts={posts} />
    </div>
  );
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"getStaticProps runs on every request"**
- It runs only at build time (and revalidation for ISR)
- Runtime data should use getServerSideProps or Server Components

**"ISR immediately updates content"**
- First user after revalidate time triggers regeneration
- They still see old content, next users see updated content

**"Server Components replace all data fetching methods"**
- They're App Router specific
- Pages Router methods still valid for incremental migration

**"Fetch in useEffect is equivalent"**
- Client-side fetching has different performance characteristics
- No SEO benefits, potential layout shifts
</details>

<details>
<summary>Interview angle</summary>
**Performance Questions:**
- "When would you choose getStaticProps vs getServerSideProps?"
- "How do you implement efficient data fetching for large datasets?"
- "Explain ISR and its trade-offs"

**Architecture Decisions:**
- Hybrid approaches combining multiple data fetching methods
- Caching strategies for different data types
- Error handling and fallback strategies

**Migration Scenarios:**
- Converting from client-side data fetching to SSG/SSR
- Implementing ISR for existing static sites
- Transitioning from Pages to App Router data patterns

**Real-world Scenarios:**
```javascript
// E-commerce product page - ISR
export async function getStaticProps({ params }) {
  const product = await fetchProduct(params.id);
  
  if (!product) {
    return { notFound: true };
  }
  
  return {
    props: { product },
    revalidate: 300, // 5 minutes
  };
}

// User dashboard - SSR
export async function getServerSideProps({ req }) {
  const session = await getSession(req);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  const userData = await fetchUserData(session.user.id);
  return { props: { userData } };
}
```
</details>