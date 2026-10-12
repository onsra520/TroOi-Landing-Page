# TroOi Auth & Dashboard Feature

## 📋 Tổng quan

Đây là tính năng đăng nhập (Login) và dashboard cho ứng dụng TroOi. Người dùng có thể:

- **Đăng nhập** với email và mật khẩu
- **Chọn vai trò**: Người thuê (Tenant) hoặc Chủ trọ (Landlord)
- **Xem Dashboard** với các tính năng khác nhau tùy theo vai trò

## 🎨 Design System

Tính năng này tuân theo hệ thống thiết kế hiện tại của dự án:

### Màu sắc
- **Primary**: `#243c2c` (Ink) - Màu chủ đạo
- **Accent**: `#d4f884` (Lime) - Màu nhấn mạnh
- **Green**: `#729844` - Màu xanh lá cây
- **Light Background**: `#eef3e9`
- **Dark Background**: `#102a20` (Forest theme)

### Typography
- **Font**: Be Vietnam Pro
- **Sizes**: 
  - Header: 28-32px
  - Body: 14-16px
  - Small: 12-13px

### Components
- Rounded corners: 8-20px (tùy component)
- Box shadow: Subtle (0 4px 12px #243c2c08)
- Transitions: 0.2s ease

## 📁 File Structure

```
src/
├── hooks/
│   └── useAuth.tsx              # Auth context & hook
├── components/
│   ├── Login.tsx                # Login form component
│   ├── Dashboard.tsx            # Dashboard layout
│   ├── ProtectedRoute.tsx       # Route protection
│   └── Header.tsx               # (Updated) - Added auth buttons
├── styles/
│   └── auth-dashboard.css       # Auth & Dashboard styles
└── Root.tsx                     # (New) - Router setup

api.example.js                   # Backend API example
.env.example                     # Environment variables
```

## 🔧 Setup & Installation

### 1. Frontend Setup

```bash
# Cài đặt dependencies
npm install

# Tạo .env file
cp .env.example .env

# Cập nhật VITE_API_URL nếu cần (default: http://localhost:3001/api)
```

### 2. Backend Setup (Optional - nếu dùng API example)

```bash
# Copy api.example.js thành file backend riêng
cp api.example.js backend/api.js

# Cài đặt dependencies cho backend
npm install express cors bcryptjs jsonwebtoken

# Chạy backend
node api.js
```

### 3. Chạy ứng dụng

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (nếu cần)
node api.js
```

## 🚀 Tính năng

### Login Page (`/login`)
- Email & password form
- Error handling
- Loading state
- Link to signup (placeholder)

### Dashboard (`/dashboard`)
- **Sidebar Navigation** với các menu khác nhau tùy theo vai trò
- **Stats Grid** - Hiển thị thống kê chính
- **Activity List** - Hoạt động gần đây
- **User Profile** - Tên người dùng và vai trò

### Vai trò

#### Người Thuê (Tenant)
Menu items:
- 📊 Tổng quan
- 🔍 Tìm phòng
- 🏠 Phòng của tôi
- 💰 Hóa đơn
- 🔧 Báo sự cố

#### Chủ Trọ (Landlord)
Menu items:
- 📊 Tổng quan
- 🏢 Quản lý phòng
- 👥 Quản lý khách thuê
- 💼 Quản lý hóa đơn
- 💬 Tin nhắn

## 🔐 Security

### Token Management
- JWT token lưu trong `localStorage` (key: `trooi-token`)
- User info lưu trong `localStorage` (key: `trooi-user`)
- Token tự động include trong request headers

### Protected Routes
- `/dashboard` - Yêu cầu authentication
- `/login` - Accessible khi chưa login
- Redirect to login nếu token hết hạn

## 🎯 Backend API Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "role": "tenant"
  }
}
```

### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "role": "tenant"
}
```

### GET /api/auth/verify
Verify JWT token validity

## 🧪 Test Accounts (nếu dùng API example)

```
Người thuê:
  Email: tenant@trooi.com
  Password: 123456

Chủ trọ:
  Email: landlord@trooi.com
  Password: 123456
```

## 📦 Theme Support

Login & Dashboard tự động hỗ trợ cả hai theme:
- **Light Theme** (default): Màu sáng
- **Forest Theme**: Màu tối

Theme toggle button nằm ở header, và setting được lưu trong localStorage.

## ⚡ Performance

- Lazy loading components
- Minimal CSS (using Tailwind + custom CSS)
- Efficient state management với Context API
- No unnecessary re-renders

## 🔄 Integration Notes

Để integrate với backend thực của bạn:

1. Cập nhật `VITE_API_URL` trong `.env`
2. Modify `useAuth.tsx` - update API endpoints nếu cần
3. Adjust `Dashboard.tsx` - thêm real data fetching
4. Create actual dashboard pages cho menu items (rooms, bills, etc.)

## 📝 Future Enhancements

- [ ] Signup page
- [ ] Password recovery
- [ ] User settings page
- [ ] Real dashboard pages (rooms, bills, messages)
- [ ] Push notifications
- [ ] Analytics & reports

## 🐛 Known Issues

- Hiện tại sử dụng mock data cho dashboard
- API example không có database thực
- Chưa có error tracking/logging

## 📞 Support

Liên hệ team phát triển nếu có câu hỏi.
