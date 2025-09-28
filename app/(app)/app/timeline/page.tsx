'use client';

import TimelineView from '@/components/timeline/timeline-view';
import { useTranslation } from '@/lib/hooks/use-translation';

export default function TimelinePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('navigation.timeline')}
        </h1>
        <p className="text-slate-600">{t('timeline.description')}</p>
      </div>

      <TimelineView />
    </div>
  );
}
