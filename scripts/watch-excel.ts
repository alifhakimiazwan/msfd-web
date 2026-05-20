import chokidar from 'chokidar';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'data', 'grants.xlsx');
const SYNC_URL = process.env.SYNC_URL ?? 'http://localhost:3000/api/sync/grants';
const SECRET = process.env.SYNC_SECRET ?? '';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function triggerSync() {
  console.log('[watch] Detected change in grants.xlsx — triggering sync...');
  try {
    const res = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        ...(SECRET ? { Authorization: `Bearer ${SECRET}` } : {}),
      },
    });
    const body = await res.json();
    if (res.ok) {
      console.log(
        `[watch] Sync complete — synced: ${body.synced}, failed: ${body.failed}, archived: ${body.archived}`
      );
      if (body.errors?.length > 0) {
        console.warn('[watch] Row errors:', body.errors);
      }
    } else {
      console.error('[watch] Sync failed:', body);
    }
  } catch (err) {
    console.error('[watch] Failed to reach sync endpoint:', err);
  }
}

const watcher = chokidar.watch(FILE_PATH, {
  persistent: true,
  ignoreInitial: false,
  awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 200 },
});

watcher.on('change', () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(triggerSync, 500);
});

watcher.on('ready', () => {
  console.log(`[watch] Watching ${FILE_PATH}`);
  console.log(`[watch] Will POST to ${SYNC_URL} on changes`);
  // Trigger an initial sync on startup
  triggerSync();
});

watcher.on('error', (err) => console.error('[watch] Watcher error:', err));
