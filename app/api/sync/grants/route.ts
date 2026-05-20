import { NextRequest, NextResponse } from 'next/server';
import { runSync } from '@/lib/sync';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) {
    console.warn('[sync] SYNC_SECRET is not set — endpoint is unprotected');
    return true;
  }
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSync();
    console.log(`[sync] synced=${result.synced} failed=${result.failed} archived=${result.archived}`);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause.message : undefined;
    const causeDetail = err instanceof Error && err.cause && typeof (err.cause as Record<string, unknown>).detail === 'string'
      ? (err.cause as Record<string, unknown>).detail as string
      : undefined;
    console.error('[sync] error:', message);
    if (cause) console.error('[sync] caused by:', cause, causeDetail ?? '');
    return NextResponse.json(
      { error: cause ?? message, detail: causeDetail },
      { status: 500 }
    );
  }
}
