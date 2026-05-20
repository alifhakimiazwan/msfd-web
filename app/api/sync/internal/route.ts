import { NextResponse } from 'next/server';
import { runSync } from '@/lib/sync';

export async function POST() {
  try {
    const result = await runSync();
    console.log(`[sync] synced=${result.synced} failed=${result.failed} archived=${result.archived}`);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sync] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
