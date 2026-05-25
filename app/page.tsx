import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { ActiveFilters } from '@/components/grants/active-filters';
import { FilterSidebarLoader, MobileFilterSheetLoader } from '@/components/grants/filter-sidebar-loader';
import { GrantCard } from '@/components/grants/grant-card';
import { Skeleton } from '@/components/ui/skeleton';
import { queryGrants, type GrantFilters } from '@/db/queries';

function parseStringArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((v) => v.split(',').map((s) => s.trim())).filter(Boolean);
}

function parseNumber(value: string | string[] | undefined): number | null {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function GrantCardSkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function GrantsList({ filters }: { filters: GrantFilters }) {
  const grantsList = await queryGrants(filters).catch(() => []);

  if (grantsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">No programmes match your filters</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try removing some filters to broaden your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {grantsList.map((grant) => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  );
}

async function GrantsCount({ filters }: { filters: GrantFilters }) {
  const grantsList = await queryGrants(filters).catch(() => []);
  return (
    <p className="text-sm text-muted-foreground mt-0.5">
      {grantsList.length} programme{grantsList.length !== 1 ? 's' : ''} found
    </p>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const filters: GrantFilters = {
    categories: parseStringArray(params.category),
    segments: parseStringArray(params.segment),
    uses: parseStringArray(params.use),
    stages: parseStringArray(params.stage),
    minTicket: parseNumber(params.min),
    maxTicket: parseNumber(params.max),
    shariah: parseStringArray(params.shariah),
  };

  const hasFilters =
    filters.categories!.length > 0 ||
    filters.segments!.length > 0 ||
    filters.uses!.length > 0 ||
    filters.stages!.length > 0 ||
    filters.minTicket != null ||
    filters.maxTicket != null ||
    filters.shariah!.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 flex flex-1 gap-8 py-6">
        <Suspense fallback={<div className="hidden md:block w-60 shrink-0" />}>
          <FilterSidebarLoader />
        </Suspense>

        <main className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Financing Programmes</h1>
              <Suspense fallback={<p className="text-sm text-muted-foreground mt-0.5">Loading…</p>}>
                <GrantsCount filters={filters} />
              </Suspense>
            </div>
            <Suspense>
              <MobileFilterSheetLoader />
            </Suspense>
          </div>

          {hasFilters && (
            <div className="mb-4">
              <Suspense>
                <ActiveFilters />
              </Suspense>
            </div>
          )}

          <Suspense fallback={<GrantCardSkeletons />}>
            <GrantsList filters={filters} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
