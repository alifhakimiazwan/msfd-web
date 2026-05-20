import path from 'path';
import * as XLSX from 'xlsx';
import type { GrantsSource, ParsedGrantRow } from './types';
import {
  cleanText,
  normalizeShariahCompliant,
  parseCostOfCapital,
  parseCompanyStages,
  parseGracePeriodMonths,
  parseRMAmount,
  parseTenureYears,
  splitByComma,
  splitIssuerName,
} from './parsers';

const EXPECTED_HEADERS = [
  '#',
  'Issuer / Programme Name',
  'Type of Financing',
  'Financing\nType Notes',
  'Website / Application Link',
  'Total Pool / Mandate',
  'Ticket Min\n(RM)',
  'Ticket Min\nNotes',
  'Ticket Max\n(RM)',
  'Ticket Max\nNotes',
  'Cost of Capital',
  'Tenure',
  'Grace Period / Moratorium',
  'Shariah Compliant?',
  'Target Value Chain Segment',
  'Ownership Requirement',
  'Company Stage / Scale',
  'Permitted Use of Proceeds',
  'Collateral / Security',
  'Application Cycle',
  'Example Recipients',
  'Notes / Source',
] as const;

const HEADER_ROW_INDEX = 3; // Row 4 in Excel (0-indexed = 3)

export class LocalFileSource implements GrantsSource {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(process.cwd(), 'data', 'grants.xlsx');
  }

  async fetchRows(): Promise<ParsedGrantRow[]> {
    const wb = XLSX.readFile(this.filePath);
    const ws = wb.Sheets['Financing Directory'];
    if (!ws) throw new Error('Sheet "Financing Directory" not found in grants.xlsx');

    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      defval: null,
    }) as (unknown[] | null[])[];

    // Normalize headers: strip \r so Windows-saved Excel (\r\n) matches our \n constants
    const headerRow = (rawRows[HEADER_ROW_INDEX] as unknown[]).map((h) =>
      typeof h === 'string' ? h.replace(/\r/g, '') : h
    );
    const missingHeaders = EXPECTED_HEADERS.filter(
      (h) => !headerRow.includes(h)
    );
    if (missingHeaders.length > 0) {
      throw new Error(
        `grants.xlsx is missing expected headers: ${missingHeaders.join(', ')}\n` +
          `Found: ${headerRow.filter(Boolean).join(', ')}`
      );
    }

    // Build header→column-index map
    const colIndex = Object.fromEntries(
      EXPECTED_HEADERS.map((h) => [h, headerRow.indexOf(h)])
    ) as Record<(typeof EXPECTED_HEADERS)[number], number>;

    const get = (row: unknown[], h: (typeof EXPECTED_HEADERS)[number]): unknown =>
      row[colIndex[h]] ?? null;

    const parsed: ParsedGrantRow[] = [];

    for (let i = HEADER_ROW_INDEX + 1; i < rawRows.length; i++) {
      const row = rawRows[i] as unknown[];
      if (!row) continue;

      // Skip section-header rows: they have a string or null in the # column
      const rowNum = row[colIndex['#']];
      if (!rowNum || typeof rowNum !== 'number') continue;

      const fullName = cleanText(get(row, 'Issuer / Programme Name'));
      if (!fullName) continue;

      const { agency, programmeName } = splitIssuerName(fullName);
      const financingType = cleanText(get(row, 'Financing\nType Notes')) ?? '';
      const totalPoolRaw = cleanText(get(row, 'Total Pool / Mandate'));
      const cocRaw = cleanText(get(row, 'Cost of Capital'));
      const tenureRaw = cleanText(get(row, 'Tenure'));
      const graceRaw = cleanText(get(row, 'Grace Period / Moratorium'));
      const coc = parseCostOfCapital(cocRaw);
      const tenure = parseTenureYears(tenureRaw);

      // Ticket size: read numeric RM values directly; notes are separate columns
      const minRmRaw = get(row, 'Ticket Min\n(RM)');
      const maxRmRaw = get(row, 'Ticket Max\n(RM)');

      parsed.push({
        external_id: typeof rowNum === 'number' ? rowNum : null,
        full_name: fullName,
        programme_name: programmeName || fullName,
        agency: agency || null,
        website_url: cleanText(get(row, 'Website / Application Link')),

        financing_type: financingType,
        financing_type_categories: splitByComma(String(get(row, 'Type of Financing') ?? '')),

        total_pool_raw: totalPoolRaw,
        total_pool_rm: parseRMAmount(totalPoolRaw),

        ticket_size_min_notes: cleanText(get(row, 'Ticket Min\nNotes')),
        ticket_size_min_rm: typeof minRmRaw === 'number' ? Math.round(minRmRaw) : null,
        ticket_size_max_notes: cleanText(get(row, 'Ticket Max\nNotes')),
        ticket_size_max_rm: typeof maxRmRaw === 'number' ? Math.round(maxRmRaw) : null,

        cost_of_capital_raw: cocRaw,
        cost_of_capital_pct_min: coc.min,
        cost_of_capital_pct_max: coc.max,

        tenure_raw: tenureRaw,
        tenure_years_min: tenure.min,
        tenure_years_max: tenure.max,

        grace_period_raw: graceRaw,
        grace_period_months: parseGracePeriodMonths(graceRaw),

        shariah_compliant: normalizeShariahCompliant(cleanText(get(row, 'Shariah Compliant?'))),
        value_chain_segments: splitByComma(String(get(row, 'Target Value Chain Segment') ?? '')),
        permitted_uses: splitByComma(String(get(row, 'Permitted Use of Proceeds') ?? '')),
        ownership_requirement_raw: cleanText(get(row, 'Ownership Requirement')),
        company_stage_raw: cleanText(get(row, 'Company Stage / Scale')),
        company_stages: parseCompanyStages(get(row, 'Company Stage / Scale')),

        collateral_raw: cleanText(get(row, 'Collateral / Security')),
        application_cycle: cleanText(get(row, 'Application Cycle')),
        example_recipients: cleanText(get(row, 'Example Recipients')),
        notes: cleanText(get(row, 'Notes / Source')),
      });
    }

    return parsed;
  }
}
