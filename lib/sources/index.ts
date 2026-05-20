import type { GrantsSource } from './types';

export type { GrantsSource, ParsedGrantRow, FinancingTypeCategory } from './types';

export function getGrantsSource(): GrantsSource {
  const source = process.env.GRANTS_SOURCE ?? 'local';

  if (source === 'local') {
    // Lazy import so xlsx is only loaded server-side
    const { LocalFileSource } = require('./local-file') as typeof import('./local-file');
    return new LocalFileSource();
  }

  if (source === 'sharepoint') {
    const { SharePointSource } = require('./sharepoint') as typeof import('./sharepoint');
    return new SharePointSource();
  }

  throw new Error(`Unknown GRANTS_SOURCE value: "${source}". Expected "local" or "sharepoint".`);
}
