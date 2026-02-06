# Layouts

## ⚡ Quick Revision
- **Root Layout**: Required `app/layout.tsx`, wraps all pages
- **Nested Layouts**: Layouts inherit from parent layouts
- **Route Groups**: Use `(folder)` to organize layouts without affecting URLs
- **Templates**: Re-render on navigation, unlike layouts which persist
- **Metadata API**: Define SEO metadata in layouts and pages
- **Loading UI**: Special `loading.tsx` files for route-level loading states

```javascript
// Root Layout (required)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// Nested Layout
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// Template (re-renders)
export default function Template({ children }) {
  return <div className="template">{children}</div>;
}

// Metadata in layouts
export const metadata = {
  title: {
    template: '%s | MyApp',
    default: 'MyApp'
  },
  description: 'My amazing application'
};
```

**Common Pitfalls:**
- Forgetting required `<html>` and `<body>` tags in root layout
- Not understanding layout persistence vs template re-rendering
- Metadata not cascading properly in nested layouts

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Layout Persistence:**
- Avoid re-rendering common UI elements during navigation
- Maintain state in layouts (like sidebar expansion)
- Better performance by not recreating layout components

**SEO and Metadata Management:**
- Centralized metadata management for different sections
- Dynamic metadata based on route parameters
- Proper head tag management for social media sharing

**Code Organization:**
- Co-locate layout-specific components with routes
- Separate concerns between global and section-specific layouts
- Better maintainability for large applications
</details>

<details>
<summary>How it works</summary>
**Layout Hierarchy:**
```
app/
├── layout.tsx          // Root Layout (applies to all)
├── page.tsx           // Home page
├── dashboard/
│   ├── layout.tsx     // Dashboard Layout
│   ├── page.tsx       // /dashboard
│   └── settings/
│       ├── layout.tsx // Settings Layout  
│       └── page.tsx   // /dashboard/settings
```

**Layout Composition:**
```javascript
// Root Layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GlobalHeader />
        {children} {/* Dashboard Layout */}
        <GlobalFooter />
      </body>
    </html>
  );
}

// Dashboard Layout  
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <DashboardNav />
      {children} {/* Settings Layout */}
    </div>
  );
}

// Settings Layout
export default function SettingsLayout({ children }) {
  return (
    <div className="settings">
      <SettingsSidebar />
      {children} {/* Actual page */}
    </div>
  );
}
```

**Metadata Cascade:**
```javascript
// Root layout metadata
export const metadata = {
  title: {
    template: '%s | Company',
    default: 'Company'
  }
};

// Page-specific metadata
export const metadata = {
  title: 'Dashboard', // Becomes "Dashboard | Company"
  description: 'User dashboard'
};

// Dynamic metadata
export async function generateMetadata({ params }) {
  const user = await fetchUser(params.id);
  return {
    title: `${user.name}'s Profile`,
    description: `Profile page for ${user.name}`
  };
}
```

**Route Groups for Multiple Layouts:**
```
app/
├── layout.tsx              // Root layout
├── (marketing)/           // Route group
│   ├── layout.tsx         // Marketing layout
│   ├── about/
│   └── contact/
├── (shop)/               // Different layout
│   ├── layout.tsx        // Shop layout
│   ├── products/
│   └── cart/
└── dashboard/            // No group, uses root layout
```
</details>

<details>
<summary>Common misconceptions</summary>
**"Layouts re-render on navigation"**
- Layouts persist and maintain state during navigation
- Use templates if you need re-rendering behavior

**"You need a layout for every route"**
- Layouts are optional except for root layout
- Child routes inherit parent layouts automatically

**"Metadata only works in pages"**
- Layouts can also export metadata
- Metadata cascades from layouts to pages

**"Route groups affect URLs"**
- Route groups are organizational only
- They don't create URL segments
</details>

<details>
<summary>Interview angle</summary>
**Architecture Questions:**
- "How do you structure layouts for a multi-tenant application?"
- "When would you use templates instead of layouts?"
- "How do you handle authentication state in layouts?"

**Performance Considerations:**
- Layout persistence benefits and trade-offs
- When to split layouts vs combine them
- Impact of heavy components in layouts

**Real-world Scenarios:**
```javascript
// Multi-tenant layout structure
app/
├── layout.tsx                    // Global layout
├── (tenant-a)/
│   ├── layout.tsx               // Tenant A branding
│   └── dashboard/
├── (tenant-b)/
│   ├── layout.tsx               // Tenant B branding
│   └── dashboard/

// Layout with authentication
export default function ProtectedLayout({ children }) {
  return (
    <AuthProvider>
      <div className="protected-area">
        <AuthenticatedHeader />
        <Suspense fallback={<LayoutSkeleton />}>
          {children}
        </Suspense>
      </div>
    </AuthProvider>
  );
}

// Dynamic layout based on user role
export default async function RoleBasedLayout({ children }) {
  const session = await getServerSession();
  const Layout = session.user.role === 'admin' ? AdminLayout : UserLayout;
  
  return <Layout>{children}</Layout>;
}
```

**SEO and Metadata Strategy:**
- Dynamic metadata generation for product pages
- Social media meta tag optimization
- Handling metadata for internationalization
</details>