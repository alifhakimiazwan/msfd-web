'use server';

import { runSync } from '@/lib/sync';

export async function syncGrantsAction(): Promise<
  | { ok: true; synced: number; failed: number; archived: number; timestamp: string }
  | { ok: false; error: string }
> {
  try {
    const { synced, failed, archived, timestamp } = await runSync();
    return { ok: true, synced, failed, archived, timestamp };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
