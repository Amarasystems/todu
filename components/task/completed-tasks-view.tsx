'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  Calendar,
  Clock,
  BarChart3,
  Eye,
  Search,
} from 'lucide-react';
import { ITask } from '@/models/Task';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/hooks/use-translation';
import { Input } from '@/components/ui/input';

interface TaskDetailDialogProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
}

function TaskDetailDialog({ task, isOpen, onClose }: TaskDetailDialogProps) {
  const { t } = useTranslation();

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>{task.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">
                {t('tasks.status')}
              </label>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {t('tasks.done')}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                {t('tasks.priority')}
              </label>
              <div className="mt-1">
                <Badge
                  variant={
                    task.priority === 'high'
                      ? 'destructive'
                      : task.priority === 'med'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {t(`tasks.${task.priority}`)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="text-sm font-medium text-slate-600">
                {t('tasks.description')}
              </label>
              <p className="mt-1 text-slate-900">{task.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {task.startAt && (
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{t('tasks.startDate')}</span>
                </label>
                <p className="mt-1 text-slate-900">
                  {format(new Date(task.startAt), 'PPP')}
                </p>
              </div>
            )}
            {task.dueAt && (
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{t('tasks.dueDate')}</span>
                </label>
                <p className="mt-1 text-slate-900">
                  {format(new Date(task.dueAt), 'PPP')}
                </p>
              </div>
            )}
          </div>

          {/* Checklist */}
          {task.items && task.items.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>{t('tasks.checklist')}</span>
              </label>
              <div className="mt-2 space-y-2">
                {task.items.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-2 rounded ${
                      item.checked
                        ? 'bg-green-50 text-green-800'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CheckCircle
                      className={`h-4 w-4 ${
                        item.checked ? 'text-green-500' : 'text-slate-400'
                      }`}
                    />
                    <span className={item.checked ? 'line-through' : ''}>
                      {item.label}
                    </span>
                  </div>
                ))}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                    <span>{t('tasks.progress')}</span>
                    <span>
                      {Math.round(
                        (task.items.filter((item) => item.checked).length /
                          task.items.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (task.items.filter((item) => item.checked).length /
                        task.items.length) *
                        100
                    )}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Completion Info */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  {t('completed.completedOn')}:{' '}
                  {format(new Date(task.updatedAt), 'PPP')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>
                  {t('completed.finalProgress')}:{' '}
                  {task.items && task.items.length > 0
                    ? Math.round(
                        (task.items.filter((item) => item.checked).length /
                          task.items.length) *
                          100
                      )
                    : task.percent}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CompletedTasksView() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation();

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        const completedTasks = data.filter(
          (task: ITask) => task.status === 'done'
        );
        setTasks(completedTasks);
        setFilteredTasks(completedTasks);
      }
    } catch (error) {
      console.error('Failed to fetch completed tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [searchQuery, tasks]);

  const handleTaskClick = (task: ITask) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('completed.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                {filteredTasks.length} {t('completed.completedTasks')}
              </span>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <div className="text-slate-500">
                  {searchQuery
                    ? t('completed.noResultsFound')
                    : t('completed.noCompletedTasks')}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          {/* User information */}
                          <div className="flex items-center space-x-1 mb-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                {typeof task.userId === 'object' &&
                                task.userId?.name
                                  ? task.userId.name.charAt(0).toUpperCase()
                                  : 'U'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {typeof task.userId === 'object' &&
                              task.userId?.name
                                ? task.userId.name
                                : 'Unknown User'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {t('tasks.done')}
                        </Badge>
                        <Badge
                          variant={
                            task.priority === 'high'
                              ? 'destructive'
                              : task.priority === 'med'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {t(`tasks.${task.priority}`)}
                        </Badge>
                      </div>

                      {task.items && task.items.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>{t('tasks.checklist')}</span>
                            <span>
                              {Math.round(
                                (task.items.filter((item) => item.checked)
                                  .length /
                                  task.items.length) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={Math.round(
                              (task.items.filter((item) => item.checked)
                                .length /
                                task.items.length) *
                                100
                            )}
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-4">
                          {task.dueAt && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(new Date(task.dueAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Eye className="h-3 w-3" />
                          <span>{t('completed.viewDetails')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}
