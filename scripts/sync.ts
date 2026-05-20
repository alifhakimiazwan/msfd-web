import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const url = process.env.SYNC_URL ?? 'http://localhost:3000/api/sync/grants';
const secret = process.env.SYNC_SECRET ?? '';

async function main() {
  const res = await fetch(url, {
    method: 'POST',
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  });
  const text = await res.text();
  console.log(`HTTP ${res.status}`);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log('Raw response:', text || '(empty body)');
  }
  if (!res.ok) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
