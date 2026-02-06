# End-to-End (E2E) Testing

## ⚡ Quick Revision

- **E2E testing:** Testing complete application flows in real browser environment
- Tests entire stack: frontend, backend, database, external services
- Highest confidence but slowest and most expensive to maintain
- **Cypress vs Playwright:** Modern E2E frameworks, different trade-offs
- Use for critical user journeys, not everything

**Core concepts:**
- Real browser automation (Chrome, Firefox, Safari)
- Test production-like environment
- Verify integrations work together
- Catch bugs unit/integration tests miss
- Run on CI/CD before deployment

```javascript
// Cypress example
describe('Login flow', () => {
  it('logs in user successfully', () => {
    cy.visit('https://app.example.com/login');
    
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('SecurePass123!');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });
});

// Playwright example
import { test, expect } from '@playwright/test';

test('logs in user successfully', async ({ page }) => {
  await page.goto('https://app.example.com/login');
  
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('text=Welcome back')).toBeVisible();
});
```

**When to use E2E:**
- Critical user journeys (signup, checkout, payment)
- Cross-browser compatibility verification
- Integration with real backend APIs
- Third-party integrations (payment gateways, OAuth)
- Visual regression testing
- Performance testing (page load, interaction timing)

**When NOT to use:**
- Testing every feature (too slow/expensive)
- Unit-testable logic
- Edge cases better covered by unit tests
- Rapid feedback during development

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
E2E tests provide the highest confidence that applications work as users experience them:

1. **Tests the entire system**:
   - Frontend + Backend + Database + External services
   - Real browser environment, not JSDOM simulation
   - Actual network requests, no mocks
   - Real user interactions (mouse, keyboard, touch)

2. **Catches integration failures**:
   - API contract mismatches
   - CORS issues
   - Authentication flows
   - Third-party service integrations
   - Browser-specific bugs

3. **Business-critical validation**:
   - Payment processing works
   - User can complete signup
   - Data persists across sessions
   - Emails/notifications sent

4. **Confidence for deployment**:
   - Final check before production
   - Smoke tests after deployment
   - Regression detection

**Testing pyramid revisited:**

```
        /\
       /E2E\      <- 10-20% (critical paths)
      /------\
     / Integ  \   <- 20-30% (workflows)
    /----------\
   /   Unit     \ <- 50-70% (logic, components)
  /--------------\
```

**Cost vs. Value:**

| Aspect | Unit | Integration | E2E |
|--------|------|-------------|-----|
| Speed | Fast (ms) | Medium (100ms) | Slow (seconds) |
| Stability | Very stable | Stable | Flaky |
| Maintenance | Low | Medium | High |
| Confidence | Low | Medium | High |
| Debug ease | Easy | Medium | Hard |

**When E2E is essential:**
- Payment/checkout flows
- User registration and authentication
- Critical business workflows
- Multi-step forms with persistence
- Real-time features (chat, notifications)
- Cross-browser compatibility
</details>

<details>
<summary>How it works</summary>
**E2E test execution flow:**

1. **Test runner starts**:
   - Launches real browser(s)
   - Navigates to application URL
   - Injects test scripts

2. **Browser automation**:
   - Finds elements via selectors
   - Simulates user actions (click, type, scroll)
   - Waits for elements/network/animations
   - Takes screenshots/videos

3. **Assertions**:
   - Verify DOM state
   - Check URL/navigation
   - Validate network responses
   - Compare screenshots (visual regression)

4. **Cleanup**:
   - Close browsers
   - Clean test data
   - Report results

**Cypress architecture:**

```
Node Process (Test Runner)
    ↓
Cypress App (Electron/Chrome)
    ↓
Your App (iframe) ← Test code runs in same loop
    ↓
Same origin, direct DOM access
```

**Unique Cypress features:**
- Runs in same event loop as app (no network lag)
- Automatic waiting (no explicit sleep)
- Time travel debugging (DOM snapshots)
- Network stubbing built-in
- Real-time reloading during development

**Playwright architecture:**

```
Node Process (Test Runner)
    ↓
Playwright Server
    ↓
Browser (Chrome/Firefox/Safari) via CDP/WebDriver
    ↓
Your App (real page)
```

**Unique Playwright features:**
- Multi-browser (Chromium, Firefox, WebKit)
- Multi-tab/context support
- Mobile emulation
- Network interception
- Parallel execution
- Auto-wait for elements

**Element selection strategies:**

```javascript
// By test ID (best - resilient to UI changes)
cy.get('[data-testid="submit-button"]')
page.locator('[data-testid="submit-button"]')

// By role (accessible)
cy.findByRole('button', { name: /submit/i })
page.getByRole('button', { name: /submit/i })

// By text (brittle - changes with copy)
cy.contains('Submit')
page.locator('text=Submit')

// By CSS selector (fragile - changes with styling)
cy.get('.btn-primary')
page.locator('.btn-primary')
```

**Waiting strategies:**

```javascript
// Cypress - automatic retry
cy.get('[data-testid="data"]').should('be.visible');
// Retries for 4 seconds until visible

// Playwright - auto-wait
await page.click('[data-testid="button"]');
// Waits for actionability (visible, enabled, stable)

// Explicit waits
cy.wait(1000); // ❌ Avoid fixed waits
cy.intercept('GET', '/api/data').as('getData');
cy.wait('@getData'); // ✅ Wait for specific request

await page.waitForSelector('[data-testid="data"]');
await page.waitForLoadState('networkidle');
```
</details>

<details>
<summary>Common patterns and gotchas</summary>
**1. Page Object Model (POM):**

```javascript
// pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error"]');
  }
  
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
  
  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}

// tests/login.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('valid login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  
  await expect(page).toHaveURL(/.*dashboard/);
});

test('invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'wrong');
  
  const error = await loginPage.getErrorMessage();
  expect(error).toContain('Invalid credentials');
});
```

**2. Custom commands (Cypress):**

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email"]').type(email);
  cy.get('[data-testid="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Usage in tests
describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password123');
  });
  
  it('displays user data', () => {
    cy.contains('Welcome back').should('be.visible');
  });
});
```

**3. Fixtures (Playwright):**

```javascript
// playwright.config.js
export default {
  use: {
    storageState: 'auth.json' // Reuse authentication
  }
};

// tests/auth.setup.js
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard');
  
  // Save authentication state
  await page.context().storageState({ path: 'auth.json' });
});

// All other tests start authenticated
test('dashboard test', async ({ page }) => {
  // Already logged in via auth.json
  await page.goto('/dashboard');
});
```

**4. Network interception:**

```javascript
// Cypress
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
cy.visit('/users');
cy.wait('@getUsers');
cy.get('[data-testid="user-list"]').children().should('have.length', 5);

// Modify response
cy.intercept('POST', '/api/users', (req) => {
  req.reply({
    statusCode: 201,
    body: { id: 123, ...req.body }
  });
});

// Playwright
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
  });
});

await page.goto('/users');
```

**5. File uploads:**

```javascript
// Cypress
cy.get('input[type="file"]').selectFile('cypress/fixtures/image.jpg');

// Playwright
await page.setInputFiles('input[type="file"]', 'tests/fixtures/image.jpg');

// Multiple files
await page.setInputFiles('input[type="file"]', [
  'file1.jpg',
  'file2.jpg'
]);

// From buffer
await page.setInputFiles('input[type="file"]', {
  name: 'file.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('file content')
});
```

**6. Visual regression testing:**

```javascript
// Cypress with percy
import '@percy/cypress';

it('visual test', () => {
  cy.visit('/');
  cy.percySnapshot('Homepage');
});

// Playwright built-in
test('visual test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
  
  // Element screenshot
  const element = page.locator('[data-testid="card"]');
  await expect(element).toHaveScreenshot('card.png');
});
```

**7. Mobile testing:**

```javascript
// Playwright mobile emulation
import { devices } from '@playwright/test';

const config = {
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
};

test('mobile navigation', async ({ page }) => {
  await page.goto('/');
  
  // Mobile menu
  await page.click('[data-testid="menu-icon"]');
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
});
```

**Common gotchas:**

```javascript
// ❌ Not waiting for async operations
await page.click('button');
const text = await page.textContent('.result'); // Might be stale

// ✅ Wait for element
await page.click('button');
await page.waitForSelector('.result');
const text = await page.textContent('.result');

// ❌ Fixed waits
cy.wait(3000); // Brittle, slow

// ✅ Wait for specific condition
cy.intercept('GET', '/api/data').as('getData');
cy.wait('@getData');

// ❌ Testing implementation details
cy.get('.internal-class-name'); // Breaks with refactoring

// ✅ Test user-facing attributes
cy.get('[data-testid="submit"]');
cy.findByRole('button', { name: /submit/i });

// ❌ Flaky selectors
cy.get('div > div > span'); // Fragile

// ✅ Stable selectors
cy.get('[data-testid="user-name"]');

// ❌ Not cleaning up test data
test('create user', async ({ page }) => {
  // Creates user in real database
  // Never cleaned up!
});

// ✅ Clean up after test
test('create user', async ({ page }) => {
  const userId = await createUser();
  // Test logic...
  await deleteUser(userId);
});

// ❌ Running all tests serially
// Takes forever

// ✅ Parallel execution
// playwright.config.js
export default {
  workers: 4 // Run 4 tests in parallel
};
```

**Cypress vs Playwright decision matrix:**

| Use Cypress when: | Use Playwright when: |
|-------------------|---------------------|
| Single browser (Chrome) sufficient | Need multi-browser testing |
| Team familiar with jQuery syntax | Team prefers modern async/await |
| Need time-travel debugging | Need parallel execution speed |
| Web-only testing | Need mobile emulation |
| Prefer all-in-one solution | Need fine-grained control |
| Simpler setup for small team | Large test suite needing speed |
</details>

<details>
<summary>Interview talking points</summary>
**When asked about E2E testing:**

1. **Purpose and scope**:
   - "E2E tests verify the entire application flow in a real browser"
   - "Tests critical user journeys: signup, login, checkout, payment"
   - "Highest confidence but slowest, so use strategically"
   - "10-20% of test suite should be E2E, focusing on business-critical paths"

2. **Cypress vs Playwright**:
   - "Cypress: Great developer experience, time-travel debugging, easier setup"
   - "Playwright: Better performance, multi-browser, parallel execution"
   - "Cypress runs in app's event loop (same origin), Playwright uses CDP"
   - "Choose Cypress for simpler projects, Playwright for scale and speed"

3. **Best practices**:
   - "Use data-testid for stable selectors, not CSS classes"
   - "Implement Page Object Model for maintainability"
   - "Never use fixed waits (cy.wait(3000)), wait for specific conditions"
   - "Intercept network requests for consistent test data"
   - "Run in CI/CD pipeline before deployment"

4. **Common challenges**:
   - "Flakiness from timing issues - use proper waits"
   - "Slow execution - run critical tests only, parallelize"
   - "Maintenance burden - keep tests focused and use POM"
   - "Test data management - use fixtures or seed data"

5. **When to use E2E**:
   - "Critical business flows that must work (payment, signup)"
   - "Integration with external services (OAuth, payment gateways)"
   - "Cross-browser compatibility validation"
   - "Visual regression testing"
   - **Not** for every feature or edge case (unit tests better)

6. **Integration with development**:
   - "Run smoke tests after every deployment"
   - "Full E2E suite nightly or pre-release"
   - "Use for regression detection"
   - "Complement with integration tests for faster feedback"

**Example answer**: "E2E tests verify complete user flows in real browsers. I use them for business-critical paths like checkout, payment, and authentication. I prefer Playwright for multi-browser support and parallel execution, though Cypress is great for smaller projects with its time-travel debugging. I implement Page Object Model to keep tests maintainable and use data-testid attributes for stable selectors. Key is using E2E strategically—maybe 10-20% of tests—because they're slow and can be flaky. I run smoke tests on every deploy and full E2E suite nightly. For faster feedback during development, I rely more on integration tests."
</details>

<details>
<summary>Real-world examples</summary>
**1. E-commerce checkout (Playwright):**

```javascript
import { test, expect } from '@playwright/test';

test.describe('E-commerce checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://shop.example.com');
  });
  
  test('complete purchase flow', async ({ page }) => {
    // Search for product
    await page.fill('[data-testid="search"]', 'wireless headphones');
    await page.press('[data-testid="search"]', 'Enter');
    
    // Wait for results
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click first product
    await page.click('[data-testid="product-card"]:first-child');
    
    // Product detail page
    await expect(page.locator('h1')).toBeVisible();
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart badge updated
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    const total = await page.locator('[data-testid="cart-total"]').textContent();
    expect(parseFloat(total.replace('$', ''))).toBeGreaterThan(0);
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Fill shipping info
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'New York');
    await page.selectOption('[name="state"]', 'NY');
    await page.fill('[name="zip"]', '10001');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Fill payment info (test mode)
    await page.fill('[name="cardNumber"]', '4111111111111111');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvv"]', '123');
    await page.fill('[name="nameOnCard"]', 'John Doe');
    
    // Place order
    await page.click('[data-testid="place-order"]');
    
    // Wait for order confirmation
    await page.waitForURL('**/order-confirmation/**');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    
    // Verify order details
    const orderNumber = await page.locator('[data-testid="order-number"]').textContent();
    expect(orderNumber).toMatch(/ORDER-\d+/);
    
    // Verify email displayed
    await expect(page.locator('text=john@example.com')).toBeVisible();
  });
  
  test('handles payment failure', async ({ page, context }) => {
    // Intercept payment request to simulate failure
    await context.route('**/api/payments', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Card declined' })
      });
    });
    
    // Go through checkout flow (abbreviated)
    await page.goto('/checkout');
    
    // Fill payment info
    await page.fill('[name="cardNumber"]', '4000000000000002'); // Test decline
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvv"]', '123');
    
    // Attempt to place order
    await page.click('[data-testid="place-order"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Card declined');
    
    // Still on checkout page
    await expect(page).toHaveURL(/.*checkout/);
  });
});
```

**2. Authentication flow (Cypress):**

```javascript
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('https://app.example.com');
  });
  
  it('registers new user', () => {
    cy.findByRole('link', { name: /sign up/i }).click();
    
    // Registration form
    cy.url().should('include', '/register');
    
    cy.get('[data-testid="name"]').type('John Doe');
    cy.get('[data-testid="email"]').type(`user${Date.now()}@example.com`);
    cy.get('[data-testid="password"]').type('SecurePass123!');
    cy.get('[data-testid="confirm-password"]').type('SecurePass123!');
    
    // Agree to terms
    cy.get('[data-testid="terms-checkbox"]').check();
    
    // Submit
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, John Doe').should('be.visible');
    
    // Verify user menu
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Profile').should('be.visible');
    cy.contains('Settings').should('be.visible');
    cy.contains('Logout').should('be.visible');
  });
  
  it('logs in existing user', () => {
    cy.findByRole('link', { name: /login/i }).click();
    
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });
  
  it('handles invalid credentials', () => {
    cy.findByRole('link', { name: /login/i }).click();
    
    cy.get('[data-testid="email"]').type('invalid@example.com');
    cy.get('[data-testid="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Error message displayed
    cy.get('[data-testid="error"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
    
    // Still on login page
    cy.url().should('include', '/login');
  });
  
  it('persists authentication across page reload', () => {
    // Login
    cy.login('user@example.com', 'password123'); // Custom command
    
    // Verify logged in
    cy.contains('Welcome back').should('be.visible');
    
    // Reload page
    cy.reload();
    
    // Still logged in
    cy.contains('Welcome back').should('be.visible');
    cy.url().should('include', '/dashboard');
  });
  
  it('logs out user', () => {
    cy.login('user@example.com', 'password123');
    
    // Logout
    cy.get('[data-testid="user-menu"]').click();
    cy.findByRole('button', { name: /logout/i }).click();
    
    // Redirected to home
    cy.url().should('not.include', '/dashboard');
    cy.findByRole('link', { name: /login/i }).should('be.visible');
  });
});
```

**3. Multi-step form with validation (Playwright):**

```javascript
test('job application form', async ({ page }) => {
  await page.goto('/careers/apply');
  
  // Step 1: Personal Information
  await page.fill('[name="firstName"]', 'Jane');
  await page.fill('[name="lastName"]', 'Smith');
  await page.fill('[name="email"]', 'jane@example.com');
  await page.fill('[name="phone"]', '555-0123');
  
  await page.click('button:has-text("Next")');
  
  // Step 2: Experience
  await page.fill('[name="currentCompany"]', 'Tech Corp');
  await page.fill('[name="currentTitle"]', 'Senior Developer');
  await page.fill('[name="yearsExperience"]', '5');
  
  // Upload resume
  await page.setInputFiles('[data-testid="resume-upload"]', 'tests/fixtures/resume.pdf');
  
  // Wait for upload to complete
  await expect(page.locator('text=resume.pdf')).toBeVisible();
  
  await page.click('button:has-text("Next")');
  
  // Step 3: Skills
  await page.click('[data-testid="skill-javascript"]');
  await page.click('[data-testid="skill-react"]');
  await page.click('[data-testid="skill-nodejs"]');
  
  await page.fill('[data-testid="cover-letter"]', 
    'I am excited to apply for this position...');
  
  // Review step
  await page.click('button:has-text("Review")');
  
  // Verify all info displayed
  await expect(page.locator('text=Jane Smith')).toBeVisible();
  await expect(page.locator('text=jane@example.com')).toBeVisible();
  await expect(page.locator('text=Tech Corp')).toBeVisible();
  await expect(page.locator('text=JavaScript, React, Node.js')).toBeVisible();
  
  // Submit
  await page.click('button:has-text("Submit Application")');
  
  // Success message
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page.locator('text=Application received')).toBeVisible();
});
```

**4. Real-time collaboration (Cypress):**

```javascript
describe('Real-time document editor', () => {
  it('shows updates from other users', () => {
    // Stub WebSocket connection
    cy.visit('/documents/123', {
      onBeforeLoad(win) {
        cy.stub(win, 'WebSocket').callsFake(function() {
          this.send = cy.stub();
          this.close = cy.stub();
          
          // Simulate receiving update from another user
          setTimeout(() => {
            const event = new MessageEvent('message', {
              data: JSON.stringify({
                type: 'update',
                user: 'Jane Doe',
                content: 'Jane\'s edit'
              })
            });
            this.onmessage(event);
          }, 1000);
          
          return this;
        });
      }
    });
    
    // Wait for document to load
    cy.get('[data-testid="editor"]').should('be.visible');
    
    // Verify update from Jane appears
    cy.contains('Jane\'s edit', { timeout: 2000 }).should('be.visible');
    cy.get('[data-testid="active-users"]').should('contain', 'Jane Doe');
  });
});
```

**5. Mobile responsive testing (Playwright):**

```javascript
import { test, devices } from '@playwright/test';

const mobileConfig = devices['iPhone 12'];

test.use(mobileConfig);

test('mobile navigation', async ({ page }) => {
  await page.goto('/');
  
  // Mobile menu initially hidden
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeHidden();
  
  // Open mobile menu
  await page.click('[data-testid="hamburger-icon"]');
  
  // Menu slides in
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  
  // Navigate to page
  await page.click('[data-testid="mobile-menu"] >> text=Products');
  
  // Verify navigation
  await expect(page).toHaveURL(/.*products/);
  
  // Menu closes after navigation
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeHidden();
});

test('mobile form interaction', async ({ page }) => {
  await page.goto('/contact');
  
  // Scroll to form
  await page.locator('[data-testid="contact-form"]').scrollIntoViewIfNeeded();
  
  // Mobile keyboard interactions
  await page.fill('[name="email"]', 'test@example.com');
  await page.press('[name="email"]', 'Enter'); // Next field
  
  await page.fill('[name="message"]', 'Test message');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Success message
  await expect(page.locator('text=Message sent')).toBeVisible();
});
```
</details>
