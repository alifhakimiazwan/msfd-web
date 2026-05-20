'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch('/api/sync/internal', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        toast.error('Sync failed', { description: data.error });
        return;
      }

      const parts = [`${data.synced} synced`];
      if (data.archived) parts.push(`${data.archived} archived`);
      if (data.failed) parts.push(`${data.failed} failed`);

      if (data.failed) {
        toast.warning('Sync completed with errors', { description: parts.join(' · ') });
      } else {
        toast.success('Sync complete', { description: parts.join(' · ') });
      }

      router.refresh();
    } catch {
      toast.error('Sync failed', { description: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
      <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Syncing…' : 'Sync'}
    </Button>
  );
}
