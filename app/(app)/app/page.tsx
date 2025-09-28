'use client';

import KanbanBoard from '@/components/board/kanban-board';
import { useTranslation } from '@/lib/hooks/use-translation';

export default function AppPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('navigation.board')}
        </h1>
        <p className="text-slate-600">{t('board.dragToReorder')}</p>
      </div>

      <KanbanBoard />
    </div>
  );
}
