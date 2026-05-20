import { cache } from 'react';
import { unstable_cache } from 'next/cache'; // used by getUniqueSegments/Uses/Stages
import { and, gte, isNull, lte, or, sql } from 'drizzle-orm';
import { db } from './index';
import { grants } from './schema';

export interface GrantFilters {
  categories?: string[];
  segments?: string[];
  uses?: string[];
  stages?: string[];
  minTicket?: number | null;
  maxTicket?: number | null;
  shariah?: string[];
}

async function _queryGrants(filters: GrantFilters = {}) {
  const conditions = [isNull(grants.archived_at)];

  if (filters.categories && filters.categories.length > 0) {
    conditions.push(
      sql`${grants.financing_type_categories} && ARRAY[${sql.join(
        filters.categories.map((c) => sql`${c}`),
        sql`, `
      )}]::text[]`
    );
  }

  if (filters.segments && filters.segments.length > 0) {
    conditions.push(
      sql`${grants.value_chain_segments} && ARRAY[${sql.join(
        filters.segments.map((s) => sql`${s}`),
        sql`, `
      )}]::text[]`
    );
  }

  if (filters.uses && filters.uses.length > 0) {
    conditions.push(
      sql`${grants.permitted_uses} && ARRAY[${sql.join(
        filters.uses.map((u) => sql`${u}`),
        sql`, `
      )}]::text[]`
    );
  }

  if (filters.stages && filters.stages.length > 0) {
    conditions.push(
      sql`${grants.company_stages} && ARRAY[${sql.join(
        filters.stages.map((s) => sql`${s}`),
        sql`, `
      )}]::text[]`
    );
  }

  // Include programme if its max ticket overlaps with the requested min
  if (filters.minTicket != null) {
    conditions.push(
      or(isNull(grants.ticket_size_max_rm), gte(grants.ticket_size_max_rm, filters.minTicket))!
    );
  }

  // Include programme if its min ticket overlaps with the requested max
  if (filters.maxTicket != null) {
    conditions.push(
      or(isNull(grants.ticket_size_min_rm), lte(grants.ticket_size_min_rm, filters.maxTicket))!
    );
  }

  if (filters.shariah && filters.shariah.length > 0) {
    conditions.push(
      sql`${grants.shariah_compliant} = ANY(ARRAY[${sql.join(
        filters.shariah.map((s) => sql`${s}`),
        sql`, `
      )}]::text[])`
    );
  }

  return db
    .select()
    .from(grants)
    .where(and(...conditions))
    .orderBy(grants.programme_name);
}

// cache() deduplicates GrantsList + GrantsCount calls within a single render.
// No unstable_cache here — queryGrants must always be fresh after a sync.
export const queryGrants: (filters?: GrantFilters) => ReturnType<typeof _queryGrants> =
  cache((filters: GrantFilters = {}) => _queryGrants(filters));

export const getUniqueSegments = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await db.execute<{ segment: string }>(
      sql`SELECT DISTINCT unnest(${grants.value_chain_segments}) AS segment
          FROM ${grants}
          WHERE ${isNull(grants.archived_at)}
          ORDER BY segment`
    );
    return rows.map((r) => r.segment).filter(Boolean);
  },
  ['unique-segments'],
  { tags: ['grants'], revalidate: 3600 }
);

export const getUniqueUses = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await db.execute<{ use: string }>(
      sql`SELECT DISTINCT unnest(${grants.permitted_uses}) AS use
          FROM ${grants}
          WHERE ${isNull(grants.archived_at)}
          ORDER BY use`
    );
    return rows.map((r) => r.use).filter(Boolean);
  },
  ['unique-uses'],
  { tags: ['grants'], revalidate: 3600 }
);

export const getUniqueStages = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await db.execute<{ stage: string }>(
      sql`SELECT DISTINCT unnest(${grants.company_stages}) AS stage
          FROM ${grants}
          WHERE ${isNull(grants.archived_at)}
          ORDER BY stage`
    );
    return rows.map((r) => r.stage).filter(Boolean);
  },
  ['unique-stages'],
  { tags: ['grants'], revalidate: 3600 }
);
