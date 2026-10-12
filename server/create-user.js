// Dùng: npm run user:add -- <email> <mật khẩu> "<tên>" <tenant|landlord>
import { randomUUID } from 'node:crypto';
import { hashPassword } from './auth.js';
import { readUsers, saveUsers } from './users.js';

const [email, password, name, role] = process.argv.slice(2);

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!email?.includes('@') || email.length > 254) fail('Email không hợp lệ.');
if (!password || password.length < 8) fail('Mật khẩu tối thiểu 8 ký tự.');
if (!name?.trim()) fail('Thiếu tên hiển thị.');
if (role !== 'tenant' && role !== 'landlord') fail('Vai trò phải là tenant hoặc landlord.');

const users = await readUsers();
const normalized = email.trim().toLowerCase();
if (users.some((u) => u.email === normalized)) fail('Email này đã tồn tại.');

users.push({
  id: randomUUID(),
  email: normalized,
  name: name.trim(),
  role,
  passwordHash: await hashPassword(password),
});
await saveUsers(users);
console.log(`Đã tạo ${role}: ${normalized}`);
