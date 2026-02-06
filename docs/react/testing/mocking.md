# Mocking in React Testing

## ⚡ Quick Revision

- **Mocking:** Replacing real implementations with controlled test doubles
- Jest provides: `jest.fn()`, `jest.mock()`, `jest.spyOn()`
- Mock API calls to avoid real network requests in tests
- Mock timers for testing setTimeout, setInterval, debounce
- Mock modules to isolate component dependencies

**Core concepts:**
- Mock functions: Track calls, arguments, return values
- Module mocks: Replace entire modules (axios, fetch)
- Partial mocks: Mock some exports, keep others real
- Timer mocks: Control time-dependent code
- Manual mocks: Custom implementations in `__mocks__` folder

```javascript
// Mock function
const mockCallback = jest.fn();
mockCallback('arg1', 'arg2');
expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockCallback).toHaveBeenCalledTimes(1);

// Mock return values
const mockFn = jest.fn()
  .mockReturnValue('default')
  .mockReturnValueOnce('first call')
  .mockReturnValueOnce('second call');

// Mock async functions
const mockAsync = jest.fn()
  .mockResolvedValue({ data: 'success' })
  .mockRejectedValueOnce(new Error('API failed'));

// Mock modules
jest.mock('axios');
import axios from 'axios';
axios.get.mockResolvedValue({ data: { user: 'John' } });

// Mock timers
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
jest.runAllTimers();
jest.useRealTimers();
```

**Common patterns:**

```javascript
// Spy on object method
const user = { getName: () => 'John' };
const spy = jest.spyOn(user, 'getName');
user.getName();
expect(spy).toHaveBeenCalled();
spy.mockRestore(); // Restore original

// Mock with implementation
const mockFetch = jest.fn((url) => {
  if (url.includes('users')) {
    return Promise.resolve({ json: () => ({ name: 'John' }) });
  }
  return Promise.reject(new Error('Not found'));
});

// Partial module mock
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'), // Keep other exports
  formatDate: jest.fn(() => '2024-01-01') // Mock specific export
}));

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks(); // Clear call history
  jest.restoreAllMocks(); // Restore original implementations
});
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Mocking is essential for effective testing because:

1. **Isolation**: Test components in isolation without external dependencies
   - No real API calls, database queries, or file system operations
   - Tests run fast and don't depend on external services
   - Avoid flaky tests due to network issues

2. **Control**: Deterministic test behavior
   - Control what functions return (success, error, edge cases)
   - Test error handling without breaking real systems
   - Simulate slow responses, timeouts, or rate limits

3. **Speed**: Tests run in milliseconds, not seconds
   - No network latency
   - No waiting for real timers/animations
   - Parallel test execution without conflicts

4. **Safety**: Don't affect production systems
   - No accidental writes to real databases
   - No sending real emails or payments
   - Test destructive operations safely

**When to mock:**
- External APIs and services
- Browser APIs (localStorage, fetch, geolocation)
- Third-party libraries (axios, moment, lodash)
- Time-dependent code (Date.now(), setTimeout)
- File system operations
- Complex dependencies with side effects

**When NOT to mock:**
- The component you're testing (test the real thing)
- Simple utility functions (test real implementations)
- React itself (render real React components)
- Libraries that are central to what you're testing
</details>

<details>
<summary>How it works</summary>
**Mock functions mechanism:**

```javascript
// jest.fn() creates a mock function
const mockFn = jest.fn();

// Internally tracks:
// - mock.calls: Array of call arguments
// - mock.results: Array of return values
// - mock.instances: Array of this values
// - mock.contexts: Array of contexts

mockFn('arg1', 'arg2');
mockFn('arg3');

console.log(mockFn.mock.calls);
// [['arg1', 'arg2'], ['arg3']]

console.log(mockFn.mock.calls[0][0]); // 'arg1'
console.log(mockFn.mock.calls.length); // 2
```

**Module mocking (jest.mock):**

Jest hoists `jest.mock()` to top of file before imports:

```javascript
// This happens BEFORE imports due to hoisting
jest.mock('axios');

// Then imports run
import axios from 'axios';
import Component from './Component';

// axios is now a mock object
test('fetches data', () => {
  axios.get.mockResolvedValue({ data: 'test' });
  // Test component that uses axios
});
```

**How jest.mock() works:**
1. Jest intercepts the module import
2. Returns a mock object with all exports as jest.fn()
3. You can customize mock behavior per test
4. Original module never executes

**Automatic mocking:**

```javascript
// Jest auto-mocks all functions in module
jest.mock('./api');
import * as api from './api';

// All functions are jest.fn() automatically
api.fetchUser.mockResolvedValue({ name: 'John' });
```

**Manual mocks (`__mocks__` folder):**

```
src/
  api.js
  __mocks__/
    api.js  <- Custom mock implementation
  Component.test.js
```

```javascript
// __mocks__/api.js
export const fetchUser = jest.fn(() => 
  Promise.resolve({ name: 'John' })
);

// Component.test.js
jest.mock('./api'); // Uses __mocks__/api.js
import { fetchUser } from './api';

test('uses manual mock', async () => {
  await fetchUser();
  expect(fetchUser).toHaveBeenCalled();
});
```

**Timer mocks mechanism:**

```javascript
jest.useFakeTimers();

// setTimeout/setInterval now don't run automatically
setTimeout(() => console.log('executed'), 1000);

// Nothing logged yet - timer is paused

jest.advanceTimersByTime(1000); // Fast-forward 1 second
// Now "executed" is logged

// Or run all pending timers instantly
jest.runAllTimers();

// Restore real timers
jest.useRealTimers();
```

**Spy mechanism:**

```javascript
const obj = {
  method: (x) => x * 2
};

// Spy wraps original function
const spy = jest.spyOn(obj, 'method');

// Original still works
console.log(obj.method(5)); // 10

// But calls are tracked
expect(spy).toHaveBeenCalledWith(5);

// Can override behavior
spy.mockImplementation(() => 100);
console.log(obj.method(5)); // 100

// Restore original
spy.mockRestore();
console.log(obj.method(5)); // 10 (original behavior)
```
</details>

<details>
<summary>Common patterns and gotchas</summary>
**1. Mocking fetch API:**

```javascript
// Global fetch mock
global.fetch = jest.fn();

test('fetches user data', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'John', id: 1 })
  });
  
  const data = await fetchUser(1);
  
  expect(fetch).toHaveBeenCalledWith('/api/users/1');
  expect(data).toEqual({ name: 'John', id: 1 });
});

test('handles fetch error', async () => {
  fetch.mockRejectedValueOnce(new Error('Network error'));
  
  await expect(fetchUser(1)).rejects.toThrow('Network error');
});

// Cleanup
afterEach(() => {
  fetch.mockClear();
});
```

**2. Mocking axios:**

```javascript
jest.mock('axios');
import axios from 'axios';

test('fetches data with axios', async () => {
  const mockData = { data: { user: 'John' } };
  axios.get.mockResolvedValue(mockData);
  
  const result = await getUserData();
  
  expect(axios.get).toHaveBeenCalledWith('/api/user');
  expect(result).toEqual(mockData.data);
});

// Multiple calls with different responses
test('handles multiple API calls', async () => {
  axios.get
    .mockResolvedValueOnce({ data: { id: 1 } })
    .mockResolvedValueOnce({ data: { id: 2 } });
  
  const user1 = await getUser(1);
  const user2 = await getUser(2);
  
  expect(user1.id).toBe(1);
  expect(user2.id).toBe(2);
});
```

**3. Mocking module with partial implementation:**

```javascript
// utils.js exports: formatDate, formatCurrency, formatPhone

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'), // Keep original implementations
  formatDate: jest.fn(() => '2024-01-01') // Mock only this one
}));

import { formatDate, formatCurrency } from './utils';

test('uses real and mocked functions', () => {
  expect(formatDate(new Date())).toBe('2024-01-01'); // Mocked
  expect(formatCurrency(100)).toBe('$100.00'); // Real implementation
});
```

**4. Mocking React components:**

```javascript
// Mock child component to focus on parent
jest.mock('./ChildComponent', () => {
  return function MockChildComponent(props) {
    return <div data-testid="child-mock">{props.title}</div>;
  };
});

import { render, screen } from '@testing-library/react';
import ParentComponent from './ParentComponent';

test('renders with mocked child', () => {
  render(<ParentComponent />);
  expect(screen.getByTestId('child-mock')).toBeInTheDocument();
});
```

**5. Mocking hooks:**

```javascript
// Mock useRouter from Next.js
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

import { useRouter } from 'next/router';

test('uses router', () => {
  const push = jest.fn();
  useRouter.mockReturnValue({
    push,
    pathname: '/',
    query: {},
    asPath: '/'
  });
  
  render(<Component />);
  
  // Component uses router
  expect(push).toHaveBeenCalledWith('/dashboard');
});
```

**6. Mocking timers for debounce/throttle:**

```javascript
jest.useFakeTimers();

test('debounces search input', async () => {
  const user = userEvent.setup({ delay: null }); // Disable userEvent delay
  const mockSearch = jest.fn();
  
  render(<SearchInput onSearch={mockSearch} />);
  const input = screen.getByRole('textbox');
  
  // Type quickly
  await user.type(input, 'test');
  
  // Search not called yet (debounced)
  expect(mockSearch).not.toHaveBeenCalled();
  
  // Fast-forward time
  act(() => {
    jest.advanceTimersByTime(500);
  });
  
  // Now search is called once
  expect(mockSearch).toHaveBeenCalledTimes(1);
  expect(mockSearch).toHaveBeenCalledWith('test');
});

afterEach(() => {
  jest.useRealTimers();
});
```

**7. Mocking Date.now():**

```javascript
test('uses current date', () => {
  const mockDate = new Date('2024-01-01');
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  
  render(<Component />);
  
  expect(screen.getByText(/2024-01-01/i)).toBeInTheDocument();
  
  jest.restoreAllMocks();
});

// Or mock Date.now specifically
jest.spyOn(Date, 'now').mockReturnValue(1609459200000);
```

**8. Mocking localStorage:**

```javascript
const localStorageMock = (() => {
  let store = {};
  
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

test('saves to localStorage', () => {
  render(<Component />);
  
  // Component saves data
  expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value');
});
```

**Common gotchas:**

```javascript
// ❌ Forgetting to clear mocks between tests
test('test 1', () => {
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(1);
});

test('test 2', () => {
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(1); // FAILS - count is 2
});

// ✅ Clear mocks in beforeEach
beforeEach(() => {
  jest.clearAllMocks();
});

// ❌ Mock not hoisted properly
import axios from 'axios';
jest.mock('axios'); // Too late - import already executed

// ✅ Mock before import
jest.mock('axios');
import axios from 'axios';

// ❌ Not restoring spies
const spy = jest.spyOn(console, 'error');
// Test runs
// Spy still active in other tests!

// ✅ Restore in afterEach
afterEach(() => {
  jest.restoreAllMocks();
});

// ❌ Mocking what you're testing
jest.mock('./MyComponent');
import MyComponent from './MyComponent';
// You're testing a mock, not the real component!

// ✅ Mock dependencies, not the subject
jest.mock('./api');
import MyComponent from './MyComponent'; // Real component
```
</details>

<details>
<summary>Interview talking points</summary>
**When asked about mocking:**

1. **Why mock dependencies**:
   - "Isolate component under test from external dependencies"
   - "Tests run faster without real API calls or timers"
   - "Control test scenarios including errors and edge cases"
   - "Avoid side effects like writing to databases or sending emails"

2. **Mock strategies**:
   - "Use jest.fn() for callbacks and event handlers"
   - "jest.mock() for entire modules like axios or custom modules"
   - "jest.spyOn() to track calls while keeping original implementation"
   - "Manual mocks in __mocks__ folder for complex, reusable mocks"

3. **API mocking approach**:
   - "Mock at the network boundary (fetch/axios) not in components"
   - "Use MSW (Mock Service Worker) for realistic API mocking"
   - "Define mock responses per test for flexibility"
   - "Test both success and error responses"

4. **Timer mocking**:
   - "Use jest.useFakeTimers() for debounce/throttle testing"
   - "advanceTimersByTime() for precise time control"
   - "Remember to restore real timers after each test"
   - "Critical for testing polling, animations, timeouts"

5. **Best practices**:
   - "Clear mocks in beforeEach to avoid test pollution"
   - "Mock dependencies, not the component being tested"
   - "Keep mocks simple - only what's needed for the test"
   - "Prefer integration tests with minimal mocking when possible"

6. **Common pitfalls**:
   - "Not clearing mocks between tests causes false positives/negatives"
   - "Over-mocking leads to testing implementation, not behavior"
   - "Forgetting to restore timers/spies leaks into other tests"
   - "Mocking too deep in the stack makes tests fragile"

**Example answer**: "I use mocking to isolate components from external dependencies. For API calls, I mock axios or fetch at the boundary rather than inside components, using jest.mock() to replace the module. For example, I'll mock axios.get to return specific data for each test case. I use jest.fn() for callbacks to verify they're called with correct arguments. For time-dependent code like debounce, I use jest.useFakeTimers() and advanceTimersByTime() to control time precisely. I always clear mocks in beforeEach to prevent test pollution and restore real timers/spies in afterEach. The key is mocking just enough to isolate the test, while keeping integration points realistic."
</details>

<details>
<summary>Real-world examples</summary>
**1. Mocking API with different scenarios:**

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import UserList from './UserList';

jest.mock('axios');

describe('UserList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('loads and displays users', async () => {
    const mockUsers = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ];
    
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(<UserList />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    const users = await screen.findAllByRole('listitem');
    expect(users).toHaveLength(2);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });
  
  test('displays error message on API failure', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(<UserList />);
    
    const errorMsg = await screen.findByText(/failed to load/i);
    expect(errorMsg).toBeInTheDocument();
  });
  
  test('retries on error', async () => {
    const user = userEvent.setup();
    
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(<UserList />);
    
    await screen.findByText(/failed to load/i);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    
    axios.get.mockResolvedValue({ data: [{ id: 1, name: 'John' }] });
    
    await user.click(retryButton);
    
    expect(await screen.findByText('John')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
```

**2. Mocking with MSW (Mock Service Worker):**

```javascript
// setupTests.js
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Component.test.js
import { rest } from 'msw';
import { server } from './setupTests';

test('handles server error', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );
  
  render(<UserList />);
  
  expect(await screen.findByText(/error/i)).toBeInTheDocument();
});
```

**3. Mocking React Router navigation:**

```javascript
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

import { useNavigate } from 'react-router-dom';

test('navigates to user profile on click', async () => {
  const mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
  
  const user = userEvent.setup();
  render(<UserCard userId="123" />);
  
  await user.click(screen.getByRole('button', { name: /view profile/i }));
  
  expect(mockNavigate).toHaveBeenCalledWith('/users/123');
});
```

**4. Mocking custom hooks:**

```javascript
jest.mock('./useAuth');
import { useAuth } from './useAuth';

test('displays content for authenticated user', () => {
  useAuth.mockReturnValue({
    user: { name: 'John', role: 'admin' },
    isAuthenticated: true
  });
  
  render(<Dashboard />);
  
  expect(screen.getByText('Welcome, John')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /admin panel/i })).toBeInTheDocument();
});

test('shows login prompt for unauthenticated user', () => {
  useAuth.mockReturnValue({
    user: null,
    isAuthenticated: false
  });
  
  render(<Dashboard />);
  
  expect(screen.getByText(/please log in/i)).toBeInTheDocument();
});
```

**5. Complex timer mocking with polling:**

```javascript
jest.useFakeTimers();

test('polls for updates every 5 seconds', async () => {
  const mockFetch = jest.fn()
    .mockResolvedValueOnce({ data: { status: 'processing' } })
    .mockResolvedValueOnce({ data: { status: 'processing' } })
    .mockResolvedValueOnce({ data: { status: 'complete' } });
  
  global.fetch = mockFetch;
  
  render(<StatusChecker jobId="123" />);
  
  // Initial call
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
  
  expect(screen.getByText(/processing/i)).toBeInTheDocument();
  
  // First poll after 5 seconds
  act(() => {
    jest.advanceTimersByTime(5000);
  });
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
  
  // Second poll after another 5 seconds
  act(() => {
    jest.advanceTimersByTime(5000);
  });
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
  
  expect(await screen.findByText(/complete/i)).toBeInTheDocument();
});

afterEach(() => {
  jest.useRealTimers();
});
```

**6. Mocking window methods:**

```javascript
test('copies text to clipboard', async () => {
  const mockWriteText = jest.fn();
  Object.assign(navigator, {
    clipboard: {
      writeText: mockWriteText
    }
  });
  
  const user = userEvent.setup();
  render(<CopyButton text="Hello World" />);
  
  await user.click(screen.getByRole('button', { name: /copy/i }));
  
  expect(mockWriteText).toHaveBeenCalledWith('Hello World');
  expect(screen.getByText(/copied/i)).toBeInTheDocument();
});

test('prompts for geolocation', () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn()
  };
  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });
  
  render(<LocationButton />);
  
  expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
});
```

**7. Mocking environment variables:**

```javascript
const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});

afterAll(() => {
  process.env = OLD_ENV;
});

test('uses API URL from environment', () => {
  process.env.REACT_APP_API_URL = 'https://test.api.com';
  
  // Re-import to get new env value
  const { getApiUrl } = require('./config');
  
  expect(getApiUrl()).toBe('https://test.api.com');
});
```
</details>
