# 🎯 TroOi Auth & Dashboard - Developer Guide

## 📌 Tổng Quan Nhanh

Tính năng đăng nhập và dashboard đã được phát triển hoàn chỉnh với:

✅ **Login Page** - Form đăng nhập với validation  
✅ **Protected Routes** - Các trang chỉ dành cho người dùng đã xác thực  
✅ **Role-based Dashboard** - Giao diện khác nhau cho Tenant vs Landlord  
✅ **Auth State Management** - Context API + localStorage  
✅ **Design Consistency** - Tuân theo design system hiện tại (Be Vietnam Pro, Tailwind, themes)  
✅ **Backend Example** - API endpoint example đầy đủ  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Root (Router Setup)            │
├─────────────────────────────────────────┤
│  ├─ ThemeProvider (light/forest)        │
│  ├─ AuthProvider (user state)           │
│  └─ BranchProvider (tenant/landlord)    │
├─────────────────────────────────────────┤
│  Routes:                                │
│  ├─ / (Landing Page)                    │
│  ├─ /login (Login Form)                 │
│  └─ /dashboard (Protected - Dashboard)  │
└─────────────────────────────────────────┘
```

### State Management

**useAuth Hook:**
```typescript
{
  user: User | null,           // Current logged-in user
  isAuthenticated: boolean,    // Is user logged in?
  isLoading: boolean,          // Loading state
  error: string | null,        // Error message
  login(email, password),      // Login function
  logout()                     // Logout function
}
```

**User Object:**
```typescript
{
  id: string,                  // User ID
  email: string,               // Email
  name: string,                // Full name
  role: 'tenant' | 'landlord'  // User role
}
```

---

## 🚀 Usage Flow

### 1. Landing Page
Người dùng vào trang chủ, có thể thấy nút "Đăng nhập" hoặc "Dashboard" nếu đã login.

### 2. Login
```
User fills email/password → Submit → API call → Get token → Store in localStorage → Redirect to /dashboard
```

### 3. Dashboard
Hiển thị giao diện khác nhau dựa trên role:
- **Tenant**: Tìm phòng, quản lý phòng của mình, xem hóa đơn, báo sự cố
- **Landlord**: Quản lý phòng, quản lý khách thuê, quản lý hóa đơn, tin nhắn

---

## 📁 File Reference

### Core Files

| File | Purpose |
|------|---------|
| `src/Root.tsx` | Router setup với providers |
| `src/hooks/useAuth.tsx` | Auth context & state management |
| `src/components/Login.tsx` | Login form component |
| `src/components/Dashboard.tsx` | Dashboard layout |
| `src/components/ProtectedRoute.tsx` | Route protection wrapper |
| `src/styles/auth-dashboard.css` | Auth & dashboard styles |

### Configuration

| File | Purpose |
|------|---------|
| `.env.example` | Environment variables template |
| `package.json` | Dependencies (added react-router-dom) |
| `api.example.js` | Backend API example |
| `AUTH_DASHBOARD.md` | Feature documentation |

---

## 🔧 Integration Guide

### Step 1: Update Backend API

Hiện tại, `useAuth.tsx` gọi API tới:
```
POST ${VITE_API_URL}/auth/login
```

Nếu backend của bạn khác cấu trúc, cập nhật:

**File: `src/hooks/useAuth.tsx` - hàm `login()`**

```typescript
const login = async (email: string, password: string) => {
  // ...
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    // Update endpoint nếu cần
  });
  // Update response structure nếu khác
  const data = await response.json();
};
```

### Step 2: Environment Variables

Tạo `.env` file:
```
VITE_API_URL=https://your-api.com/api
```

Trong development:
```
VITE_API_URL=http://localhost:3001/api
```

### Step 3: Add Dashboard Pages

Dashboard hiện tại chỉ là skeleton. Để thêm các trang thực:

**Tạo page component (e.g., `src/pages/Rooms.tsx`):**
```typescript
export default function Rooms() {
  return (
    <div className="dashboard-content">
      <h2>Tìm Phòng</h2>
      {/* Your content */}
    </div>
  );
}
```

**Cập nhật routing (`src/Root.tsx`):**
```typescript
<Route path="/dashboard/rooms" element={<Rooms />} />
```

**Cập nhật sidebar links (`src/components/Dashboard.tsx`):**
```typescript
<Link to="/dashboard/rooms" className="nav-item">
  🔍 Tìm phòng
</Link>
```

### Step 4: Fetch Real Data

**Example - Fetch user data:**
```typescript
useEffect(() => {
  const fetchUserData = async () => {
    const token = localStorage.getItem('trooi-token');
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setUserData(data);
  };
  
  fetchUserData();
}, []);
```

---

## 🎨 Customization

### Theme Colors

Edit `src/index.css` hoặc `tailwind.config.js`:

**Light theme:**
```css
:root {
  --ink: '#243c2c';           /* Primary */
  --lime: '#d4f884';          /* Accent */
  --green-primary: '#729844'; /* Secondary */
}
```

**Dark theme (forest):**
```css
html[data-theme='forest'] {
  background: #102a20;
  color: #edf6e8;
}
```

### Dashboard Layout

Để thay đổi layout, edit `src/components/Dashboard.tsx`:

```typescript
// Thay đổi sidebar width
<div className="dashboard-container"> {/* 280px fixed sidebar */}

// Thêm/xóa menu items
<a href="/dashboard/custom" className="nav-item">
  ✨ Custom Page
</a>
```

### Styling Custom Components

Sử dụng BEM naming convention:
```css
.component-name {
  /* base styles */
}

.component-name__element {
  /* element styles */
}

.component-name--modifier {
  /* modifier styles */
}
```

**Với theme support:**
```css
.component-name {
  color: #243c2c;
}

html[data-theme='forest'] .component-name {
  color: #edf6e8;
}
```

---

## 🔐 Security Best Practices

### 1. Token Storage
```typescript
// Store token securely
localStorage.setItem('trooi-token', token);

// Include in all API requests
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. Input Validation
Luôn validate ở client và server:
```typescript
if (!email || !password) {
  setError('Email và mật khẩu là bắt buộc');
  return;
}
```

### 3. Password Security
- **Client**: Không log password
- **Server**: Hash password với bcryptjs hoặc tương tự
- **HTTPS**: Luôn sử dụng HTTPS trong production

### 4. Error Handling
Không show chi tiết lỗi backend:
```typescript
// ❌ Bad
setError(error.response.data.details);

// ✅ Good
setError('Đăng nhập thất bại. Vui lòng thử lại.');
```

---

## 🧪 Testing

### Manual Test Cases

**1. Login Success:**
```
1. Truy cập /login
2. Nhập email: tenant@trooi.com
3. Nhập password: 123456
4. Click "Đăng nhập"
5. Verify: Redirect to /dashboard
6. Verify: Name "Nguyễn Văn A" hiển thị ở header
```

**2. Login Failure:**
```
1. Truy cập /login
2. Nhập email sai: wrong@test.com
3. Nhập password: 123456
4. Click "Đăng nhập"
5. Verify: Error message hiển thị
```

**3. Protected Route:**
```
1. Logout hoặc xóa token
2. Truy cập /dashboard
3. Verify: Redirect to /login
```

**4. Theme Toggle:**
```
1. Ở /dashboard
2. Click theme button (sun/moon icon)
3. Verify: All colors change correctly
```

---

## 📊 Performance Tips

### 1. Lazy Load Dashboard Pages
```typescript
const Rooms = lazy(() => import('./pages/Rooms'));
const Bills = lazy(() => import('./pages/Bills'));

<Suspense fallback={<Loading />}>
  <Rooms />
</Suspense>
```

### 2. Memoize Dashboard Component
```typescript
export default memo(Dashboard, (prev, next) => {
  return prev.user?.id === next.user?.id;
});
```

### 3. Optimize API Calls
```typescript
// Use React Query or SWR
import { useQuery } from '@tanstack/react-query';

const { data: userData } = useQuery({
  queryKey: ['user'],
  queryFn: () => fetchUser(),
  staleTime: 1000 * 60 * 5 // 5 minutes
});
```

---

## 🐛 Troubleshooting

### Issue: "useAuth must be used within AuthProvider"
**Solution:** Đảm bảo component được wrap bởi `AuthProvider` (đã có ở `Root.tsx`)

### Issue: CORS error từ API
**Solution:** Thêm CORS headers ở backend:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue: Token hết hạn, bị redirect loop
**Solution:** Implement token refresh:
```typescript
if (error.status === 401) {
  refreshToken();
  retryRequest();
}
```

### Issue: Sidebar không responsive
**Solution:** Check `@media (max-width: 800px)` ở `auth-dashboard.css`

---

## 🚀 Deployment Checklist

- [ ] Update `VITE_API_URL` tới production API
- [ ] Set `JWT_SECRET` ở backend
- [ ] Enable HTTPS
- [ ] Set `SameSite=Strict` cho cookies
- [ ] Implement CSRF protection
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Test login flow on production domain
- [ ] Backup & test database
- [ ] Setup monitoring & alerts

---

## 📚 Resources

- [React Router Docs](https://reactrouter.com/)
- [Context API Docs](https://react.dev/reference/react/useContext)
- [Tailwind CSS](https://tailwindcss.com/)
- [JWT Basics](https://jwt.io/introduction)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 📞 Next Steps

1. **Setup Backend API** - Sử dụng `api.example.js` hoặc integrate với backend hiện tại
2. **Add Dashboard Pages** - Tạo các trang thực cho rooms, bills, messages, etc.
3. **Fetch Real Data** - Replace mock data bằng API calls
4. **Setup Monitoring** - Error tracking, analytics
5. **Test** - Manual testing & automated tests
6. **Deploy** - Push to production

---

**Good luck! 🚀**
