import { bigint, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const grants = pgTable('grants', {
  id: serial('id').primaryKey(),

  // ── Identity ────────────────────────────────────────────────────────────────
  external_id: integer('external_id'),
  // Full "Issuer — Programme Name" string from the spreadsheet; used as the
  // stable upsert key (all rows are unique on this value).
  full_name: text('full_name').notNull().unique(),
  programme_name: text('programme_name').notNull(),
  agency: text('agency'),
  website_url: text('website_url'),

  // ── Financing type ───────────────────────────────────────────────────────────
  // Detailed description from "Financing Type Notes" column
  financing_type: text('financing_type').notNull(),
  // Filter categories from "Type of Financing" column (can be multi-value, e.g. Grant + Crowdfunding)
  financing_type_categories: text('financing_type_categories').array().notNull(),

  // ── Total pool ───────────────────────────────────────────────────────────────
  total_pool_raw: text('total_pool_raw'),
  total_pool_rm: bigint('total_pool_rm', { mode: 'number' }),

  // ── Ticket size ──────────────────────────────────────────────────────────────
  // Notes columns store the human-readable context text from the spreadsheet
  ticket_size_min_notes: text('ticket_size_min_notes'),
  ticket_size_min_rm: bigint('ticket_size_min_rm', { mode: 'number' }),
  ticket_size_max_notes: text('ticket_size_max_notes'),
  ticket_size_max_rm: bigint('ticket_size_max_rm', { mode: 'number' }),

  // ── Cost of capital ──────────────────────────────────────────────────────────
  cost_of_capital_raw: text('cost_of_capital_raw'),
  cost_of_capital_pct_min: numeric('cost_of_capital_pct_min', { precision: 5, scale: 2 }),
  cost_of_capital_pct_max: numeric('cost_of_capital_pct_max', { precision: 5, scale: 2 }),

  // ── Tenure ───────────────────────────────────────────────────────────────────
  tenure_raw: text('tenure_raw'),
  tenure_years_min: numeric('tenure_years_min', { precision: 5, scale: 1 }),
  tenure_years_max: numeric('tenure_years_max', { precision: 5, scale: 1 }),

  // ── Grace period ─────────────────────────────────────────────────────────────
  grace_period_raw: text('grace_period_raw'),
  grace_period_months: integer('grace_period_months'),

  // ── Eligibility ──────────────────────────────────────────────────────────────
  shariah_compliant: text('shariah_compliant'), // 'Yes' | 'No' | 'Both'
  value_chain_segments: text('value_chain_segments').array(),
  permitted_uses: text('permitted_uses').array(),
  ownership_requirement_raw: text('ownership_requirement_raw'),
  company_stage_raw: text('company_stage_raw'),
  // Recognized stage values for filtering (subset of company_stage_raw)
  company_stages: text('company_stages').array(),

  // ── Operational ─────────────────────────────────────────────────────────────
  collateral_raw: text('collateral_raw'),
  application_cycle: text('application_cycle'),
  example_recipients: text('example_recipients'),
  notes: text('notes'),

  // ── Sync metadata ────────────────────────────────────────────────────────────
  last_synced_at: timestamp('last_synced_at', { withTimezone: true }).notNull(),
  archived_at: timestamp('archived_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Grant = typeof grants.$inferSelect;
export type NewGrant = typeof grants.$inferInsert;
