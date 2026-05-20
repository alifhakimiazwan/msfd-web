import { z } from 'zod';
import { and, isNull, notInArray, sql } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { db } from '@/db';
import { grants } from '@/db/schema';
import { getGrantsSource } from '@/lib/sources';

const GrantRowSchema = z.object({
  external_id: z.number().int().nullable(),
  full_name: z.string().min(1),
  programme_name: z.string().min(1),
  agency: z.string().nullable(),
  website_url: z.string().nullable(),
  financing_type: z.string().min(1),
  financing_type_categories: z.array(z.string()).min(1),
  total_pool_raw: z.string().nullable(),
  total_pool_rm: z.number().nullable(),
  ticket_size_min_notes: z.string().nullable(),
  ticket_size_min_rm: z.number().nullable(),
  ticket_size_max_notes: z.string().nullable(),
  ticket_size_max_rm: z.number().nullable(),
  cost_of_capital_raw: z.string().nullable(),
  cost_of_capital_pct_min: z.number().nullable(),
  cost_of_capital_pct_max: z.number().nullable(),
  tenure_raw: z.string().nullable(),
  tenure_years_min: z.number().nullable(),
  tenure_years_max: z.number().nullable(),
  grace_period_raw: z.string().nullable(),
  grace_period_months: z.number().int().nullable(),
  shariah_compliant: z.enum(['Yes', 'No', 'Both']).nullable(),
  value_chain_segments: z.array(z.string()),
  permitted_uses: z.array(z.string()),
  ownership_requirement_raw: z.string().nullable(),
  company_stage_raw: z.string().nullable(),
  company_stages: z.array(z.string()),
  collateral_raw: z.string().nullable(),
  application_cycle: z.string().nullable(),
  example_recipients: z.string().nullable(),
  notes: z.string().nullable(),
});

type ValidatedRow = z.infer<typeof GrantRowSchema>;

function toInsertValues(data: ValidatedRow, now: Date) {
  return {
    external_id: data.external_id,
    full_name: data.full_name,
    programme_name: data.programme_name,
    agency: data.agency,
    website_url: data.website_url,
    financing_type: data.financing_type,
    financing_type_categories: data.financing_type_categories,
    total_pool_raw: data.total_pool_raw,
    total_pool_rm: data.total_pool_rm,
    ticket_size_min_notes: data.ticket_size_min_notes,
    ticket_size_min_rm: data.ticket_size_min_rm,
    ticket_size_max_notes: data.ticket_size_max_notes,
    ticket_size_max_rm: data.ticket_size_max_rm,
    cost_of_capital_raw: data.cost_of_capital_raw,
    cost_of_capital_pct_min: data.cost_of_capital_pct_min?.toString() ?? null,
    cost_of_capital_pct_max: data.cost_of_capital_pct_max?.toString() ?? null,
    tenure_raw: data.tenure_raw,
    tenure_years_min: data.tenure_years_min?.toString() ?? null,
    tenure_years_max: data.tenure_years_max?.toString() ?? null,
    grace_period_raw: data.grace_period_raw,
    grace_period_months: data.grace_period_months,
    shariah_compliant: data.shariah_compliant,
    value_chain_segments: data.value_chain_segments,
    permitted_uses: data.permitted_uses,
    ownership_requirement_raw: data.ownership_requirement_raw,
    company_stage_raw: data.company_stage_raw,
    company_stages: data.company_stages,
    collateral_raw: data.collateral_raw,
    application_cycle: data.application_cycle,
    example_recipients: data.example_recipients,
    notes: data.notes,
    last_synced_at: now,
    archived_at: null,
    updated_at: now,
  };
}

export interface SyncResult {
  synced: number;
  failed: number;
  archived: number;
  errors: { row: number; full_name: string; error: string }[];
  timestamp: string;
}

export async function runSync(): Promise<SyncResult> {
  const now = new Date();
  const source = getGrantsSource();
  const rawRows = await source.fetchRows();

  const errors: SyncResult['errors'] = [];
  const validRows: Array<ReturnType<typeof toInsertValues> & { created_at: Date }> = [];

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const validation = GrantRowSchema.safeParse(raw);
    if (!validation.success) {
      errors.push({
        row: i + 1,
        full_name: raw.full_name ?? '(unknown)',
        error: validation.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; '),
      });
    } else {
      validRows.push({ ...toInsertValues(validation.data, now), created_at: now });
    }
  }

  let synced = 0;
  let archived = 0;

  if (validRows.length > 0) {
    await db
      .insert(grants)
      .values(validRows)
      .onConflictDoUpdate({
        target: grants.full_name,
        set: {
          external_id:               sql`excluded.external_id`,
          programme_name:            sql`excluded.programme_name`,
          agency:                    sql`excluded.agency`,
          website_url:               sql`excluded.website_url`,
          financing_type:            sql`excluded.financing_type`,
          financing_type_categories: sql`excluded.financing_type_categories`,
          total_pool_raw:            sql`excluded.total_pool_raw`,
          total_pool_rm:             sql`excluded.total_pool_rm`,
          ticket_size_min_notes:     sql`excluded.ticket_size_min_notes`,
          ticket_size_min_rm:        sql`excluded.ticket_size_min_rm`,
          ticket_size_max_notes:     sql`excluded.ticket_size_max_notes`,
          ticket_size_max_rm:        sql`excluded.ticket_size_max_rm`,
          cost_of_capital_raw:       sql`excluded.cost_of_capital_raw`,
          cost_of_capital_pct_min:   sql`excluded.cost_of_capital_pct_min`,
          cost_of_capital_pct_max:   sql`excluded.cost_of_capital_pct_max`,
          tenure_raw:                sql`excluded.tenure_raw`,
          tenure_years_min:          sql`excluded.tenure_years_min`,
          tenure_years_max:          sql`excluded.tenure_years_max`,
          grace_period_raw:          sql`excluded.grace_period_raw`,
          grace_period_months:       sql`excluded.grace_period_months`,
          shariah_compliant:         sql`excluded.shariah_compliant`,
          value_chain_segments:      sql`excluded.value_chain_segments`,
          permitted_uses:            sql`excluded.permitted_uses`,
          ownership_requirement_raw: sql`excluded.ownership_requirement_raw`,
          company_stage_raw:         sql`excluded.company_stage_raw`,
          company_stages:            sql`excluded.company_stages`,
          collateral_raw:            sql`excluded.collateral_raw`,
          application_cycle:         sql`excluded.application_cycle`,
          example_recipients:        sql`excluded.example_recipients`,
          notes:                     sql`excluded.notes`,
          last_synced_at:            sql`excluded.last_synced_at`,
          archived_at:               sql`excluded.archived_at`,
          updated_at:                sql`excluded.updated_at`,
        },
      });
    synced = validRows.length;
  }

  const syncedNames = validRows.map((r) => r.full_name);
  if (syncedNames.length > 0) {
    const result = await db
      .update(grants)
      .set({ archived_at: now, updated_at: now })
      .where(and(isNull(grants.archived_at), notInArray(grants.full_name, syncedNames)))
      .returning({ full_name: grants.full_name });
    archived = result.length;
  }

  revalidateTag('grants', { expire: 0 });

  return { synced, failed: errors.length, archived, errors, timestamp: now.toISOString() };
}
