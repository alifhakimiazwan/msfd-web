import type { GrantsSource, ParsedGrantRow } from './types';

/**
 * TODO: SharePoint / Microsoft Graph implementation.
 *
 * When Azure AD credentials are available, implement this class to:
 *  1. Authenticate using ClientSecretCredential from @azure/identity
 *  2. Use @microsoft/microsoft-graph-client to fetch the Excel file by
 *     drive item path (SHAREPOINT_SITE_ID, SHAREPOINT_DRIVE_ID, SHAREPOINT_FILE_PATH)
 *  3. Download the workbook bytes and pass them to the same LocalFileSource
 *     parsing logic (or use the Graph /workbook/worksheets API directly).
 *
 * Docs:
 *   https://learn.microsoft.com/en-us/graph/api/driveitem-get-content
 *   https://learn.microsoft.com/en-us/graph/api/workbook-list-worksheets
 */
export class SharePointSource implements GrantsSource {
  constructor() {
    const required = [
      'AZURE_TENANT_ID',
      'AZURE_CLIENT_ID',
      'AZURE_CLIENT_SECRET',
      'SHAREPOINT_SITE_ID',
      'SHAREPOINT_DRIVE_ID',
      'SHAREPOINT_FILE_PATH',
    ];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(
        `SharePointSource requires environment variables: ${missing.join(', ')}`
      );
    }
  }

  async fetchRows(): Promise<ParsedGrantRow[]> {
    throw new Error(
      'SharePointSource is not yet implemented. Set GRANTS_SOURCE=local to use the local file.'
    );
  }
}
