# Jest and React Testing Library

## ⚡ Quick Revision

- **Jest:** JavaScript testing framework - test runner, assertion library, mocking utilities
- **React Testing Library (RTL):** Tests React components from user perspective
- Philosophy: "Test what users see, not implementation details"
- Query priority: getByRole > getByLabelText > getByPlaceholderText > getByText > getByTestId

**Core concepts:**
- Queries: get (throw), query (null), find (async)
- User interactions: fireEvent vs userEvent (preferred)
- Assertions: expect with jest matchers
- Async testing: waitFor, findBy queries

```javascript
// Basic component test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

test('button handles click', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  // Query by role (accessible)
  const button = screen.getByRole('button', { name: /click me/i });
  
  // User interaction
  await userEvent.click(button);
  
  // Assertion
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

**Common queries:**

```javascript
// By role (most accessible)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });
screen.getByRole('heading', { level: 1 });

// By label (forms)
screen.getByLabelText(/email address/i);

// By placeholder
screen.getByPlaceholderText(/enter email/i);

// By text content
screen.getByText(/welcome back/i);

// By test ID (last resort)
screen.getByTestId('user-profile');

// Async queries
const element = await screen.findByText(/loaded/i);
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// Query variants
getBy... // Throws if not found
queryBy... // Returns null if not found
findBy... // Async, returns Promise
```

**Assertions:**

```javascript
// Existence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Content
expect(element).toHaveTextContent(/hello/i);
expect(input).toHaveValue('test@example.com');
expect(checkbox).toBeChecked();

// Attributes
expect(button).toBeDisabled();
expect(link).toHaveAttribute('href', '/home');
expect(element).toHaveClass('active');

// Form elements
expect(select).toHaveDisplayValue('Option 1');
expect(input).toHaveFocus();
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Jest and React Testing Library emerged to solve critical testing challenges:

1. **Jest**: All-in-one testing solution
   - Combines test runner, assertion library, and mocking
   - Fast parallel execution with isolated test environments
   - Built-in code coverage and snapshot testing
   - Created by Facebook for JavaScript ecosystem

2. **React Testing Library (RTL)**: User-centric testing philosophy
   - Replaces Enzyme's implementation-focused approach
   - Tests components as users interact with them
   - Encourages accessible markup (ARIA roles)
   - Prevents brittle tests tied to implementation details
   - Forces testing behavior, not internal state

**Core philosophy difference:**

```javascript
// ❌ Enzyme (implementation-focused)
const wrapper = shallow(<Counter />);
wrapper.find('button').simulate('click');
expect(wrapper.state('count')).toBe(1); // Tests internal state

// ✅ RTL (user-focused)
render(<Counter />);
await userEvent.click(screen.getByRole('button'));
expect(screen.getByText('Count: 1')).toBeInTheDocument(); // Tests rendered output
```

This approach leads to:
- Tests that survive refactoring
- Better accessibility by default
- Tests that catch real user-facing bugs
- Closer alignment with actual user experience
</details>

<details>
<summary>How it works</summary>
**Jest architecture:**
1. **Test runner**: Discovers and executes test files (`*.test.js`, `*.spec.js`)
2. **JSDOM**: Simulates browser environment in Node.js
3. **Assertion library**: `expect()` API with matchers
4. **Mocking system**: Mock functions, modules, timers
5. **Code coverage**: Istanbul integration via `--coverage`

```javascript
// Jest lifecycle hooks
beforeAll(() => {
  // Runs once before all tests in file
});

beforeEach(() => {
  // Runs before each test
});

afterEach(() => {
  // Runs after each test - cleanup
});

afterAll(() => {
  // Runs once after all tests
});

describe('Component', () => {
  test('case 1', () => { /* ... */ });
  test('case 2', () => { /* ... */ });
});
```

**RTL rendering process:**

```javascript
const { container, rerender, unmount, debug } = render(<Component />);

// container: DOM node containing rendered component
// rerender: Update props without remounting
// unmount: Trigger cleanup/useEffect cleanup
// debug: Print DOM tree
```

**Query resolution:**

```javascript
// Priority order (per Testing Library docs):
// 1. getByRole - queries by ARIA role (most accessible)
screen.getByRole('button', { name: /submit/i });

// 2. getByLabelText - forms with labels
screen.getByLabelText(/email/i);

// 3. getByPlaceholderText - if no label
screen.getByPlaceholderText(/search/i);

// 4. getByText - non-interactive elements
screen.getByText(/welcome/i);

// 5. getByDisplayValue - form elements by current value
screen.getByDisplayValue('john@example.com');

// 6. getByAltText - images
screen.getByAltText(/profile picture/i);

// 7. getByTitle - title attribute or SVG titles
screen.getByTitle(/tooltip/i);

// 8. getByTestId - last resort (not user-facing)
screen.getByTestId('custom-element');
```

**Query variants mechanism:**

```javascript
// getBy: Throws if not found or multiple found
const button = screen.getByRole('button'); // Error if 0 or 2+

// queryBy: Returns null if not found
const button = screen.queryByRole('button'); // null if not found
if (!button) { /* handle absence */ }

// findBy: Async, polls until found or timeout
const button = await screen.findByRole('button'); // Returns Promise
// Default timeout: 1000ms, polls every 50ms
```

**Async testing mechanics:**

```javascript
// findBy - preferred for single element
const element = await screen.findByText(/loaded/i);

// waitFor - complex conditions
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
}, { timeout: 3000 });

// waitForElementToBeRemoved
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

// act() - RTL wraps automatically, manual for edge cases
import { act } from '@testing-library/react';
await act(async () => {
  // state updates
});
```
</details>

<details>
<summary>Common patterns and gotchas</summary>
**1. Testing async data fetching:**

```javascript
import { render, screen, waitFor } from '@testing-library/react';

test('loads and displays user data', async () => {
  // Mock API call
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ({ name: 'John Doe' })
  });
  
  render(<UserProfile userId="123" />);
  
  // Loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for data to load
  const userName = await screen.findByText('John Doe');
  expect(userName).toBeInTheDocument();
  
  // Loading state should be gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

**2. Testing forms:**

```javascript
test('submits form with user input', async () => {
  const handleSubmit = jest.fn();
  const user = userEvent.setup();
  
  render(<LoginForm onSubmit={handleSubmit} />);
  
  // Fill form fields
  await user.type(
    screen.getByLabelText(/email/i),
    'test@example.com'
  );
  await user.type(
    screen.getByLabelText(/password/i),
    'password123'
  );
  
  // Submit form
  await user.click(screen.getByRole('button', { name: /login/i }));
  
  // Verify submission
  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});
```

**3. Testing conditional rendering:**

```javascript
test('shows error message on invalid input', async () => {
  const user = userEvent.setup();
  render(<EmailInput />);
  
  const input = screen.getByLabelText(/email/i);
  
  // Invalid email
  await user.type(input, 'invalid-email');
  await user.tab(); // Blur to trigger validation
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  
  // Valid email
  await user.clear(input);
  await user.type(input, 'valid@example.com');
  await user.tab();
  
  expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
});
```

**4. Testing context providers:**

```javascript
import { render, screen } from '@testing-library/react';
import { AuthContext } from './AuthContext';

test('displays user name when authenticated', () => {
  const mockUser = { name: 'John', role: 'admin' };
  
  render(
    <AuthContext.Provider value={{ user: mockUser, isAuth: true }}>
      <UserProfile />
    </AuthContext.Provider>
  );
  
  expect(screen.getByText('John')).toBeInTheDocument();
  expect(screen.getByText(/admin/i)).toBeInTheDocument();
});

// Helper for reusable wrapper
const renderWithAuth = (ui, { user = null, ...options } = {}) => {
  return render(
    <AuthContext.Provider value={{ user, isAuth: !!user }}>
      {ui}
    </AuthContext.Provider>,
    options
  );
};
```

**5. Testing hooks with renderHook:**

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';

test('useCounter increments count', () => {
  const { result } = renderHook(() => useCounter());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});

// With props
test('useCounter accepts initial value', () => {
  const { result, rerender } = renderHook(
    ({ initial }) => useCounter(initial),
    { initialProps: { initial: 10 } }
  );
  
  expect(result.current.count).toBe(10);
  
  // Update props
  rerender({ initial: 20 });
  expect(result.current.count).toBe(20);
});
```

**Common gotchas:**

```javascript
// ❌ Don't use waitFor for simple queries
await waitFor(() => screen.getByText(/hello/i)); // Unnecessary

// ✅ Use findBy instead
await screen.findByText(/hello/i);

// ❌ Don't use getBy in waitFor (throws immediately)
await waitFor(() => {
  screen.getByText(/hello/i); // Throws on first poll if not found
});

// ✅ Use queryBy for assertions
await waitFor(() => {
  expect(screen.queryByText(/hello/i)).toBeInTheDocument();
});

// ❌ Don't query on container
const { container } = render(<Component />);
container.querySelector('.my-class'); // Not recommended

// ✅ Use screen queries
screen.getByRole('button');

// ❌ Avoid testing implementation details
expect(component.state.count).toBe(1); // Internal state

// ✅ Test rendered output
expect(screen.getByText('Count: 1')).toBeInTheDocument();

// ❌ Don't use indices for multiple elements
const buttons = screen.getAllByRole('button');
fireEvent.click(buttons[0]); // Fragile

// ✅ Use specific queries
screen.getByRole('button', { name: /submit/i });
```

**userEvent vs fireEvent:**

```javascript
// ❌ fireEvent - lower level, doesn't simulate full interaction
fireEvent.click(button); // Just triggers click event

// ✅ userEvent - simulates real user behavior
await userEvent.click(button); 
// Moves mouse, mousedown, focus, mouseup, click

// userEvent.setup() for better control
const user = userEvent.setup();
await user.type(input, 'hello');
await user.keyboard('{Enter}');
await user.selectOptions(select, 'option1');
```
</details>

<details>
<summary>Interview talking points</summary>
**When asked about Jest and RTL:**

1. **Why RTL over Enzyme**:
   - "RTL encourages testing from user perspective, not implementation"
   - "Tests survive refactoring because they don't rely on internal state"
   - "Forces accessible markup by using roles and labels"
   - "Enzyme tests often broke when refactoring, even with same behavior"

2. **Query selection strategy**:
   - "I follow RTL's query priority: start with getByRole"
   - "getByRole('button', \{ name: /submit/i \}) is most accessible"
   - "getByTestId only as last resort when no accessible query works"
   - "This approach ensures components are accessible to screen readers"

3. **Async testing approach**:
   - "Use findBy queries for single elements appearing asynchronously"
   - "waitFor for complex conditions or multiple assertions"
   - "Always use await with async queries to avoid test flakiness"
   - "Set appropriate timeouts for slow operations"

4. **Common patterns**:
   - "Setup reusable render wrappers for providers (Router, Redux, Theme)"
   - "Use userEvent over fireEvent for realistic user interactions"
   - "Mock API calls at fetch/axios level, not in components"
   - "Use beforeEach for test isolation, cleanup happens automatically"

5. **Best practices**:
   - "Write tests before or alongside implementation (TDD)"
   - "One logical assertion per test for clarity"
   - "Use screen instead of destructuring render result"
   - "Avoid testing implementation details (state, props, method names)"

6. **Coverage considerations**:
   - "Aim for high coverage but focus on critical paths first"
   - "100% coverage doesn't mean bug-free code"
   - "Cover edge cases, error states, and user flows"
   - "Snapshot tests for preventing unintended UI changes"

**Example answer**: "I use RTL because it tests what users actually experience, not implementation details. For example, instead of testing if a state variable updates, I test if the UI renders correctly after an action. I follow the query priority—getByRole for accessible elements, falling back to getByText, and using getByTestId only when necessary. For async operations like API calls, I use findBy queries or waitFor. I also use userEvent instead of fireEvent because it simulates real user interactions more accurately, like typing with proper keyboard events. This approach makes tests more reliable and maintainable."
</details>

<details>
<summary>Real-world examples</summary>
**1. Complete component test:**

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();
  
  beforeEach(() => {
    mockOnSearch.mockClear();
  });
  
  test('renders search input and button', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });
  
  test('calls onSearch with input value on submit', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'react testing');
    await user.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledWith('react testing');
  });
  
  test('clears input after search', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} clearOnSubmit />);
    
    const input = screen.getByPlaceholderText(/search/i);
    
    await user.type(input, 'test query');
    await user.keyboard('{Enter}');
    
    expect(input).toHaveValue('');
  });
  
  test('disables button when input is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeDisabled();
  });
  
  test('enables button when input has value', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'test');
    expect(button).toBeEnabled();
  });
});
```

**2. Testing with React Router:**

```javascript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Navigation from './Navigation';

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

test('navigates to profile on link click', async () => {
  const user = userEvent.setup();
  renderWithRouter(<Navigation />);
  
  const profileLink = screen.getByRole('link', { name: /profile/i });
  await user.click(profileLink);
  
  expect(window.location.pathname).toBe('/profile');
});
```

**3. Testing with Redux:**

```javascript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import UserProfile from './UserProfile';

function renderWithRedux(
  ui,
  {
    preloadedState = {},
    store = configureStore({ reducer: { user: userReducer }, preloadedState }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

test('displays user from Redux store', () => {
  const preloadedState = {
    user: { name: 'John Doe', email: 'john@example.com' }
  };
  
  renderWithRedux(<UserProfile />, { preloadedState });
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

**4. Snapshot testing:**

```javascript
import { render } from '@testing-library/react';
import Button from './Button';

test('matches snapshot', () => {
  const { container } = render(<Button variant="primary">Click me</Button>);
  expect(container.firstChild).toMatchSnapshot();
});

// Update snapshots: jest --updateSnapshot
```

**5. Testing error boundaries:**

```javascript
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('displays fallback UI on error', () => {
  // Suppress console.error for this test
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
  render(
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  
  spy.mockRestore();
});
```

**6. Testing custom hooks:**

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import useFetch from './useFetch';

test('useFetch loads data', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: 'test' })
    })
  );
  
  const { result } = renderHook(() => useFetch('/api/data'));
  
  expect(result.current.loading).toBe(true);
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.data).toEqual({ data: 'test' });
  expect(result.current.error).toBeNull();
});
```
</details>
