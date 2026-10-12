# Quick Start: Customizing Auth & Dashboard

## 🎯 5 Phút Setup

### 1. Cài Dependencies
```bash
npm install
```

### 2. Tạo .env
```bash
cp .env.example .env
# Sửa VITE_API_URL nếu cần
```

### 3. Chạy Dev
```bash
npm run dev
# Truy cập http://localhost:5173/login
```

### 4. Test Login
```
Email: tenant@trooi.com
Password: 123456
```

### 5. Explore Dashboard
- Thấy sidebar menu
- Click theme button để test dark theme
- Click "Đăng xuất" để logout

---

## 🔧 Common Customizations

### Thay đổi Colors

**File: `src/index.css`**

```css
/* Light theme - Tìm và sửa */
:root {
  --ink: '#243c2c';      /* Primary color */
  --lime: '#d4f884';     /* Accent color */
}

/* Dark theme - Tìm và sửa */
html[data-theme='forest'] {
  background: #102a20;   /* Dark background */
  color: #edf6e8;        /* Light text */
}
```

### Thay đổi Font

**File: `src/index.css`**

```css
:root {
  --font-display: 'Your Font', 'Segoe UI', Arial, sans-serif;
  --font-readable: 'Your Font', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
}
```

### Thêm Dashboard Menu Item

**File: `src/components/Dashboard.tsx`**

```typescript
// Tìm section này
{isTenant ? (
  <>
    <a href="/dashboard/rooms" className="nav-item">🔍 Tìm phòng</a>
    {/* Thêm dòng này */}
    <a href="/dashboard/new-page" className="nav-item">✨ New Page</a>
  </>
) : (
  {/* Landlord menu */}
)}
```

### Thay đổi API Endpoint

**File: `src/hooks/useAuth.tsx`**

```typescript
const login = async (email: string, password: string) => {
  // Sửa URL này
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    // Hoặc custom endpoint
    // const response = await fetch('https://api.example.com/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  // ...
};
```

### Thêm Form Fields

**File: `src/components/Login.tsx`**

```typescript
// State
const [phone, setPhone] = useState('');

// Input
<div className="form-group">
  <label htmlFor="phone">Phone</label>
  <input
    id="phone"
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
  />
</div>

// API call
await login(email, password, phone);
```

### Thay đổi Dashboard Stats

**File: `src/components/Dashboard.tsx`**

```typescript
<div className="stat-card">
  <div className="stat-number">123</div>  {/* Sửa số */}
  <div className="stat-label">Your Label</div>  {/* Sửa label */}
</div>
```

---

## 📱 Responsive Tweaks

Tất cả responsive styles ở file CSS. Để customize breakpoints:

**File: `src/styles/auth-dashboard.css`**

```css
/* Desktop */
.dashboard-container {
  grid-template-columns: 280px 1fr;  /* Sidebar width */
}

/* Mobile (800px) */
@media (max-width: 800px) {
  .dashboard-sidebar {
    flex-direction: row;  /* Horizontal sidebar */
  }
}
```

---

## 🎨 Dark Mode Toggle

Dark mode tự động toggle khi click sun/moon icon ở header. 

**Cách hoạt động:**
```typescript
// useTheme hook
const { theme, toggleTheme } = useTheme();

// Theme lưu ở localStorage
localStorage.getItem('trooi-landing-theme');

// CSS applies based on data-theme
html[data-theme='forest'] { /* dark styles */ }
```

**Để force theme:**
```typescript
// Force dark theme
document.documentElement.dataset.theme = 'forest';
localStorage.setItem('trooi-landing-theme', 'forest');
```

---

## 🔐 Adding Auth to New Components

**Sử dụng `useAuth` hook:**

```typescript
import { useAuth } from '../hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Hello {user?.name}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

---

## 📊 Adding Stats & Charts

**Example - Fetching real data:**

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function StatsCard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('trooi-token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/stats`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setStats(data);
    };
    
    if (user) fetchStats();
  }, [user]);

  return (
    <div className="stat-card">
      <div className="stat-number">{stats?.count || 0}</div>
      <div className="stat-label">Items</div>
    </div>
  );
}
```

---

## 🚨 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Cannot find module 'react-router-dom'" | Run `npm install` |
| "CORS error" | Check API has CORS enabled |
| "useAuth must be used within AuthProvider" | Ensure wrapped in AuthProvider |
| "localStorage is not defined" | Only access in useEffect (not on server) |
| "Page stays blank after login" | Check `/dashboard` route in Root.tsx |
| "Styles not applying" | Clear browser cache, restart dev server |

---

## 📚 Where to Find Things

| What | Where |
|------|-------|
| Color definitions | `src/index.css` (root variables) |
| Layout structure | `src/components/Dashboard.tsx` |
| Form styling | `src/styles/auth-dashboard.css` |
| Auth logic | `src/hooks/useAuth.tsx` |
| Routes | `src/Root.tsx` |
| Backend example | `api.example.js` |

---

## 🎓 Learning Resources

**Để hiểu codebase:**
1. Đọc `DEVELOPER_GUIDE.md` - Architecture overview
2. Mở `src/Root.tsx` - Router setup
3. Mở `src/hooks/useAuth.tsx` - Auth logic
4. Mở `src/components/Dashboard.tsx` - Dashboard layout
5. Mở `src/styles/auth-dashboard.css` - Styles

**Để mở rộng:**
1. Tạo trang mới ở `src/pages/`
2. Thêm route ở `src/Root.tsx`
3. Thêm menu item ở `src/components/Dashboard.tsx`
4. Fetch data từ API
5. Style theo design system

---

## ✅ Checklist trước Deploy

- [ ] API endpoint updated
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Theme toggle working
- [ ] Login/logout flow tested
- [ ] Dashboard shows role-based menu
- [ ] Protected routes working
- [ ] Error messages user-friendly
- [ ] Mobile responsive tested
- [ ] Performance OK (build size, load time)

---

**Need help? Check DEVELOPER_GUIDE.md for detailed explanations.**
