# React Query (TanStack Query)

## ⚡ Quick Revision
- **Server state management**: Caching, synchronization, background updates for API data
- **Automatic caching**: Smart caching with stale-while-revalidate strategy
- **Background refetching**: Keeps data fresh on window focus, reconnection, intervals
- **Optimistic updates**: Update UI immediately, rollback on error
- **Mutations**: Handle POST/PUT/DELETE with automatic cache invalidation
- **Common pitfall**: Not setting proper cache keys or invalidation strategies

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query for fetching data
function UserProfile({ userId }) {
  const { 
    data: user, 
    isLoading, 
    error, 
    isStale 
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {user.name}!</div>;
}

// Mutation for updating data
function UpdateProfile() {
  const queryClient = useQueryClient();
  
  const updateUserMutation = useMutation({
    mutationFn: (userData) => api.updateUser(userData),
    onMutate: async (newUserData) => {
      // Optimistic update
      await queryClient.cancelQueries(['user', newUserData.id]);
      const previousUser = queryClient.getQueryData(['user', newUserData.id]);
      queryClient.setQueryData(['user', newUserData.id], newUserData);
      return { previousUser };
    },
    onError: (err, newUserData, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', newUserData.id], context.previousUser);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries(['user']);
    },
  });

  return (
    <button onClick={() => updateUserMutation.mutate(newData)}>
      {updateUserMutation.isLoading ? 'Updating...' : 'Update Profile'}
    </button>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
React Query (TanStack Query) was created to solve **server state management** challenges:

**Problems It Solves:**
1. **Manual cache management**: No need to manually store API responses in state
2. **Loading state complexity**: Automatic loading, error, and success states
3. **Data staleness**: Keeps data fresh with smart background updates
4. **Race conditions**: Automatically cancels outdated requests
5. **Request deduplication**: Prevents duplicate API calls for same data

**Client State vs Server State:**
```jsx
// ❌ Managing server state in component state
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    api.getUser(userId)
      .then(userData => {
        if (!cancelled) {
          setUser(userData);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [userId]);

  // Manual refetching, no caching, no background updates
}

// ✅ React Query handles all the complexity
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
  });

  // Automatic caching, background updates, error recovery
}
```
</details>

<details>
<summary>How it works</summary>
React Query implements a **sophisticated caching layer** with these core concepts:

**1. Query Keys - Cache Identification:**
```jsx
// Query keys create unique cache entries
useQuery(['todos'], fetchTodos);                    // All todos
useQuery(['todos', 'completed'], fetchCompletedTodos); // Completed todos
useQuery(['todo', todoId], () => fetchTodo(todoId));   // Specific todo

// Hierarchical invalidation
queryClient.invalidateQueries(['todos']); // Invalidates all todo-related queries
```

**2. Cache Lifecycle:**
```jsx
// Fresh → Stale → Inactive → Garbage Collection
const queryConfig = {
  staleTime: 5 * 60 * 1000,    // 5 mins: data considered fresh
  cacheTime: 10 * 60 * 1000,   // 10 mins: cache kept after component unmount
  refetchOnWindowFocus: true,   // Refetch when user returns to tab
  refetchOnReconnect: true,     // Refetch when internet reconnects
  retry: 3,                     // Retry failed requests 3 times
};
```

**3. Background Updates:**
```jsx
function useAutoRefreshData() {
  return useQuery({
    queryKey: ['liveData'],
    queryFn: fetchLiveData,
    refetchInterval: 30 * 1000,        // Poll every 30 seconds
    refetchIntervalInBackground: true,  // Continue polling in background
  });
}
```

**4. Dependent Queries:**
```jsx
function UserPosts({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetchUserPosts(user.id),
    enabled: !!user?.id, // Only run when user is loaded
  });
}
```

**5. Infinite Queries:**
```jsx
function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });

  return (
    <div>
      {data.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.posts.map(post => <PostCard key={post.id} post={post} />)}
        </React.Fragment>
      ))}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </div>
  );
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**❌ "React Query replaces all state management"**
- React Query is for **server state** only
- Still need useState/useReducer for UI state
- Can combine with Redux/Zustand for complex client state

**❌ "Query keys don't matter"**
```jsx
// ❌ Poor query key structure
useQuery(['userData'], () => fetchUser(userId)); // Same key for different users!

// ✅ Include all variables in query key
useQuery(['user', userId], () => fetchUser(userId));
useQuery(['user', userId, 'posts'], () => fetchUserPosts(userId));
```

**❌ "Mutations automatically update cache"**
```jsx
// ❌ Mutation doesn't update related queries
const addPostMutation = useMutation({
  mutationFn: addPost,
  // Cache is now stale!
});

// ✅ Invalidate or update cache after mutation
const addPostMutation = useMutation({
  mutationFn: addPost,
  onSuccess: () => {
    queryClient.invalidateQueries(['posts']);
  },
});

// ✅ Or optimistically update cache
const addPostMutation = useMutation({
  mutationFn: addPost,
  onMutate: async (newPost) => {
    await queryClient.cancelQueries(['posts']);
    const previousPosts = queryClient.getQueryData(['posts']);
    
    queryClient.setQueryData(['posts'], old => [...old, newPost]);
    
    return { previousPosts };
  },
  onError: (err, newPost, context) => {
    queryClient.setQueryData(['posts'], context.previousPosts);
  },
});
```

**❌ "Enabled option is for loading states"**
```jsx
// ❌ Misusing enabled
const { data, isLoading } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  enabled: !isLoading, // This creates an infinite loop!
});

// ✅ Enabled is for conditional execution
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // Only fetch when userId exists
});
```
</details>

<details>
<summary>Interview angle</summary>
**Key Interview Questions:**

1. **"How does React Query differ from Redux?"**
   - React Query: Server state, caching, background sync
   - Redux: Client state, predictable updates, time travel

2. **"What's the difference between staleTime and cacheTime?"**
   - staleTime: How long data is considered fresh
   - cacheTime: How long data stays in memory after component unmounts

3. **"How do you handle optimistic updates?"**
   - Use onMutate to update cache immediately
   - Use onError to rollback changes
   - Use onSettled to refetch/revalidate

**Advanced Patterns:**

**1. Custom Query Hook:**
```jsx
function useUser(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    select: (data) => ({
      ...data,
      fullName: `${data.firstName} ${data.lastName}`,
    }),
  });
}
```

**2. Parallel Queries:**
```jsx
function UserDashboard({ userId }) {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['user', userId],
        queryFn: () => fetchUser(userId),
      },
      {
        queryKey: ['posts', userId],
        queryFn: () => fetchUserPosts(userId),
        enabled: !!userId,
      },
      {
        queryKey: ['notifications', userId],
        queryFn: () => fetchNotifications(userId),
        enabled: !!userId,
      },
    ],
  });

  const [userQuery, postsQuery, notificationsQuery] = queries;
}
```

**3. Mutation with Multiple Cache Updates:**
```jsx
const deletePostMutation = useMutation({
  mutationFn: deletePost,
  onSuccess: (deletedPost) => {
    // Remove from posts list
    queryClient.setQueryData(['posts'], old => 
      old.filter(post => post.id !== deletedPost.id)
    );
    
    // Remove individual post cache
    queryClient.removeQueries(['post', deletedPost.id]);
    
    // Update user's post count
    queryClient.setQueryData(['user', deletedPost.authorId], old => ({
      ...old,
      postCount: old.postCount - 1,
    }));
  },
});
```

**4. Error Recovery:**
```jsx
const retryableQuery = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: (failureCount, error) => {
    if (error.status === 404) return false; // Don't retry 404s
    return failureCount < 3;
  },
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

**Performance Tips:**
- Use `select` to transform data and prevent unnecessary re-renders
- Implement proper query key structure for efficient invalidation
- Use `keepPreviousData` for pagination to prevent loading states
- Consider `suspense` mode for consistent loading patterns
</details>