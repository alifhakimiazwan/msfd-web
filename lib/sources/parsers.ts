import type { ShariahCompliant } from './types';

// ── Money ─────────────────────────────────────────────────────────────────────

/**
 * Parses strings like "RM100,000", "RM5 million", "RM25B" into RM integers.
 * Returns null for "Not publicly disclosed", unparseable text, or empty input.
 */
export function parseRMAmount(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/RM\s*([0-9,]+(?:\.[0-9]+)?)\s*(billion|B|million|M|thousand|K)?/i);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ''));
  const suffix = (match[2] ?? '').toLowerCase();
  if (suffix === 'billion' || suffix === 'b') return Math.round(num * 1_000_000_000);
  if (suffix === 'million' || suffix === 'm') return Math.round(num * 1_000_000);
  if (suffix === 'thousand' || suffix === 'k') return Math.round(num * 1_000);
  return Math.round(num);
}

// ── Cost of capital ────────────────────────────────────────────────────────────

export function parseCostOfCapital(
  raw: string | null | undefined
): { min: number | null; max: number | null } {
  const none = { min: null, max: null };
  if (!raw) return none;

  const s = raw.trim();

  // Explicit 0% grant/matching
  if (/^0%/.test(s) || /non-repayable|outright grant|matching grant/i.test(s)) {
    return { min: 0, max: 0 };
  }

  // Equity / IRR / tax — not an interest rate
  if (/equity|IRR|tax|dilution|stake/i.test(s) && !/p\.a\./i.test(s)) return none;

  // Range: "3%–5% p.a." or "3%-5%"
  const rangeMatch = s.match(/([0-9]+(?:\.[0-9]+)?)\s*%\s*[–\-]\s*([0-9]+(?:\.[0-9]+)?)\s*%/);
  if (rangeMatch) return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };

  // "up to X%"
  const upToMatch = s.match(/up to\s+([0-9]+(?:\.[0-9]+)?)\s*%/i);
  if (upToMatch) return { min: 0, max: parseFloat(upToMatch[1]) };

  // Single "X% p.a."
  const singleMatch = s.match(/([0-9]+(?:\.[0-9]+)?)\s*%\s*p\.a\./i);
  if (singleMatch) {
    const v = parseFloat(singleMatch[1]);
    return { min: v, max: v };
  }

  return none;
}

// ── Tenure ────────────────────────────────────────────────────────────────────

export function parseTenureYears(
  raw: string | null | undefined
): { min: number | null; max: number | null } {
  const none = { min: null, max: null };
  if (!raw) return none;

  const rangeMatch = raw.match(/(\d+(?:\.\d+)?)\s*[–\-]\s*(\d+(?:\.\d+)?)\s*years?/i);
  if (rangeMatch) return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };

  const upToMatch = raw.match(/up to\s+(\d+(?:\.\d+)?)\s*years?/i);
  if (upToMatch) return { min: 0, max: parseFloat(upToMatch[1]) };

  const singleMatch = raw.match(/(\d+(?:\.\d+)?)\s*years?/i);
  if (singleMatch) { const v = parseFloat(singleMatch[1]); return { min: v, max: v }; }

  return none;
}

// ── Grace period ─────────────────────────────────────────────────────────────

export function parseGracePeriodMonths(raw: string | null | undefined): number | null {
  if (!raw || /n\/a|none/i.test(raw)) return null;

  const monthsMatch = raw.match(/(\d+)\s*months?/i);
  if (monthsMatch) return parseInt(monthsMatch[1], 10);

  const yearRangeMatch = raw.match(/(\d+)\s*[–\-]\s*\d+\s*years?/i);
  if (yearRangeMatch) return parseInt(yearRangeMatch[1], 10) * 12;

  const yearMatch = raw.match(/(\d+)\s*years?/i);
  if (yearMatch) return parseInt(yearMatch[1], 10) * 12;

  return null;
}

// ── Shariah ───────────────────────────────────────────────────────────────────

export function normalizeShariahCompliant(
  raw: string | null | undefined
): ShariahCompliant | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (s.startsWith('both') || /conventional.*islamic|islamic.*conventional/i.test(raw)) {
    return 'Both';
  }
  if (s.startsWith('yes') || /shariah-compliant/i.test(raw)) return 'Yes';
  if (s.startsWith('no')) return 'No';
  // Platforms listed separately: treat mixed-platform entries as Both
  if (/ethis.*conventional|conventional.*ethis/i.test(raw)) return 'Both';
  return null;
}

// ── Multi-value arrays ────────────────────────────────────────────────────────

/** Splits \r\n or \n delimited cell text into a cleaned string array. */
export function splitMultiValue(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\r\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Splits comma-delimited cell text into a cleaned string array. */
export function splitByComma(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Company stage ─────────────────────────────────────────────────────────────

export const RECOGNIZED_STAGES = new Set([
  'Pre-revenue',
  'Early-stage (Seed–Series A)',
  'SME (revenue-generating)',
  'Growth-stage',
  'Established',
]);

/** Parses "Growth-stage, Established" into recognized stage values only. */
export function parseCompanyStages(raw: unknown): string[] {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter((s) => RECOGNIZED_STAGES.has(s));
}

// ── Issuer / Programme Name split ─────────────────────────────────────────────

const KNOWN_AGENCIES = [
  'BPMB', 'BNM', 'KWAP', 'MIDA', 'MTDC', 'MRANTI',
  'SME Corp', 'SC Malaysia', 'Khazanah', 'Cradle Fund',
  'SME Bank', 'EXIM Bank', 'Angel Tax Incentive',
];

/**
 * Splits "Khazanah — Dana Impak" into { agency: 'Khazanah', programmeName: 'Dana Impak' }.
 * When the first segment starts with a known agency name, it is the agency.
 * Otherwise the first segment is the programme name and the second is the agency.
 */
export function splitIssuerName(full: string): { agency: string; programmeName: string } {
  const idx = full.indexOf(' — ');
  if (idx === -1) return { agency: '', programmeName: full };

  const first = full.slice(0, idx).trim();
  const rest = full.slice(idx + 3).trim();

  const firstIsAgency = KNOWN_AGENCIES.some((a) => first === a || first.startsWith(a));
  return firstIsAgency
    ? { agency: first, programmeName: rest }
    : { agency: rest, programmeName: first };
}

// ── Clean raw cell value ──────────────────────────────────────────────────────

/** Returns null for empty/whitespace/N/A-like strings. */
export function cleanText(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s || s === 'N/A' || s === '-') return null;
  return s;
}
