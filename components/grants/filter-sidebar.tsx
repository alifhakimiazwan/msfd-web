'use client';

import { Check, ChevronsUpDown, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const FINANCING_CATEGORIES = [
  'Grant',
  'Soft Loan',
  'Equity',
  'Venture Capital',
  'Tax Incentive',
  'Export Credit',
  'Incubator / Accelerator',
  'Crowdfunding',
] as const;

const COMPANY_STAGES = [
  'Pre-revenue',
  'Early-stage (Seed–Series A)',
  'SME (revenue-generating)',
  'Growth-stage',
  'Established',
] as const;

const SHARIAH_OPTIONS = ['Yes', 'No', 'Both'] as const;

interface FilterSidebarProps {
  segments: string[];
  uses: string[];
  stages: string[];
}

function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getMulti = (key: string) => searchParams.getAll(key);

  const setMulti = useCallback(
    (key: string, values: string[]) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete(key);
      values.forEach((v) => next.append(key, v));
      router.replace(`/?${next.toString()}`);
    },
    [router, searchParams]
  );

  const setSingle = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      router.replace(`/?${next.toString()}`);
    },
    [router, searchParams]
  );

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const current = searchParams.getAll(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setMulti(key, next);
    },
    [searchParams, setMulti]
  );

  return { getMulti, setMulti, setSingle, toggleMulti, searchParams };
}

function MultiSelectPopover({
  label,
  options,
  selectedValues,
  onToggle,
}: {
  label: string;
  param: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedValues.length > 0 ? (
            <span className="flex items-center gap-1.5">
              {label}
              <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-xs">
                {selectedValues.length}
              </Badge>
            </span>
          ) : (
            <span className="text-muted-foreground">Select {label.toLowerCase()}…</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}…`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => onToggle(option)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedValues.includes(option) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FilterContent({ segments, uses }: FilterSidebarProps) {
  const { getMulti, setSingle, toggleMulti, searchParams } = useFilters();

  const selectedCategories = getMulti('category');
  const selectedSegments = getMulti('segment');
  const selectedUses = getMulti('use');
  const selectedStages = getMulti('stage');
  const selectedShariah = getMulti('shariah');
  const minTicket = searchParams.get('min') ?? '';
  const maxTicket = searchParams.get('max') ?? '';

  return (
    <div className="space-y-5">
      {/* Financing Type */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Financing Type
        </Label>
        <div className="space-y-1.5">
          {FINANCING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleMulti('category', cat)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors',
                selectedCategories.includes(cat)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Check
                className={cn('h-3.5 w-3.5 shrink-0', selectedCategories.includes(cat) ? 'opacity-100' : 'opacity-0')}
              />
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Company Stage */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Company Stage
        </Label>
        <div className="space-y-1.5">
          {COMPANY_STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => toggleMulti('stage', stage)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors',
                selectedStages.includes(stage)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Check
                className={cn('h-3.5 w-3.5 shrink-0', selectedStages.includes(stage) ? 'opacity-100' : 'opacity-0')}
              />
              {stage}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Value Chain Segment */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Value Chain Segment
        </Label>
        <MultiSelectPopover
          label="Segments"
          param="segment"
          options={segments}
          selectedValues={selectedSegments}
          onToggle={(v) => toggleMulti('segment', v)}
        />
      </div>

      <Separator />

      {/* Permitted Use */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Permitted Use of Funds
        </Label>
        <MultiSelectPopover
          label="Uses"
          param="use"
          options={uses}
          selectedValues={selectedUses}
          onToggle={(v) => toggleMulti('use', v)}
        />
      </div>

      <Separator />

      {/* Ticket Size */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Ticket Size (RM)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="min-ticket" className="text-xs text-muted-foreground">Min</Label>
            <Input
              id="min-ticket"
              type="number"
              placeholder="e.g. 50000"
              value={minTicket}
              className="mt-1 h-8 text-sm"
              onChange={(e) => setSingle('min', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="max-ticket" className="text-xs text-muted-foreground">Max</Label>
            <Input
              id="max-ticket"
              type="number"
              placeholder="e.g. 5000000"
              value={maxTicket}
              className="mt-1 h-8 text-sm"
              onChange={(e) => setSingle('max', e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Shariah */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Shariah Compliant
        </Label>
        <div className="flex gap-2 flex-wrap">
          {SHARIAH_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleMulti('shariah', opt)}
              className={cn(
                'rounded-md border px-3 py-1 text-sm transition-colors',
                selectedShariah.includes(opt)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar(props: FilterSidebarProps) {
  return (
    <aside className="hidden md:block w-60 shrink-0">
      <div className="sticky top-[57px] overflow-y-auto max-h-[calc(100vh-57px)] py-6 pr-4">
        <h2 className="font-semibold mb-4 text-sm">Filters</h2>
        <FilterContent {...props} />
      </div>
    </aside>
  );
}

export function MobileFilterSheet(props: FilterSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <FilterContent {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
