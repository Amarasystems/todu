'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TaskCard from '@/components/task/task-card';
import TaskDialog from '@/components/task/task-dialog';
import { ITask } from '@/models/Task';
import { useTranslation } from '@/lib/hooks/use-translation';
import { useSession } from 'next-auth/react';

const getColumns = (t: (key: string) => string) => [
  { id: 'backlog', title: t('board.backlog'), color: 'bg-slate-100' },
  { id: 'in_progress', title: t('board.inProgress'), color: 'bg-blue-100' },
  { id: 'done', title: t('board.done'), color: 'bg-green-100' },
];

interface KanbanColumnProps {
  column: { id: string; title: string; color: string };
  tasks: ITask[];
  onTaskEdit: (task: ITask) => void;
  onTaskDelete: (taskId: string) => void;
  t: (key: string) => string;
  canEditTask: (task: ITask) => boolean;
}

function KanbanColumn({
  column,
  tasks,
  onTaskEdit,
  onTaskDelete,
  t,
  canEditTask,
}: KanbanColumnProps) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const averageProgress =
    tasks.length > 0
      ? Math.round(
          tasks.reduce((sum, task) => sum + (task.percent || 0), 0) /
            tasks.length
        )
      : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="h-full">
        <CardHeader className={`${column.color} rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">
              {column.title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-600">
                {tasks.length} {t('board.tasks')}
              </span>
              {tasks.length > 0 && (
                <span className="text-xs text-slate-600">
                  • {averageProgress}% {t('board.averageProgress')}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <SortableContext
            items={tasks.map((task) => task._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 min-h-96">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                  canEdit={canEditTask(task)}
                />
              ))}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { data: session } = useSession();

  // Check if current user can edit/delete this task
  const canEditTask = (task: ITask) => {
    if (!session?.user?.id) return false;
    const taskUserId =
      typeof task.userId === 'object' ? task.userId._id : task.userId;
    return taskUserId.toString() === session.user.id;
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Find the task being moved
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    // Only allow users to move their own tasks
    if (!canEditTask(task)) return;

    // If moving to the same status, just reorder
    if (task.status === newStatus) {
      // For now, we'll just update the UI optimistically
      // In a real app, you'd call the reorder API
      return;
    }

    // Move between different statuses
    try {
      const response = await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromStatus: task.status,
          toStatus: newStatus,
          taskId: taskId,
          toIndex: 0, // Add to top of new column
        }),
      });

      if (response.ok) {
        // Update the task status optimistically
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId
              ? ({
                  ...t,
                  status: newStatus as 'backlog' | 'in_progress' | 'done',
                } as ITask)
              : t
          )
        );
      }
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleTaskEdit = (task: ITask) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleTaskSave = (savedTask: ITask) => {
    if (editingTask) {
      // Update existing task
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === savedTask._id ? savedTask : t))
      );
    } else {
      // Add new task
      setTasks((prevTasks) => [...prevTasks, savedTask]);
    }
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">{t('common.loading')}</div>
      </div>
    );
  }

  const columns = getColumns(t);

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              t={t}
              canEditTask={canEditTask}
            />
          ))}
        </div>
      </DndContext>

      <TaskDialog
        task={editingTask}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleTaskSave}
      />
    </>
  );
}
