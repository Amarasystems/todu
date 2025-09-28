'use client';

import AllTasksView from '@/components/task/all-tasks-view';
import { useTranslation } from '@/lib/hooks/use-translation';

export default function AllTasksPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('navigation.allTasks')}
        </h1>
        <p className="text-slate-600">{t('tasks.description')}</p>
      </div>

      <AllTasksView />
    </div>
  );
}
