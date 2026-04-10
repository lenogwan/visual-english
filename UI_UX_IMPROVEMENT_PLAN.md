# Visual English — UI/UX Improvement Implementation Plan

> Generated from full codebase analysis (5 subagents). Every recommendation is mapped to specific files and line numbers.

---

## 1. CRITICAL BUGS (Fix Immediately — Data Loss / Security)

### 1.1 Infinite Loading on `/library` When Unauthenticated
- **File:** `app/library/page.tsx`, lines 22–35
- **Bug:** `useEffect` returns early if `!token`, but `setLoading(false)` is inside the fetch chain. Never called → infinite spinner.
- **Fix:** Move `setLoading(false)` to a `finally` block outside the `if (!token)` guard, or set initial `loading = false` when no token.
- **Risk:** None. Purely additive.

### 1.2 Infinite Loading on `/profile` When Unauthenticated
- **File:** `app/profile/page.tsx`, lines 24–40
- **Bug:** Same pattern — `loadProfile()` returns early if `!token`, `setLoading(false)` never called.
- **Fix:** Same as 1.1.

### 1.3 Hardcoded JWT Secret Fallback
- **Files:** `app/api/auth/login/route.ts:7`, `app/api/auth/register/route.ts:6`, `app/api/words/learned/route.ts:5`, and all other API routes
- **Bug:** `const JWT_SECRET = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'` — anyone who sees the repo can forge tokens.
- **Fix:** Remove fallback. Throw at startup if `JWT_SECRET` is not set. Add to `.env.example`.
- **Risk:** Requires setting env var. Coordinate with deployment.

### 1.4 Cookie Not `httpOnly` or `secure`
- **File:** `app/api/auth/login/route.ts`, line 42
- **Bug:** `response.cookies.set('token', token, { httpOnly: false, secure: false, ... })`
- **Fix:** Set `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`.
- **Risk:** May break client-side token access. Switch to header-only auth pattern.

### 1.5 Dead `proxy.ts` — No Server-Side Auth
- **File:** `proxy.ts`
- **Bug:** Exports `proxy()` with JWT verification and role checks, but is never imported or wired up. No `middleware.ts` exists.
- **Fix:** Either convert to `middleware.ts` (Next.js middleware) or delete it. Client-side guards are easily bypassed.
- **Risk:** Medium. Requires middleware setup. Test thoroughly.

---

## 2. AUTH CONSISTENCY (UX — No Data Loss)

### 2.1 Unify Auth Redirect Behavior
Currently, pages handle auth inconsistently:

| Page | Behavior | Should Be |
|------|----------|-----------|
| `/login` | Redirects to `/` if logged in | ✅ Correct |
| `/quiz`, `/quiz/create`, `/quiz/[id]` | Redirects to `/login` | ✅ Correct |
| `/dashboard` | Shows "Please log in" card | Redirect to `/login` or show card consistently |
| `/admin` | No redirect (relies on API) | Add redirect in page |
| `/learn`, `/search`, `/practice` | Works without auth | ✅ Correct (guest mode) |
| `/library`, `/profile` | Broken (infinite loading) | Fix bug + redirect or show message |

**Fix:** Create a shared `RequireAuth` component or `useRequireAuth()` hook:
```typescript
// lib/auth-utils.ts (new or extend)
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])
  return { user, loading }
}
```

Replace per-page `useEffect` auth checks with this hook.

### 2.2 Memoize Auth Context Value
- **File:** `lib/auth-context.tsx`, line 123
- **Bug:** `value={{ user, token, loading, ... }}` created inline on every render → unnecessary re-renders of all `useAuth()` consumers.
- **Fix:** `const value = useMemo(() => ({ user, token, loading, ... }), [user, token, loading])`
- **Risk:** None.

### 2.3 Token Expiry — Silent Logout
- **File:** `lib/auth-context.tsx`, lines 51–69
- **Bug:** When 7-day JWT expires, `fetchUser()` clears localStorage silently. User sees no warning.
- **Fix:** Add a toast notification ("Your session has expired. Please log in again.") before clearing state and redirecting to `/login`.
- **Risk:** None. Additive.

---

## 3. PERFORMANCE OPTIMIZATIONS (Response Speed)

### 3.1 Add Database Indexes
- **File:** `prisma/schema.prisma`
- **Add:**
```prisma
model PracticeHistory {
  // ... existing fields
  @@index([userId])
  @@index([userId, timestamp])
}

model QuizAttempt {
  // ... existing fields
  @@index([userId])
  @@index([quizId])
}

model Word {
  // ... existing fields
  @@index([word])
}

model UserProgress {
  // ... existing fields
  @@index([userId, learned])
}
```
- **Migration:** `npx prisma migrate dev --name add-indexes`
- **Risk:** None for read queries. Write performance unaffected.

### 3.2 Add Pagination to Unbounded Endpoints

| Route | File | Fix |
|-------|------|-----|
| `GET /api/words/learned` | `app/api/words/learned/route.ts` | Add `take`/`skip` params (default 50) |
| `GET /api/favorites` | `app/api/favorites/route.ts` | Add `take`/`skip` params (default 50) |
| `GET /api/words?limit=5000` | `app/quiz/create/page.tsx:45` | Cap server-side limit at 200, add search param |
| `GET /api/admin/users` | `app/api/admin/users/route.ts` | Add pagination |
| `GET /api/quiz` | `app/api/quiz/route.ts` | Add pagination |

### 3.3 Move Stats Aggregation to SQL
- **File:** `app/api/user/stats/route.ts`
- **Bug:** Loads entire `practiceHistory` table for user into memory, then aggregates with JS `reduce`/`filter`.
- **Fix:** Use Prisma `groupBy`, `count`, `avg` to push aggregation to the database:
```typescript
const totalCorrect = await prisma.practiceHistory.count({
  where: { userId, isCorrect: true, timestamp: { gte: thirtyDaysAgo } }
})
const totalAttempts = await prisma.practiceHistory.count({
  where: { userId, timestamp: { gte: thirtyDaysAgo } }
})
```

### 3.4 Debounce Search Input
- **File:** `app/search/page.tsx`, lines 100–110
- **Bug:** Every keystroke fires a new fetch. No abort controller. Results may arrive out of order.
- **Fix:** Use `useDebounce` hook (300ms) + `AbortController`:
```typescript
const debouncedQuery = useDebounce(query, 300)
useEffect(() => {
  const controller = new AbortController()
  fetch(`/api/words?search=${debouncedQuery}`, { signal: controller.signal })
  return () => controller.abort()
}, [debouncedQuery])
```

### 3.5 Cache Favorites API Calls
- **Files:** `components/TriadCard.tsx:45`, `components/WordCard.tsx:25`, `components/Dashboard.tsx:21`, `app/library/page.tsx:23`
- **Bug:** Each component independently fetches `GET /api/favorites`. On a page with 10 cards, 10 identical calls are made.
- **Fix:** Lift favorites to a shared React context or use React Query / SWR for automatic caching.
- **Quick fix:** Add a module-level cache in a new `lib/favorites-context.tsx`.

### 3.6 Lazy-Load Heavy Components
- **File:** `app/admin/page.tsx` (1868 lines), `app/page.tsx` (landing + dashboard inline)
- **Fix:** Split admin page into sub-components. Lazy-load dashboard on home page:
```typescript
const Dashboard = dynamic(() => import('@/components/Dashboard'), { loading: () => <Spinner /> })
```

---

## 4. UI/UX IMPROVEMENTS (Interface Quality)

### 4.1 Add Missing Error States

| Page | File | Current | Fix |
|------|------|---------|-----|
| `/learn` | `app/learn/page.tsx:18-35` | Silent failure → shows "Daily Goal Completed!" | Show error card with retry button |
| `/search` | `app/search/page.tsx` | Silent failure | Show "Search failed, please try again" |
| `/practice` | `app/practice/page.tsx:48` | "Loading question..." forever | Show error with retry |
| `/study/[wordId]` | `app/study/[wordId]/page.tsx` | Conflates "not found" with "API error" | Distinguish the two |

### 4.2 Add Global Loading States / Skeletons
Create a `components/Skeleton.tsx` with skeleton variants:
- `Skeleton.Card` — for word cards
- `Skeleton.Table` — for admin tables
- `Skeleton.Line` — for text lines
- `Skeleton.Avatar` — for user avatars

Replace raw spinners with contextual skeletons on:
- `/learn` (card skeleton)
- `/library` (grid skeleton)
- `/dashboard` (stats card skeleton)
- `/search` (card skeleton)

### 4.3 Standardize Border Radius
Current inconsistent values found across the codebase:
| Value | Used In | Suggested Replacement |
|-------|---------|----------------------|
| `rounded-[3rem]` | TriadCard front/back, many cards | `rounded-3xl` (1.5rem) or `rounded-[2rem]` |
| `rounded-[2.5rem]` | Tab switchers, result boxes | `rounded-2xl` (1rem) |
| `rounded-[3.5rem]` | Card wrappers | `rounded-3xl` or `rounded-[2rem]` |
| `rounded-[5rem]` | Landing page hero | `rounded-3xl` |
| `rounded-2xl` | Buttons, inputs | ✅ Keep |
| `rounded-3xl` | Some cards | ✅ Keep |

**Fix:** Define CSS custom properties in `globals.css`:
```css
:root {
  --radius-sm: 0.75rem;   /* 12px — buttons, inputs */
  --radius-md: 1rem;      /* 16px — small cards */
  --radius-lg: 1.5rem;    /* 24px — cards */
  --radius-xl: 2rem;      /* 32px — large cards */
}
```
Then use Tailwind arbitrary values: `rounded-[var(--radius-lg)]` or create a Tailwind plugin.

### 4.4 Add Missing Footer
- **Bug:** No Footer component exists. Short pages (login, empty states) leave a large gap.
- **Fix:** Create `components/Footer.tsx` with copyright, links, and add to `app/layout.tsx`.

### 4.5 Mobile Menu Auto-Close on Navigation
- **File:** `components/Navbar.tsx`
- **Bug:** Mobile hamburger menu has no `useEffect` to close on route change or outside click.
- **Fix:** Add `useEffect(() => { setOpen(false) }, [pathname])` or use `next/link`'s `onClick`.

### 4.6 Replace `alert()` with Toast Notifications
- **Files:** `app/admin/page.tsx` (quiz creation), `app/quiz/create/page.tsx` (creation errors)
- **Fix:** Create a `components/Toast.tsx` or use a lightweight library. Replace all `alert()` calls.

### 4.7 Active Route Highlighting in Navbar
- **File:** `components/Navbar.tsx`
- **Bug:** No visual indication of which page the user is currently on.
- **Fix:** Use `usePathname()` from `next/navigation` to apply `bg-indigo-100 text-indigo-700` to the active link.

### 4.8 Add Error Boundaries
Create `components/ErrorBoundary.tsx`:
```typescript
class ErrorBoundary extends React.Component<...> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <ErrorFallback />
    return this.props.children
  }
}
```
Wrap each page's content with `<ErrorBoundary>`.

---

## 5. COMPONENT LIBRARY (Foundation for Consistency)

Create these shared primitive components to enforce design consistency:

### 5.1 `components/ui/Button.tsx`
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}
```
Replace all inline button styles (`px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black ...`) with `<Button variant="primary" size="lg">`.

### 5.2 `components/ui/Input.tsx`
Standardized text input, textarea, select with consistent label, error, and helper text patterns.

### 5.3 `components/ui/Card.tsx`
Standardized card wrapper with consistent padding, border radius, shadow, and hover effects.

### 5.4 `components/ui/Badge.tsx`
For tags, levels, roles — consistent pill styling.

### 5.5 `components/ui/LoadingSpinner.tsx`
Already exists but underused. Standardize on this component instead of inline spinners.

### 5.6 `components/ui/EmptyState.tsx`
For "no results", "no favorites", "no quizzes" states — consistent icon + text + CTA pattern.

---

## 6. IMPLEMENTATION ORDER (Recommended)

### Phase 1: Critical Bug Fixes (1–2 days)
1. Fix `/library` infinite loading
2. Fix `/profile` infinite loading
3. Add missing error states (`/learn`, `/search`, `/practice`)
4. Memoize auth context value
5. Add database indexes + run migration

### Phase 2: Auth & Security (1–2 days)
6. Fix JWT secret (require env var)
7. Fix cookie security flags
8. Add `useRequireAuth()` hook, unify redirect behavior
9. Add session expiry toast

### Phase 3: Performance (2–3 days)
10. Add pagination to unbounded endpoints
11. Move stats aggregation to SQL
12. Debounce search input
13. Cache favorites API calls
14. Lazy-load heavy components

### Phase 4: UI/UX Polish (2–3 days)
15. Create shared UI components (Button, Input, Card, Badge, EmptyState)
16. Add skeletons for loading states
17. Add Footer component
18. Fix mobile menu auto-close
19. Replace `alert()` with toast notifications
20. Add active route highlighting in Navbar
21. Add error boundaries

### Phase 5: Design Consistency (1–2 days)
22. Standardize border radius values
23. Audit and fix color inconsistencies
24. Standardize spacing patterns
25. Fix `proxy.ts` (wire up as middleware or delete)

---

## 7. RISK ASSESSMENT

| Phase | Risk Level | Reason |
|-------|-----------|--------|
| Phase 1 | Low | Bug fixes only. Additive changes. |
| Phase 2 | Medium | Auth changes affect all pages. Test login flow thoroughly. |
| Phase 3 | Medium | API contract changes (pagination). May need client updates. |
| Phase 4 | Low | Additive UI components. No existing logic changed. |
| Phase 5 | Low | Cosmetic changes only. |

**Mitigation:** Each phase should be deployed and tested independently. Write tests for critical paths (login, learn, quiz) before making changes.

---

## 8. FILES TO CREATE (New)

| File | Purpose |
|------|---------|
| `components/ui/Button.tsx` | Shared button component |
| `components/ui/Input.tsx` | Shared input component |
| `components/ui/Card.tsx` | Shared card wrapper |
| `components/ui/Badge.tsx` | Shared badge/pill |
| `components/ui/LoadingSpinner.tsx` | Standardized spinner |
| `components/ui/EmptyState.tsx` | Shared empty state |
| `components/ui/Skeleton.tsx` | Skeleton loading states |
| `components/ui/Toast.tsx` | Toast notifications |
| `components/ErrorBoundary.tsx` | React error boundary |
| `components/Footer.tsx` | Site footer |
| `hooks/useDebounce.ts` | Debounce hook |
| `hooks/useRequireAuth.ts` | Auth redirect hook |
| `lib/favorites-context.tsx` | Shared favorites cache |
| `.env.example` | Environment variable template |

---

## 9. FILES TO MODIFY (Summary)

| File | Changes |
|------|---------|
| `app/layout.tsx` | Add Footer |
| `app/library/page.tsx` | Fix infinite loading bug |
| `app/profile/page.tsx` | Fix infinite loading bug |
| `app/learn/page.tsx` | Add error state |
| `app/search/page.tsx` | Add debounce, error state |
| `app/practice/page.tsx` | Add error state |
| `app/study/[wordId]/page.tsx` | Distinguish not-found vs error |
| `app/admin/page.tsx` | Split into sub-components, replace `alert()` |
| `app/page.tsx` | Lazy-load Dashboard |
| `app/dashboard/page.tsx` | Add loading state |
| `components/Navbar.tsx` | Active route highlight, mobile menu auto-close |
| `components/TriadCard.tsx` | Use shared components |
| `components/WordCard.tsx` | Use shared components, cache favorites |
| `components/Dashboard.tsx` | Use shared components, cache favorites |
| `lib/auth-context.tsx` | Memoize value, add session expiry toast |
| `lib/auth-utils.ts` | Add `useRequireAuth()` hook |
| `prisma/schema.prisma` | Add indexes |
| `app/api/*/route.ts` (all) | Add input validation, proper error logging |
| `app/api/user/stats/route.ts` | Move aggregation to SQL |
| `app/api/words/learned/route.ts` | Add pagination |
| `app/api/favorites/route.ts` | Add pagination |
| `app/api/words/route.ts` | Cap limit, add search |

---

*Plan generated by analyzing 40+ files across the codebase with 5 specialized subagents.*
