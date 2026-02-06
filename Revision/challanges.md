## 🧩 Case Study 1: Implementing a Monorepo with Nx

### **Challenge**

We had multiple front-end applications — each representing a different product module — all sharing common utilities, UI components, and business logic.
Over time, managing these shared packages through **private npm registries** became painful:

- Version mismatches between apps.
- CI/CD pipelines had to build and publish shared packages frequently.
- Bug fixes required multiple package updates and deployments.
- Developers spent time syncing dependencies across projects.

We needed **a unified setup** that could enforce boundaries, manage dependencies intelligently, and speed up builds.

---

### **Context / Why Nx over Shared npm Packages**

Initially, we tried using a shared UI library as a private npm package (using Verdaccio + manual publishing).
However:

- Every small change (say, a color update in the design system) required publishing a new version and updating all consuming apps.
- Version drift led to inconsistent UI across environments.
- Local development was slow since linking packages via `npm link` was unreliable.
- No visibility on _which apps_ were affected by a change.

So, instead of manually maintaining versioned shared packages, **Nx offered a monorepo approach** where:

- All applications and libraries coexist in one repository.
- Nx automatically detects _affected projects_ and runs builds only for them.
- We could **enforce module boundaries** (e.g., `auth` lib cannot import from `device` lib).
- Code sharing became instant — no publish/install cycle.

---

### **Decision**

We chose **Nx** over alternatives like Lerna or Turborepo because:

- Nx has **smart caching** and **dependency graph visualization**.
- Strong **TypeScript integration** for large codebases.
- Built-in **workspace generators** to scaffold consistent code (apps, libs, components).
- Out-of-the-box support for **React + Next.js**.
- Great **affected command** (`nx affected:test/build/lint`) to optimize CI.

---

### **Implementation**

1. **Monorepo Setup**

   - Created a new Nx workspace (`npx create-nx-workspace`).
   - Migrated existing apps into `apps/` and shared logic into `libs/`.
   - Defined clear library categories:

     - `ui/` – shared design system components
     - `utils/` – helper functions
     - `hooks/` – shared React hooks
     - `api/` – centralized API service using Axios/React Query

2. **Enforced Boundaries**

   - Used Nx’s `eslint-plugin-boundaries` to restrict cross-library imports.
   - Configured `nx.json` and `project.json` for clear dependency mapping.

3. **CI/CD Optimization**

   - Integrated Nx in GitHub Actions:

     ```
     nx affected:build --base=origin/main --head=HEAD
     ```

     Only builds apps that are impacted by changes.

   - Caching reduced build times by 70–80%.

4. **Developer Experience**

   - Added generators for scaffolding (`nx g @nrwl/react:component`).
   - Unified linting, formatting, and testing setup across all projects.

---

### **Result**

- Reduced CI time from ~18 mins to ~6 mins.
- No more manual package publishing — changes reflected instantly.
- Better code reuse across apps (UI + logic).
- Consistent linting and test standards across teams.
- Easier onboarding — new devs just `git clone` and start.

---

### **Key Learning**

- **Nx enforces boundaries** and consistency across large codebases — much better for fast-moving orgs than shared npm packages.
- Monorepo works best when teams share ownership and use proper lint/test automation.
- Shared npm packages are still good for external open-source distribution — but for _internal app ecosystems_, monorepo wins for velocity and simplicity.

---

## 🧩 Case Study 2: Designing Audit Logging with Splunk Integration

### **Challenge**

We needed **end-to-end traceability** of all admin and system activities in our management dashboard —
for example:

- Who changed device configurations?
- When was a record deleted or modified?
- What exact payload was updated?

Before implementation, we only logged errors to the console or Sentry. There was **no visibility** into legitimate user actions or business-level events.

---

### **Context / Why Splunk**

We considered simple approaches:

- Log actions to a database collection.
- Push logs to a flat file or third-party service.

However, those were limited:

- Querying text logs wasn’t scalable.
- No visual dashboards or alerts.

Splunk offered:

- Centralized **log aggregation**.
- **Real-time search and dashboards** for audit compliance.
- Integrations with security and alerting systems.

Thus, we integrated **Splunk logging** for all business-critical events.

---

### **Decision**

We decided to:

- Log **structured JSON** (not plain strings).
- Include metadata like `userId`, `timestamp`, `actionType`, `module`, and `payloadDiff`.
- Design a **frontend logging service** that acts as a singleton, so all modules can push consistent audit logs.

---

### **Implementation**

1. **Created a Singleton Logger Service**

   ```ts
   class AuditLogger {
     static instance: AuditLogger;

     private constructor() {}

     static getInstance() {
       if (!AuditLogger.instance) {
         AuditLogger.instance = new AuditLogger();
       }
       return AuditLogger.instance;
     }

     log(event: AuditEvent) {
       const logPayload = {
         userId: currentUser.id,
         action: event.action,
         module: event.module,
         payload: event.payload,
         timestamp: new Date().toISOString(),
       };
       axios.post("/api/audit", logPayload);
     }
   }

   export const auditLogger = AuditLogger.getInstance();
   ```

2. **Used a Backend Gateway**

   - Frontend logs sent to `/api/audit`.
   - Backend (Node/Express) received and forwarded logs to Splunk via HTTP Event Collector (HEC) endpoint with proper auth tokens.

3. **Added Audit Hooks**

   - Wrapped all critical APIs (update/delete) with a logging layer.
   - Example:

     ```ts
     api.updateDevice(deviceId, payload).then(() => {
       auditLogger.log({
         action: "UPDATE_DEVICE",
         module: "Device",
         payload: { deviceId, payload },
       });
     });
     ```

4. **Dashboard & Monitoring**

   - Splunk dashboards allowed visualizing activity per user or module.
   - Security alerts were configured for unusual activity (e.g., mass deletions).

---

### **Result**

- Every user action is now auditable with timestamps and payloads.
- Debugging “who did what” reduced investigation time from hours to minutes.
- Enhanced **compliance and observability** in production environments.
- Helped build confidence in system integrity during audits.

---

### **Key Learning**

- Logging is not just about debugging — it’s about **traceability and accountability**.
- Designing a **singleton audit service** ensures consistency across modules.
- Integration with Splunk adds enterprise-grade visibility, metrics, and alerting.
- Always log structured JSON (not plain strings) for better parsing and analytics.

---
