import { getUniqueSegments, getUniqueUses } from '@/db/queries';
import { FilterSidebar, MobileFilterSheet } from './filter-sidebar';

export async function FilterSidebarLoader() {
  const [segments, uses] = await Promise.all([getUniqueSegments(), getUniqueUses()]);
  return <FilterSidebar segments={segments} uses={uses} stages={[]} />;
}

export async function MobileFilterSheetLoader() {
  const [segments, uses] = await Promise.all([getUniqueSegments(), getUniqueUses()]);
  return <MobileFilterSheet segments={segments} uses={uses} stages={[]} />;
}
