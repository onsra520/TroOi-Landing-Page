import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const isProd = process.env.NODE_ENV === 'production';
if (isProd && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET là bắt buộc khi chạy production.');
}
// Dev: không có secret thì tạo ngẫu nhiên, phiên đăng nhập mất khi restart server.
const SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  const expected = Buffer.from(key, 'hex');
  const actual = await scryptAsync(password, Buffer.from(salt, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

const sign = (body) => createHmac('sha256', SECRET).update(body).digest();

export function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body).toString('base64url')}`;
}

export function readToken(token) {
  const [body, sig] = (token ?? '').split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}
