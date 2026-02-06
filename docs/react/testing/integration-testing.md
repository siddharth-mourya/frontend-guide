# Integration Testing

## ⚡ Quick Revision

- **Integration testing:** Testing multiple components/modules working together
- Tests realistic user flows across multiple components
- More confidence than unit tests, faster than E2E
- Mock Service Worker (MSW) for realistic API mocking
- Test data flow between parent and child components

**Core concepts:**
- Test component interactions, not isolation
- Mock at network boundary, not component level
- Verify complete user workflows
- Test state management integration (Redux, Context)
- Test routing and navigation flows

```javascript
// Basic integration test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('complete user flow: search and view results', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  // Search for items
  const searchInput = screen.getByPlaceholderText(/search/i);
  await user.type(searchInput, 'react');
  await user.click(screen.getByRole('button', { name: /search/i }));
  
  // Verify results displayed
  expect(await screen.findByText(/results for "react"/i)).toBeInTheDocument();
  const items = screen.getAllByRole('listitem');
  expect(items.length).toBeGreaterThan(0);
  
  // Click first result
  await user.click(items[0]);
  
  // Verify detail page
  expect(await screen.findByRole('heading')).toBeInTheDocument();
});
```

**MSW setup:**

```javascript
// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
      ])
    );
  }),
  
  rest.post('/api/users', async (req, res, ctx) => {
    const { name, email } = await req.json();
    return res(
      ctx.status(201),
      ctx.json({ id: 3, name, email })
    );
  }),
  
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ id, name: 'John Doe', email: 'john@example.com' })
    );
  })
];

// src/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/setupTests.js
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Testing with providers:**

```javascript
// Test with multiple providers
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from './ThemeContext';
import store from './store';

function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({ reducer: rootReducer, preloadedState }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  }
  
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Usage
test('user flow with all providers', async () => {
  const { store } = renderWithProviders(<App />);
  
  // Test with full app context
  expect(store.getState().user).toBeNull();
  
  // Perform actions...
});
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Integration testing fills the gap between unit and E2E testing:

1. **More realistic than unit tests**:
   - Tests how components work together, not in isolation
   - Catches integration bugs that unit tests miss
   - Verifies data flows correctly between components
   - Tests with real state management and routing

2. **Faster and more reliable than E2E tests**:
   - Runs in Node environment, not real browser
   - No browser startup overhead
   - More deterministic, less flaky
   - Easier to debug failures

3. **Better test coverage**:
   - Tests complete user workflows
   - Verifies API integration without hitting real servers
   - Tests multiple components in realistic scenarios
   - Balances speed with confidence

**Testing pyramid:**

```
        /\
       /E2E\      <- Few, slow, high confidence
      /------\
     / Integ  \   <- Some, moderate speed, good confidence
    /----------\
   /   Unit     \ <- Many, fast, lower confidence
  /--------------\
```

**When to use integration tests:**
- User workflows spanning multiple components
- Form submission to data display flows
- Authentication and authorization flows
- Shopping cart/checkout processes
- Dashboard data loading and filtering
- Navigation between pages/routes

**When NOT to use:**
- Simple utility functions (unit test)
- Complex business logic (unit test)
- Full application flows (E2E test)
- Browser-specific features (E2E test)
</details>

<details>
<summary>How it works</summary>
**Integration test structure:**

1. **Setup phase:**
   - Render component tree (often top-level)
   - Setup providers (Router, Redux, Context)
   - Configure MSW handlers for APIs

2. **Interaction phase:**
   - Simulate user actions across components
   - Type in forms, click buttons, navigate
   - Wait for async operations

3. **Assertion phase:**
   - Verify final UI state
   - Check data flow between components
   - Validate side effects (API calls, navigation)

**MSW (Mock Service Worker) architecture:**

```javascript
// MSW intercepts network requests at network level
Browser/Node → fetch/axios → MSW handler → Mock response

// Instead of:
Component → axios.get() → Real API

// With MSW:
Component → axios.get() → MSW intercepts → Returns mock data
```

**Benefits over jest.mock():**
- Works with any HTTP library (fetch, axios, etc.)
- Same mock handlers for tests and development
- No component-level mocking needed
- More realistic request/response cycle

**Request matching:**

```javascript
// Exact match
rest.get('/api/users', handler);

// Path parameters
rest.get('/api/users/:id', (req, res, ctx) => {
  const { id } = req.params;
  // ...
});

// Query parameters
rest.get('/api/search', (req, res, ctx) => {
  const query = req.url.searchParams.get('q');
  // ...
});

// Request body
rest.post('/api/users', async (req, res, ctx) => {
  const body = await req.json();
  // ...
});

// Conditional responses
rest.get('/api/users/:id', (req, res, ctx) => {
  const { id } = req.params;
  
  if (id === '404') {
    return res(ctx.status(404), ctx.json({ error: 'Not found' }));
  }
  
  return res(ctx.status(200), ctx.json({ id, name: 'John' }));
});
```

**Provider composition pattern:**

```javascript
// Composable test wrapper
function createWrapper(...providers) {
  return ({ children }) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}

// Usage
const wrapper = createWrapper(
  ({ children }) => <Provider store={store}>{children}</Provider>,
  ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
  ({ children }) => <ThemeProvider>{children}</ThemeProvider>
);

render(<App />, { wrapper });
```
</details>

<details>
<summary>Common patterns and gotchas</summary>
**1. Complete form submission flow:**

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from './mocks/server';
import RegistrationFlow from './RegistrationFlow';

test('complete registration flow', async () => {
  const user = userEvent.setup();
  render(<RegistrationFlow />);
  
  // Step 1: Fill form
  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
  
  // Step 2: Submit
  await user.click(screen.getByRole('button', { name: /sign up/i }));
  
  // Step 3: Verify loading state
  expect(screen.getByText(/creating account/i)).toBeInTheDocument();
  
  // Step 4: Verify success and redirect
  await waitFor(() => {
    expect(screen.getByText(/welcome, john/i)).toBeInTheDocument();
  });
  
  // Step 5: Verify dashboard loads
  expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
});

test('handles registration error', async () => {
  // Override handler for this test
  server.use(
    rest.post('/api/register', (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Email already exists' })
      );
    })
  );
  
  const user = userEvent.setup();
  render(<RegistrationFlow />);
  
  await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password');
  await user.click(screen.getByRole('button', { name: /sign up/i }));
  
  expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  
  // Still on registration page
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});
```

**2. Testing with Redux:**

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import ShoppingFlow from './ShoppingFlow';

function renderWithRedux(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { cart: cartReducer },
      preloadedState
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

test('adds item to cart and checks out', async () => {
  const user = userEvent.setup();
  const { store } = renderWithRedux(<ShoppingFlow />);
  
  // Initial state
  expect(store.getState().cart.items).toHaveLength(0);
  
  // Add item to cart
  await user.click(screen.getByRole('button', { name: /add to cart/i }));
  
  // Verify cart updated
  expect(store.getState().cart.items).toHaveLength(1);
  expect(screen.getByText(/1 item in cart/i)).toBeInTheDocument();
  
  // Go to cart
  await user.click(screen.getByRole('link', { name: /cart/i }));
  
  // Verify cart page
  expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();
  expect(screen.getByText(/item 1/i)).toBeInTheDocument();
  
  // Proceed to checkout
  await user.click(screen.getByRole('button', { name: /checkout/i }));
  
  // Fill checkout form and submit...
  expect(await screen.findByText(/order confirmed/i)).toBeInTheDocument();
  
  // Cart should be empty after checkout
  expect(store.getState().cart.items).toHaveLength(0);
});
```

**3. Testing navigation flows:**

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import HomePage from './HomePage';
import ProductPage from './ProductPage';

function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductPage />} />
      </Routes>
    </MemoryRouter>
  );
}

test('navigates from home to product detail', async () => {
  const user = userEvent.setup();
  renderWithRouter(<App />);
  
  // On home page
  expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
  
  // Click product link
  const productLink = screen.getByRole('link', { name: /product 1/i });
  await user.click(productLink);
  
  // On product page
  expect(await screen.findByRole('heading', { name: /product 1/i })).toBeInTheDocument();
  expect(screen.getByText(/description/i)).toBeInTheDocument();
  
  // Back button
  await user.click(screen.getByRole('button', { name: /back/i }));
  
  // Back on home page
  expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
});
```

**4. Testing authentication flows:**

```javascript
test('login flow with protected routes', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  // Start on login page (protected route redirects)
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  
  // Fill login form
  await user.type(screen.getByLabelText(/email/i), 'user@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password');
  await user.click(screen.getByRole('button', { name: /login/i }));
  
  // Should redirect to dashboard after successful login
  expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  
  // User info displayed
  expect(screen.getByText(/welcome, user@example.com/i)).toBeInTheDocument();
  
  // Logout
  await user.click(screen.getByRole('button', { name: /logout/i }));
  
  // Back to login
  expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();
});
```

**5. Testing loading and error states:**

```javascript
test('handles loading and error states in data flow', async () => {
  render(<UserDashboard />);
  
  // Initial loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Data loads
  const userCards = await screen.findAllByRole('article');
  expect(userCards).toHaveLength(3);
  
  // Trigger refresh with error
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );
  
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /refresh/i }));
  
  // Error state displayed
  expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  
  // Retry with success
  server.resetHandlers();
  await user.click(screen.getByRole('button', { name: /retry/i }));
  
  // Data displayed again
  expect(await screen.findAllByRole('article')).toHaveLength(3);
});
```

**6. Testing dependent API calls:**

```javascript
test('loads user and their posts sequentially', async () => {
  render(<UserProfile userId="123" />);
  
  // First API call: get user
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
  
  // Second API call: get user's posts (depends on first call)
  const posts = await screen.findAllByRole('article');
  expect(posts).toHaveLength(5);
  
  // Verify both data sources combined correctly
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText(/5 posts/i)).toBeInTheDocument();
});
```

**Common gotchas:**

```javascript
// ❌ Testing too much in one test
test('entire application', async () => {
  // 100 lines of interactions and assertions
  // Hard to debug when it fails
});

// ✅ Split into focused integration tests
test('user can search for products', async () => { /* ... */ });
test('user can add product to cart', async () => { /* ... */ });
test('user can complete checkout', async () => { /* ... */ });

// ❌ Not resetting MSW handlers
test('test 1', async () => {
  server.use(rest.get('/api', () => res(ctx.json({ error: true }))));
  // Test runs
});

test('test 2', async () => {
  // Still uses error handler from test 1!
});

// ✅ Reset in afterEach (already in setupTests.js)
afterEach(() => server.resetHandlers());

// ❌ Mixing unit and integration concerns
test('button click', async () => {
  const mockFn = jest.fn();
  render(<Button onClick={mockFn} />);
  await user.click(button);
  expect(mockFn).toHaveBeenCalled(); // Unit test concern
});

// ✅ Test integrated behavior
test('clicking add to cart updates cart count', async () => {
  render(<ProductPage />);
  await user.click(screen.getByRole('button', { name: /add to cart/i }));
  expect(screen.getByText(/1 item/i)).toBeInTheDocument();
});

// ❌ Not waiting for async operations
test('loads data', async () => {
  render(<Component />);
  const data = screen.getByText(/data/i); // Throws if not loaded yet
});

// ✅ Wait for async data
test('loads data', async () => {
  render(<Component />);
  const data = await screen.findByText(/data/i); // Waits for data
  expect(data).toBeInTheDocument();
});
```
</details>

<details>
<summary>Interview talking points</summary>
**When asked about integration testing:**

1. **Definition and purpose**:
   - "Integration tests verify multiple components working together"
   - "Test realistic user workflows, not isolated components"
   - "Bridge between unit tests (fast, isolated) and E2E tests (slow, comprehensive)"
   - "Catch integration bugs that unit tests miss while staying fast"

2. **MSW advantages**:
   - "Mock at network level, not component level - more realistic"
   - "Works with any HTTP library (fetch, axios)"
   - "Same handlers for tests and local development"
   - "Can test error scenarios, slow responses, various status codes"

3. **What to test**:
   - "Complete user workflows: login → dashboard → action → result"
   - "Form submission through to data display"
   - "Navigation flows between pages"
   - "State management integration (Redux, Context)"
   - "Loading, error, and success states"

4. **Testing strategy**:
   - "Setup reusable render helpers with providers"
   - "Use MSW for all API mocking"
   - "Test happy path and common error scenarios"
   - "Focus on user-visible outcomes, not implementation"

5. **Best practices**:
   - "One user flow per test for clarity"
   - "Reset handlers between tests to avoid pollution"
   - "Use semantic queries (getByRole, getByLabelText)"
   - "Wait for async operations with findBy or waitFor"

6. **Trade-offs**:
   - **Pro**: More confidence than unit tests
   - **Pro**: Faster than E2E tests
   - **Pro**: Catches real integration issues
   - **Con**: Slower than unit tests
   - **Con**: More complex setup
   - **Con**: Can be harder to debug failures

**Example answer**: "Integration tests verify complete user workflows across multiple components. I use MSW to mock APIs at the network level, which is more realistic than mocking at the component level. For example, I'd test a complete registration flow: filling the form, submitting, seeing loading state, then landing on the dashboard. I setup reusable render helpers that wrap components with necessary providers like Router and Redux. I use MSW handlers to return different responses for success and error cases. This gives me confidence that features work end-to-end while running much faster than browser-based E2E tests."
</details>

<details>
<summary>Real-world examples</summary>
**1. E-commerce checkout flow:**

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { rest } from 'msw';
import { server } from './mocks/server';
import store from './store';
import App from './App';

describe('E-commerce checkout flow', () => {
  function renderApp() {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  }
  
  test('complete purchase flow', async () => {
    const user = userEvent.setup();
    renderApp();
    
    // 1. Browse products
    expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument();
    
    // 2. Add item to cart
    const addButton = screen.getAllByRole('button', { name: /add to cart/i })[0];
    await user.click(addButton);
    
    // 3. Verify cart badge updated
    expect(screen.getByText('1')).toBeInTheDocument(); // Cart count badge
    
    // 4. Go to cart
    await user.click(screen.getByRole('link', { name: /cart/i }));
    
    // 5. Verify cart contents
    expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();
    expect(screen.getByText(/product 1/i)).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    
    // 6. Proceed to checkout
    await user.click(screen.getByRole('button', { name: /checkout/i }));
    
    // 7. Fill shipping info
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/address/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'New York');
    await user.type(screen.getByLabelText(/zip/i), '10001');
    
    // 8. Fill payment info
    await user.type(screen.getByLabelText(/card number/i), '4111111111111111');
    await user.type(screen.getByLabelText(/expiry/i), '12/25');
    await user.type(screen.getByLabelText(/cvv/i), '123');
    
    // 9. Submit order
    await user.click(screen.getByRole('button', { name: /place order/i }));
    
    // 10. Verify loading state
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
    
    // 11. Verify success page
    expect(await screen.findByText(/order confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/order #12345/i)).toBeInTheDocument();
    
    // 12. Verify cart is empty
    await user.click(screen.getByRole('link', { name: /home/i }));
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // No cart badge
  });
  
  test('handles payment failure', async () => {
    server.use(
      rest.post('/api/checkout', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: 'Payment declined' })
        );
      })
    );
    
    const user = userEvent.setup();
    renderApp();
    
    // Add item and go through checkout flow...
    // (abbreviated for brevity)
    
    await user.click(screen.getByRole('button', { name: /place order/i }));
    
    // Verify error message
    expect(await screen.findByText(/payment declined/i)).toBeInTheDocument();
    
    // Still on checkout page
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
    
    // Cart not cleared
    expect(screen.getByText(/product 1/i)).toBeInTheDocument();
  });
});
```

**2. Social media post creation flow:**

```javascript
test('create post with image upload', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  // Click create post button
  await user.click(screen.getByRole('button', { name: /create post/i }));
  
  // Modal opens
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  // Type post content
  const textarea = screen.getByLabelText(/what's on your mind/i);
  await user.type(textarea, 'Just finished an amazing hike!');
  
  // Upload image
  const file = new File(['image'], 'hike.jpg', { type: 'image/jpeg' });
  const fileInput = screen.getByLabelText(/upload image/i);
  await user.upload(fileInput, file);
  
  // Verify image preview
  expect(await screen.findByAltText(/preview/i)).toBeInTheDocument();
  
  // Submit post
  await user.click(screen.getByRole('button', { name: /post/i }));
  
  // Modal closes
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  
  // New post appears in feed
  expect(await screen.findByText(/just finished an amazing hike/i)).toBeInTheDocument();
  expect(screen.getByAltText(/hike/i)).toBeInTheDocument();
  
  // Like the post
  await user.click(screen.getByRole('button', { name: /like/i }));
  expect(screen.getByText('1 like')).toBeInTheDocument();
});
```

**3. Multi-step form with validation:**

```javascript
test('complete multi-step registration form', async () => {
  const user = userEvent.setup();
  render(<RegistrationWizard />);
  
  // Step 1: Personal info
  expect(screen.getByRole('heading', { name: /step 1/i })).toBeInTheDocument();
  await user.type(screen.getByLabelText(/first name/i), 'John');
  await user.type(screen.getByLabelText(/last name/i), 'Doe');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.click(screen.getByRole('button', { name: /next/i }));
  
  // Step 2: Address
  expect(await screen.findByRole('heading', { name: /step 2/i })).toBeInTheDocument();
  await user.type(screen.getByLabelText(/street/i), '123 Main St');
  await user.type(screen.getByLabelText(/city/i), 'New York');
  await user.selectOptions(screen.getByLabelText(/state/i), 'NY');
  await user.type(screen.getByLabelText(/zip/i), '10001');
  await user.click(screen.getByRole('button', { name: /next/i }));
  
  // Step 3: Preferences
  expect(await screen.findByRole('heading', { name: /step 3/i })).toBeInTheDocument();
  await user.click(screen.getByLabelText(/newsletter/i));
  await user.click(screen.getByLabelText(/notifications/i));
  
  // Review step
  await user.click(screen.getByRole('button', { name: /review/i }));
  expect(await screen.findByText(/john doe/i)).toBeInTheDocument();
  expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/123 main st/i)).toBeInTheDocument();
  
  // Submit
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  // Success
  expect(await screen.findByText(/registration complete/i)).toBeInTheDocument();
});

test('validates required fields', async () => {
  const user = userEvent.setup();
  render(<RegistrationWizard />);
  
  // Try to proceed without filling required fields
  await user.click(screen.getByRole('button', { name: /next/i }));
  
  // Validation errors displayed
  expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  
  // Still on step 1
  expect(screen.getByRole('heading', { name: /step 1/i })).toBeInTheDocument();
});
```

**4. Dashboard with filters and search:**

```javascript
test('filter and search functionality', async () => {
  const user = userEvent.setup();
  render(<Dashboard />);
  
  // Initial data loads
  const items = await screen.findAllByRole('article');
  expect(items).toHaveLength(10);
  
  // Apply status filter
  await user.click(screen.getByLabelText(/status/i));
  await user.click(screen.getByRole('option', { name: /active/i }));
  
  // Filtered results
  await waitFor(() => {
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });
  
  // Search
  await user.type(screen.getByPlaceholderText(/search/i), 'project');
  
  // Search results (filtered by both status and search)
  await waitFor(() => {
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
  
  // Clear filters
  await user.click(screen.getByRole('button', { name: /clear filters/i }));
  
  // Back to full list
  await waitFor(() => {
    expect(screen.getAllByRole('article')).toHaveLength(10);
  });
});
```

**5. Real-time collaboration feature:**

```javascript
test('real-time updates from WebSocket', async () => {
  const user = userEvent.setup();
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn()
  };
  
  jest.mock('./socket', () => ({
    socket: mockSocket
  }));
  
  render(<CollaborativeEditor />);
  
  // Initial content
  expect(screen.getByText(/untitled document/i)).toBeInTheDocument();
  
  // Simulate receiving update from another user
  const onMessageCallback = mockSocket.on.mock.calls.find(
    call => call[0] === 'document:update'
  )[1];
  
  act(() => {
    onMessageCallback({
      userId: 'user-2',
      userName: 'Jane',
      content: 'Hello from Jane!'
    });
  });
  
  // Update reflected in UI
  expect(screen.getByText(/hello from jane/i)).toBeInTheDocument();
  expect(screen.getByText(/jane is editing/i)).toBeInTheDocument();
  
  // Make own edit
  await user.type(screen.getByRole('textbox'), 'Response from current user');
  
  // Verify socket emission
  expect(mockSocket.emit).toHaveBeenCalledWith('document:update', {
    content: expect.stringContaining('Response from current user')
  });
});
```
</details>
