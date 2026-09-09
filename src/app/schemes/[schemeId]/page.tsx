import { notFound } from 'next/navigation';
import BrowseSchemeDetail from '@/components/schemes/browse-scheme-detail';
import { catalog } from '@/lib/schemes/loader';

interface CatalogScheme {
  id: string;
  name: string;
}

const schemes = catalog.schemes as CatalogScheme[];

export function generateStaticParams() {
  return schemes.map((scheme) => ({ schemeId: scheme.id }));
}

export default async function BrowseSchemeDetailPage({
  params,
}: {
  params: Promise<{ schemeId: string }>;
}) {
  const { schemeId } = await params;
  const scheme = schemes.find((candidate) => candidate.id === schemeId);

  if (!scheme) notFound();

  return <BrowseSchemeDetail schemeId={scheme.id} schemeName={scheme.name} />;
}
