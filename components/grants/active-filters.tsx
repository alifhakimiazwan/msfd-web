'use client';

import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PARAM_LABELS: Record<string, string> = {
  category: 'Type',
  segment: 'Segment',
  use: 'Use',
  stage: 'Stage',
  shariah: 'Shariah',
};

export function ActiveFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const chips: { param: string; value: string; label: string }[] = [];

  for (const [param, label] of Object.entries(PARAM_LABELS)) {
    const values = searchParams.getAll(param);
    for (const value of values) {
      chips.push({ param, value, label: `${label}: ${value}` });
    }
  }

  // Range params
  const minTicket = searchParams.get('min');
  const maxTicket = searchParams.get('max');
  if (minTicket) chips.push({ param: 'min', value: minTicket, label: `Min: RM${Number(minTicket).toLocaleString()}` });
  if (maxTicket) chips.push({ param: 'max', value: maxTicket, label: `Max: RM${Number(maxTicket).toLocaleString()}` });

  if (chips.length === 0) return null;

  function removeFilter(param: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    // For multi-value params, remove only the specific value
    if (['category', 'segment', 'use', 'stage', 'shariah'].includes(param)) {
      const existing = next.getAll(param).filter((v) => v !== value);
      next.delete(param);
      existing.forEach((v) => next.append(param, v));
    } else {
      next.delete(param);
    }
    router.replace(`/?${next.toString()}`);
  }

  function clearAll() {
    router.replace('/');
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ param, value, label }) => (
        <Badge
          key={`${param}:${value}`}
          variant="secondary"
          className="gap-1 pr-1 font-normal"
        >
          {label}
          <button
            onClick={() => removeFilter(param, value)}
            className="ml-0.5 rounded-sm hover:bg-muted-foreground/20 p-0.5"
            aria-label={`Remove filter ${label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={clearAll}
      >
        Clear all
      </Button>
    </div>
  );
}
