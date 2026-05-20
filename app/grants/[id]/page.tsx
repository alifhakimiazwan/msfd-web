import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { grants } from "@/db/schema";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRM } from "@/components/grants/grant-card";
import type { Grant } from "@/db/schema";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function ArrayField({ items }: { items: string[] | null | undefined }) {
  if (!items || items.length === 0)
    return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="outline" className="font-normal">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function CostDisplay({ grant }: { grant: Grant }) {
  if (grant.cost_of_capital_raw)
    return <span className="font-medium">{grant.cost_of_capital_raw}</span>;
  return <span className="text-muted-foreground">—</span>;
}

function TicketDisplay({
  rm,
  notes,
}: {
  rm: number | null | undefined;
  notes: string | null | undefined;
}) {
  if (rm != null) return <span>{formatRM(rm)}</span>;
  if (notes) return <span>{notes}</span>;
  return null;
}

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grantId = parseInt(id, 10);
  if (isNaN(grantId)) notFound();

  const [grant] = await db
    .select()
    .from(grants)
    .where(eq(grants.id, grantId))
    .limit(1);
  if (!grant) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6">
        {/* Back link */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1.5"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to directory
          </Link>
        </Button>

        {/* Title block */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            {(grant.financing_type_categories ?? []).map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
            {grant.shariah_compliant && (
              <Badge variant="outline">
                Shariah: {grant.shariah_compliant}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {grant.programme_name}
          </h1>
          {grant.agency && (
            <p className="text-muted-foreground mt-1">{grant.agency}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1 italic">
            {grant.financing_type}
          </p>
        </div>

        {/* Apply CTA */}
        <div className="flex gap-3 mb-8">
          {grant.website_url ? (
            <Button asChild size="lg">
              <a
                href={grant.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply at Source
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button size="lg" disabled>
              Apply at Source
            </Button>
          )}
        </div>

        <Separator className="mb-6" />

        {/* Parameters */}
        <div className="rounded-lg border">
          <div className="px-4 py-3 bg-muted/50 rounded-t-lg">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Financial Parameters
            </h2>
          </div>
          <dl className="divide-y px-4">
            <DetailRow
              label="Total Pool / Mandate"
              value={grant.total_pool_raw}
            />
            <DetailRow
              label="Ticket Size (Min)"
              value={
                <TicketDisplay
                  rm={grant.ticket_size_min_rm}
                  notes={grant.ticket_size_min_notes}
                />
              }
            />
            <DetailRow
              label="Ticket Size (Max)"
              value={
                <TicketDisplay
                  rm={grant.ticket_size_max_rm}
                  notes={grant.ticket_size_max_notes}
                />
              }
            />
            <DetailRow
              label="Cost of Capital"
              value={<CostDisplay grant={grant} />}
            />
            <DetailRow label="Tenure" value={grant.tenure_raw} />
            <DetailRow label="Grace Period" value={grant.grace_period_raw} />
          </dl>
        </div>

        <div className="rounded-lg border mt-4">
          <div className="px-4 py-3 bg-muted/50 rounded-t-lg">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Eligibility
            </h2>
          </div>
          <dl className="divide-y px-4">
            <DetailRow
              label="Value Chain Segment"
              value={<ArrayField items={grant.value_chain_segments} />}
            />
            <DetailRow
              label="Ownership Requirement"
              value={grant.ownership_requirement_raw}
            />
            <DetailRow
              label="Company Stage / Scale"
              value={grant.company_stage_raw}
            />
          </dl>
        </div>

        <div className="rounded-lg border mt-4">
          <div className="px-4 py-3 bg-muted/50 rounded-t-lg">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Operational Parameters
            </h2>
          </div>
          <dl className="divide-y px-4">
            <DetailRow
              label="Permitted Use of Funds"
              value={<ArrayField items={grant.permitted_uses} />}
            />
            <DetailRow
              label="Collateral / Security"
              value={grant.collateral_raw}
            />
            <DetailRow
              label="Application Cycle"
              value={grant.application_cycle}
            />
            <DetailRow
              label="Example Recipients"
              value={grant.example_recipients}
            />
            <DetailRow
              label="Shariah Compliant"
              value={grant.shariah_compliant}
            />
          </dl>
        </div>

        {grant.notes && (
          <div className="rounded-lg border mt-4">
            <div className="px-4 py-3 bg-muted/50 rounded-t-lg">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Notes & Source
              </h2>
            </div>
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {grant.notes}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Last updated:{" "}
          {grant.last_synced_at
            ? new Date(grant.last_synced_at).toLocaleDateString("en-MY", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "—"}
        </p>
      </main>
    </div>
  );
}
