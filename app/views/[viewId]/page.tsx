'use client';

import { use } from 'react';
import { ViewPage } from '@/components/views/view-page';

export default function ViewRoute({ params }: { params: Promise<{ viewId: string }> }) {
  const { viewId } = use(params);
  return <ViewPage viewId={viewId} />;
}
