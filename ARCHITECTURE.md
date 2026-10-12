# 🏗️ TroOi Auth System - Architecture & Flows

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─ Root.tsx (Router + Providers)                              │
│  │   ├─ ThemeProvider (Light/Forest)                           │
│  │   ├─ AuthProvider (User State)                              │
│  │   └─ BranchProvider (Tenant/Landlord)                       │
│  │                                                              │
│  └─┬─ Routes                                                    │
│    ├─ / (App - Landing Page)                                  │
│    ├─ /login (Login Component)                                │
│    └─ /dashboard (ProtectedRoute → Dashboard Component)       │
│                                                                │
│  ┌─ Components                                                 │
│  │  ├─ Header (Theme toggle, Auth buttons)                   │
│  │  ├─ Login (Form with validation)                          │
│  │  ├─ Dashboard (Sidebar + Main content)                    │
│  │  └─ ProtectedRoute (Auth check)                           │
│  │                                                              │
│  └─ Hooks                                                      │
│     ├─ useAuth (Login/logout logic)                           │
│     ├─ useTheme (Theme toggle)                                │
│     └─ useBranch (Role selection)                             │
│                                                                │
└────────────┬──────────────────────────────────────────────────┘
             │
             │ HTTP/HTTPS
             ▼
┌────────────────────────────────────────────────────────────────┐
│                  Backend API (Node.js + Express)              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─ POST /api/auth/login                                      │
│  │  ├─ Validate credentials                                   │
│  │  ├─ Hash & compare password                                │
│  │  ├─ Generate JWT token                                     │
│  │  └─ Return token + user data                               │
│  │                                                              │
│  ├─ POST /api/auth/register                                   │
│  │  ├─ Validate input                                         │
│  │  ├─ Check email exists                                     │
│  │  ├─ Hash password & save user                              │
│  │  └─ Return token + user data                               │
│  │                                                              │
│  ├─ GET /api/auth/verify                                      │
│  │  ├─ Verify JWT token                                       │
│  │  └─ Return user info                                       │
│  │                                                              │
│  └─ POST /api/auth/logout                                     │
│     └─ Handle logout (mostly client-side)                     │
│                                                                │
│  Database (User store)                                         │
│  └─ users: id, email, password_hash, name, role               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Login Flow (Sequence Diagram)

```
User          Browser         API Server      Database
 │               │                │              │
 ├──(1) Truy cập /login───────────┤              │
 │               │                │              │
 │         (2) Hiển thị form       │              │
 │               ├────────────────►               │
 │               │                │              │
 ├─(3) Input email/password───────┤              │
 │               │                │              │
 ├─(4) Click "Đăng nhập"──────────┤              │
 │               │                │              │
 │         (5) POST /auth/login    │              │
 │               │────────────────►              │
 │               │                │              │
 │               │         (6) Query user       │
 │               │                ├─────────────┤
 │               │                │ Find user   │
 │               │                │◄─────────────┤
 │               │                │              │
 │               │         (7) Verify password  │
 │               │         (8) Generate JWT    │
 │               │                │              │
 │         (9) Return token+user   │              │
 │               │◄────────────────┤              │
 │               │                │              │
 │    (10) Save token + user      │              │
 │        to localStorage         │              │
 │               │                │              │
 │    (11) Redirect /dashboard    │              │
 │               │                │              │
 │         (12) Load dashboard    │              │
 │               │                │              │
 └───────────────┘────────────────┴──────────────┘
```

---

## State Flow

```
┌─────────────────────────────────┐
│    Browser opens /login         │
│  - user: null                   │
│  - isAuthenticated: false       │
└──────────────┬──────────────────┘
               │
               ▼
        ┌──────────────┐
        │ User enters  │
        │ credentials  │
        └──────┬───────┘
               │
               ▼
   ┌────────────────────────┐
   │ User clicks "Đăng nhập"│
   │ - isLoading: true      │
   └──────────┬─────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ API call POST login │
    └──────────┬──────────┘
               │
         ┌─────┴──────┐
         │            │
    Success        Error
         │            │
         ▼            ▼
    ┌─────────┐  ┌────────────┐
    │ Save    │  │ error: msg │
    │ token & │  │ isLoading: │
    │ user    │  │   false    │
    └────┬────┘  └────────────┘
         │
         ▼
   ┌────────────────────┐
   │ Redirect dashboard │
   │ - user: User obj   │
   │ - isAuthenticated: │
   │   true             │
   │ - isLoading: false │
   └────────────────────┘
```

---

## Component Hierarchy

```
<Root>
  │
  ├─ <ThemeProvider>
  │  └─ [dispatch theme events]
  │
  ├─ <AuthProvider>
  │  ├─ useAuth()
  │  ├─ [login/logout logic]
  │  └─ [localStorage persistence]
  │
  ├─ <BranchProvider>
  │  └─ useBranch()
  │
  └─ <BrowserRouter>
     │
     └─ <Routes>
        │
        ├─ <Route path="/">
        │  └─ <App /> (Landing page)
        │     ├─ <Header />
        │     │  ├─ Theme toggle (useTheme)
        │     │  ├─ Login button (useAuth)
        │     │  └─ Dashboard link (useAuth)
        │     │
        │     ├─ <StoryScene /> (3D)
        │     ├─ <RolesScene /> (3D)
        │     ├─ <LandlordScene /> (3D)
        │     │
        │     └─ <Footer />
        │
        ├─ <Route path="/login">
        │  └─ <Login />
        │     ├─ Email input
        │     ├─ Password input
        │     ├─ Submit button (useAuth.login)
        │     └─ Error message (useAuth.error)
        │
        └─ <Route path="/dashboard">
           └─ <ProtectedRoute>
              └─ <Dashboard /> (useAuth)
                 ├─ <Sidebar>
                 │  ├─ Nav items (role-based)
                 │  ├─ Logout button (useAuth.logout)
                 │  └─ Settings link
                 │
                 └─ <Main>
                    ├─ Header
                    ├─ Stats grid
                    └─ Activity list
```

---

## Data Flow

### Login Data Flow
```
Form Input
  │
  ├─ Email validation
  │
  └─ Password validation
       │
       ▼
   Login API Call
       │
       ├─ Request: { email, password }
       │
       └─ Response: { token, user: { id, email, name, role } }
            │
            ▼
        Save to localStorage
            │
            ├─ 'trooi-token' = JWT token
            │
            └─ 'trooi-user' = User object
                 │
                 ▼
             Update Context
                 │
                 ├─ user = User obj
                 ├─ isAuthenticated = true
                 │
                 ▼
             Redirect /dashboard
```

### Protected Route Flow
```
User navigates to /dashboard
       │
       ▼
  Check useAuth()
       │
  ┌────┴────┐
  │         │
Authenticated?
  │         │
Yes        No
  │         │
  ▼         ▼
Show   Redirect
Dashboard /login
```

---

## API Request/Response Examples

### Login Request
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "tenant@trooi.com",
  "password": "password123"
}
```

### Login Response (Success)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "tenant@trooi.com",
    "name": "Nguyễn Văn A",
    "role": "tenant"
  }
}
```

### Login Response (Error)
```json
{
  "message": "Email hoặc mật khẩu không đúng"
}
```

---

## Token & Storage

### Token Structure (JWT)
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "id": "1", "email": "user@trooi.com", "role": "tenant", "iat": ..., "exp": ... }
Signature: HMACSHA256(header + payload, secret)

Result: header.payload.signature
```

### localStorage Keys
```
trooi-token     → JWT token (expires based on exp claim)
trooi-user      → User object { id, email, name, role }
trooi-landing-theme → Theme preference (light/forest)
```

---

## Error Handling Flow

```
API Error
    │
    ├─ Network error
    │  └─ Display: "Network error, try again"
    │
    ├─ 400 Bad Request
    │  └─ Display: "Email and password required"
    │
    ├─ 401 Unauthorized
    │  └─ Display: "Email or password incorrect"
    │
    ├─ 500 Server Error
    │  └─ Display: "Server error, try again later"
    │
    └─ (Custom from backend)
       └─ Display: error.message
```

---

## Theme System

```
Theme Toggle (Header)
         │
         ▼
   useTheme Hook
         │
    ┌────┴────┐
    │         │
  Light     Forest
    │         │
    ▼         ▼
Set data-theme='light' or 'forest'
    │
    ▼
CSS applies:
    │
    ├─ :root { colors... } (light theme)
    ├─ html[data-theme='forest'] { colors... }
    │
    ▼
localStorage save preference
    │
    └─ trooi-landing-theme
```

---

## Security Boundaries

```
┌─────────────────────────────────────────┐
│            Trust Boundary               │
│     (Always validate on server)         │
├─────────────────────────────────────────┤
│                                         │
│  UNTRUSTED                  TRUSTED    │
│  ─────────────────          ──────────  │
│  • User input               • JWT token │
│  • Client storage           • Server    │
│  • Query params             • Database  │
│  • Headers                               │
│                                         │
│  ✗ Don't trust:                        │
│  └─ Client can be modified             │
│                                         │
│  ✓ Always:                             │
│  ├─ Validate email/password format     │
│  ├─ Hash passwords with bcrypt        │
│  ├─ Verify JWT signature               │
│  ├─ Check token expiration             │
│  ├─ Validate authorization on each API│
│  └─ Log security events                │
│                                         │
└─────────────────────────────────────────┘
```

---

## File Dependency Graph

```
Root.tsx
  ├─ useTheme.tsx ◄── Header.tsx ◄── App.tsx
  ├─ useAuth.tsx
  │  └── Login.tsx
  │  └── ProtectedRoute.tsx
  │  └── Dashboard.tsx
  ├─ useBranch.tsx
  │
  └─ App.tsx
     └─ (Landing page components)

index.css + auth-dashboard.css
  └─ All components (styling)

api.example.js
  └─ Backend (separate from frontend)
```

---

**This document provides a visual understanding of how the authentication system works together.**
