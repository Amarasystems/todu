'use client';

import CompletedTasksView from '@/components/task/completed-tasks-view';
import { useTranslation } from '@/lib/hooks/use-translation';

export default function CompletedTasksPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('completed.title')}
        </h1>
        <p className="text-slate-600">{t('completed.description')}</p>
      </div>

      <CompletedTasksView />
    </div>
  );
}
