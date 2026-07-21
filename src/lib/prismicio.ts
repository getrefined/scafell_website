import * as prismic from '@prismicio/client';

export const repositoryName = 'scafellhotel';

export const client = prismic.createClient(repositoryName, { fetch });

/**
 * Fetch a single-type document's slices, returning null on any failure so
 * pages fall back to hardcoded content (site must build with Prismic down).
 */
export async function getPageSlices(type: string): Promise<any[] | null> {
  try {
    const doc = await client.getSingle(type as any);
    return (doc.data as any).slices ?? null;
  } catch {
    return null;
  }
}

/** Find the first slice of a given type in a fetched slice list. */
export function sliceOf(slices: any[] | null, type: string): any | undefined {
  return slices?.find((s) => s.slice_type === type);
}

/** All slices of a given type, in document order. */
export function slicesOf(slices: any[] | null, type: string): any[] {
  return slices?.filter((s) => s.slice_type === type) ?? [];
}
