'use client';

import { useRouter } from 'next/navigation';
import SchemeDetail from '@/components/schemes/scheme-detail';
import type { RankedScheme } from '@/lib/schemes/matcher';

interface BrowseSchemeDetailProps {
  schemeId: string;
  schemeName: string;
}

export default function BrowseSchemeDetail({ schemeId, schemeName }: BrowseSchemeDetailProps) {
  const router = useRouter();
  const scheme: RankedScheme = {
    id: schemeId,
    name: schemeName,
    score: 0,
    relevance: 'LOW',
    eligibilityStatus: 'UNKNOWN',
    reasons: [],
    matchedCriteria: [],
    unknownCriteria: [],
    followUpQuestions: [],
  };

  return (
    <SchemeDetail
      browseMode
      language="en"
      match={scheme}
      onBack={() => router.push('/schemes')}
      onDashboard={() => router.push('/')}
      schemeId={schemeId}
    />
  );
}
