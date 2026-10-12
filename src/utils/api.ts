export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord';
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${import.meta.env.BASE_URL}api/${path}`, init);
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Vui lòng thử lại.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Đã có lỗi xảy ra.');
  return data;
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// Chỉ khi chạy `npm run dev`: bỏ qua server, đăng nhập luôn thành công với tài khoản demo.
// Bản build production (import.meta.env.DEV = false) vẫn dùng API thật.
const DEMO = import.meta.env.DEV;
const DEMO_KEY = 'trooi_demo_user';

const demoUser = (email: string): User => ({
  id: 'demo',
  email: email || 'demo@trooi.local',
  name: email.split('@')[0] || 'Demo',
  role: 'tenant',
});

export const login = async (email: string, password: string) => {
  if (!DEMO) return request<{ user: User }>('login', json({ email, password }));
  const user = demoUser(email.trim());
  sessionStorage.setItem(DEMO_KEY, JSON.stringify(user));
  return { user };
};

export const me = async () => {
  if (!DEMO) return request<{ user: User }>('me');
  const raw = sessionStorage.getItem(DEMO_KEY);
  if (!raw) throw new ApiError(401, 'Chưa đăng nhập.');
  return { user: JSON.parse(raw) as User };
};

export const logout = async () => {
  if (!DEMO) return request<{ ok: true }>('logout', json({}));
  sessionStorage.removeItem(DEMO_KEY);
  return { ok: true as const };
};
