import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AgencyLogo } from "@/components/grants/agency-logo";
import type { Grant } from "@/db/schema";

const CATEGORY_COLORS: Record<string, string> = {
  Grant:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Soft Loan":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Equity:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Venture Capital":
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  "Tax Incentive":
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Export Credit":
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Incubator / Accelerator":
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Crowdfunding:
    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

export function formatRM(amount: number | null | undefined): string {
  if (amount == null) return "N/A";
  if (amount >= 1_000_000_000)
    return `RM${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `RM${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `RM${(amount / 1_000).toFixed(0)}K`;
  return `RM${amount.toLocaleString()}`;
}

function TicketSize({ grant }: { grant: Grant }) {
  const minNotes = grant.ticket_size_min_notes;
  const maxNotes = grant.ticket_size_max_notes;
  const minParsed = grant.ticket_size_min_rm;
  const maxParsed = grant.ticket_size_max_rm;

  if (minParsed != null && maxParsed != null) {
    return (
      <span>
        {formatRM(minParsed)} – {formatRM(maxParsed)}
      </span>
    );
  }
  if (minParsed != null) return <span>{formatRM(minParsed)}+</span>;
  if (maxParsed != null) return <span>Up to {formatRM(maxParsed)}</span>;
  if (minNotes || maxNotes)
    return <span className="text-muted-foreground text-xs">Case-by-case</span>;
  return <span className="text-muted-foreground text-xs">—</span>;
}

function CostOfCapital({ grant }: { grant: Grant }) {
  if (
    grant.cost_of_capital_pct_min === "0" &&
    grant.cost_of_capital_pct_max === "0"
  ) {
    return <span>0% (Non-repayable)</span>;
  }
  const min = grant.cost_of_capital_pct_min;
  const max = grant.cost_of_capital_pct_max;
  if (min != null && max != null && min !== max)
    return (
      <span>
        {min}%–{max}% p.a.
      </span>
    );
  if (max != null) return <span>Up to {max}% p.a.</span>;
  if (min != null) return <span>{min}% p.a.</span>;
  return <span className="text-muted-foreground text-xs">Varies</span>;
}

export function GrantCard({ grant }: { grant: Grant }) {
  const primaryCategory = grant.financing_type_categories?.[0] ?? "";
  const categoryColor = CATEGORY_COLORS[primaryCategory] ?? "";

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow bg-muted/40">
      <CardHeader className="pb-1">
        <div className="flex items-start gap-3">
          {grant.agency && <AgencyLogo agency={grant.agency} />}
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug text-base">
              {grant.programme_name}
            </h3>
            {grant.agency && (
              <p className="text-sm text-muted-foreground">{grant.agency}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-3">
          <Badge className={`text-xs font-medium border-0 ${categoryColor}`}>
            {primaryCategory}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
          <div>
            <dt className="text-xs text-foreground uppercase tracking-wide">
              Ticket Size
            </dt>
            <dd className="text-xs text-muted-foreground mt-0.5">
              <TicketSize grant={grant} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-foreground uppercase tracking-wide">
              Cost
            </dt>
            <dd className="text-xs text-muted-foreground mt-0.5">
              <CostOfCapital grant={grant} />
            </dd>
          </div>
          {grant.tenure_raw && (
            <div className="col-span-2">
              <dt className="text-xs text-foreground uppercase tracking-wide">
                Tenure
              </dt>
              <dd className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {grant.tenure_raw}
              </dd>
            </div>
          )}
        </dl>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        {grant.website_url ? (
          <Button asChild size="sm" className="flex-1">
            <a
              href={grant.website_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        ) : (
          <Button size="sm" className="flex-1" disabled>
            Apply at Source
          </Button>
        )}
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/grants/${grant.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
