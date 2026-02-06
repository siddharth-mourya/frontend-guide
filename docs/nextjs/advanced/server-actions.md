# Server Actions

## ⚡ Quick Revision
- **Server Actions**: Server-side functions marked with `'use server'`
- **Form Integration**: Native form handling without API routes
- **Progressive Enhancement**: Works without JavaScript enabled
- **Type Safety**: Full TypeScript support with server-side validation
- **Revalidation**: Built-in cache invalidation after mutations
- **Error Handling**: Server-side error boundaries and form states

```javascript
// Server Action definition
'use server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  // Validate data
  if (!title || !content) {
    return { error: 'Title and content required' };
  }
  
  // Save to database
  await savePost({ title, content });
  
  // Revalidate cache
  revalidatePath('/posts');
  
  return { success: true };
}

// Form component
export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}

// With useFormState for better UX
import { useFormState } from 'react-dom';

export default function EnhancedForm() {
  const [state, formAction] = useFormState(createPost, { message: '' });
  
  return (
    <form action={formAction}>
      <input name="title" required />
      {state.error && <p className="error">{state.error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Common Pitfalls:**
- Not handling form validation properly
- Missing `'use server'` directive
- Not revalidating cache after mutations

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Developer Experience:**
- Eliminate boilerplate API route creation
- Direct function calls instead of fetch() to endpoints
- Unified codebase for client and server logic

**Progressive Enhancement:**
- Forms work without JavaScript (graceful degradation)
- Better accessibility and SEO
- Reduced client-side bundle size

**Security Benefits:**
- Server-side validation and authorization
- Sensitive operations stay on server
- Reduced attack surface area
</details>

<details>
<summary>How it works</summary>
**Server Action Flow:**
1. Form submitted with Server Action
2. Next.js serializes form data
3. Server Action executes on server
4. Response sent back to client
5. Cache revalidation triggered if specified

**Server Action Compilation:**
```javascript
// Source code
'use server';
export async function updateUser(formData) {
  // Server logic here
}

// Compiled output creates hidden API endpoint
// POST /api/__nextjs_server_action_...
// Form automatically POSTs to this endpoint
```

**Advanced Server Actions:**
```javascript
'use server';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';

export async function updateProfile(prevState, formData) {
  const session = await getSession();
  
  if (!session) {
    return { error: 'Unauthorized' };
  }
  
  try {
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
    };
    
    // Validate
    const validationResult = validateUser(userData);
    if (!validationResult.success) {
      return { error: validationResult.error };
    }
    
    // Update database
    await updateUserInDB(session.user.id, userData);
    
    // Revalidate related data
    revalidateTag(`user-${session.user.id}`);
    
    // Redirect after success
    redirect('/profile?updated=true');
    
  } catch (error) {
    return { error: 'Failed to update profile' };
  }
}

// Optimistic updates with Server Actions
'use client';
import { useOptimistic } from 'react';

export default function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
  
  async function addTodo(formData) {
    const todo = {
      id: Date.now(),
      text: formData.get('text'),
      completed: false
    };
    
    // Optimistically add todo
    addOptimisticTodo(todo);
    
    // Call server action
    await createTodo(formData);
  }
  
  return (
    <div>
      <form action={addTodo}>
        <input name="text" required />
        <button>Add Todo</button>
      </form>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Server Action Organization:**
```javascript
// actions/user-actions.js
'use server';

export async function createUser(formData) {
  // Implementation
}

export async function updateUser(formData) {
  // Implementation
}

export async function deleteUser(id) {
  // Implementation
}

// Usage in component
import { createUser, updateUser } from '@/actions/user-actions';
```
</details>

<details>
<summary>Common misconceptions</summary>
**"Server Actions replace all API routes"**
- API routes still needed for external integrations
- Server Actions are for form handling and mutations

**"Server Actions are always slower than client-side"**
- No client-side JavaScript execution overhead
- Direct server execution can be faster for complex operations

**"You can't use Server Actions with external APIs"**
- Server Actions can call external APIs server-side
- Better for APIs requiring secrets or authentication

**"Server Actions don't work with TypeScript"**
- Full TypeScript support with proper typing
- Better type safety than traditional API routes
</details>

<details>
<summary>Interview angle</summary>
**Architecture Questions:**
- "When would you use Server Actions vs API routes?"
- "How do you handle file uploads with Server Actions?"
- "What's your strategy for error handling in Server Actions?"

**Real-world Implementation:**
```javascript
// Multi-step form with Server Actions
'use server';
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18)
});

export async function saveUserStep(step, formData) {
  // Get existing data from session/database
  const existingData = await getUserFormData();
  
  // Validate current step
  const stepData = Object.fromEntries(formData.entries());
  
  try {
    // Partial validation based on step
    if (step === 'personal') {
      UserSchema.pick({ name: true, email: true }).parse(stepData);
    }
    
    // Save step data
    await saveFormStep(step, stepData);
    
    // If final step, complete registration
    if (step === 'final') {
      const completeData = { ...existingData, ...stepData };
      UserSchema.parse(completeData);
      await createUser(completeData);
      redirect('/welcome');
    }
    
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

// File upload Server Action
export async function uploadFile(formData) {
  const file = formData.get('file');
  
  if (!file || file.size === 0) {
    return { error: 'No file provided' };
  }
  
  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Invalid file type' };
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    return { error: 'File too large' };
  }
  
  // Process file
  const buffer = await file.arrayBuffer();
  const filename = await saveFileToStorage(buffer, file.name);
  
  revalidatePath('/files');
  return { filename, success: true };
}
```

**Security and Performance:**
- Authentication and authorization in Server Actions
- Rate limiting and abuse prevention
- Optimizing Server Action performance
- Handling concurrent form submissions
</details>