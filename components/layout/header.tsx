import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { SyncButton } from './sync-button';
import { Separator } from '@/components/ui/separator';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold tracking-tight">MSFD</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Malaysian Semiconductor Financing Directory
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SyncButton />
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </header>
  );
}
