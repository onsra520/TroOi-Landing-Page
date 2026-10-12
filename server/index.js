// API đăng nhập đơn giản, chỉ dùng thư viện chuẩn của Node.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { hashPassword, readToken, signToken, verifyPassword } from './auth.js';
import { readUsers } from './users.js';

const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';
const COOKIE = 'trooi_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_BODY = 4096;

// Chống dò mật khẩu: tối đa 5 lần sai / 15 phút cho mỗi IP.
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map();

const isLocked = (ip) => {
  const f = fails.get(ip);
  if (f && f.until < Date.now()) fails.delete(ip);
  return (fails.get(ip)?.count ?? 0) >= MAX_FAILS;
};
const addFail = (ip) => {
  const f = fails.get(ip);
  fails.set(ip, { count: (f?.count ?? 0) + 1, until: f?.until ?? Date.now() + WINDOW_MS });
};

// Hash giả để thời gian phản hồi giống nhau khi email không tồn tại.
const dummyHash = await hashPassword('dummy-password');

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
};

const publicUser = ({ id, email, name, role }) => ({ id, email, name, role });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}'));
      } catch {
        reject(new Error('bad json'));
      }
    });
    req.on('error', reject);
  });
}

const getSession = (req) => {
  const match = /(?:^|;\s*)trooi_session=([^;]+)/.exec(req.headers.cookie ?? '');
  return readToken(match?.[1]);
};

const cookie = (value, maxAge) =>
  `${COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${isProd ? '; Secure' : ''}`;

async function login(req, res) {
  const ip = req.socket.remoteAddress ?? 'unknown';
  if (isLocked(ip)) return send(res, 429, { error: 'Thử sai quá nhiều lần. Vui lòng quay lại sau 15 phút.' });

  let body;
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { error: 'Dữ liệu không hợp lệ.' });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password || email.length > 254 || password.length > 200) {
    return send(res, 400, { error: 'Vui lòng nhập email và mật khẩu.' });
  }

  const user = (await readUsers()).find((u) => u.email === email);
  const ok = await verifyPassword(password, user ? user.passwordHash : dummyHash);
  if (!user || !ok) {
    addFail(ip);
    return send(res, 401, { error: 'Email hoặc mật khẩu không đúng.' });
  }

  fails.delete(ip);
  const token = signToken({ sub: user.id, exp: Date.now() + SESSION_MS });
  send(res, 200, { user: publicUser(user) }, { 'Set-Cookie': cookie(token, SESSION_MS / 1000) });
}

async function me(req, res) {
  const session = getSession(req);
  const user = session && (await readUsers()).find((u) => u.id === session.sub);
  if (!user) return send(res, 401, { error: 'Chưa đăng nhập.' });
  send(res, 200, { user: publicUser(user) });
}

const routes = {
  'POST /api/login': login,
  'GET /api/me': me,
  'POST /api/logout': (_req, res) => send(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) }),
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const handler = routes[`${req.method} ${pathname}`];
  if (!handler) return send(res, 404, { error: 'Không tìm thấy.' });

  // POST phải là JSON: trình duyệt không gửi được form chéo trang với kiểu này mà không qua CORS.
  if (req.method === 'POST' && !req.headers['content-type']?.startsWith('application/json')) {
    return send(res, 415, { error: 'Content-Type phải là application/json.' });
  }

  try {
    await handler(req, res);
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Lỗi máy chủ.' });
  }
}).listen(PORT, '127.0.0.1', () => console.log(`API chạy tại http://127.0.0.1:${PORT}`));
