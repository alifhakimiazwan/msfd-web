'use client';

import { useState } from 'react';

function agencySlug(agency: string): string {
  return agency
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function initials(agency: string): string {
  return agency
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function AgencyLogo({ agency }: { agency: string }) {
  const [failed, setFailed] = useState(false);
  const slug = agencySlug(agency);

  if (failed) {
    return (
      <div className="h-14 w-14 shrink-0 rounded-md bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground select-none">
        {initials(agency)}
      </div>
    );
  }

  return (
    <div className="h-14 w-14 shrink-0 rounded-md border bg-white overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logos/${slug}.png`}
        alt={agency}
        width={56}
        height={56}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
