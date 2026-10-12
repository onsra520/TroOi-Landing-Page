import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DIR = new URL('./data/', import.meta.url);
const FILE = new URL('users.json', DIR);

export async function readUsers() {
  try {
    return JSON.parse(await readFile(FILE, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

export async function saveUsers(users) {
  await mkdir(DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(users, null, 2));
}
