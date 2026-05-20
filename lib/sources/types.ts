export type FinancingTypeCategory =
  | 'Grant'
  | 'Soft Loan'
  | 'Equity'
  | 'Venture Capital'
  | 'Tax Incentive'
  | 'Export Credit'
  | 'Incubator / Accelerator'
  | 'Crowdfunding';

export type ShariahCompliant = 'Yes' | 'No' | 'Both';

/**
 * A single parsed, validated row ready to be upserted into the DB.
 * All monetary values are in RM (integers). Arrays are already split.
 */
export interface ParsedGrantRow {
  external_id: number | null;
  full_name: string;
  programme_name: string;
  agency: string | null;
  website_url: string | null;

  financing_type: string;
  financing_type_categories: string[];

  total_pool_raw: string | null;
  total_pool_rm: number | null;

  ticket_size_min_notes: string | null;
  ticket_size_min_rm: number | null;
  ticket_size_max_notes: string | null;
  ticket_size_max_rm: number | null;

  cost_of_capital_raw: string | null;
  cost_of_capital_pct_min: number | null;
  cost_of_capital_pct_max: number | null;

  tenure_raw: string | null;
  tenure_years_min: number | null;
  tenure_years_max: number | null;

  grace_period_raw: string | null;
  grace_period_months: number | null;

  shariah_compliant: ShariahCompliant | null;
  value_chain_segments: string[];
  permitted_uses: string[];
  ownership_requirement_raw: string | null;
  company_stage_raw: string | null;
  company_stages: string[];

  collateral_raw: string | null;
  application_cycle: string | null;
  example_recipients: string | null;
  notes: string | null;
}

export interface GrantsSource {
  fetchRows(): Promise<ParsedGrantRow[]>;
}
