'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Calendar,
  CheckSquare,
  Tag,
  Edit,
  Trash2,
} from 'lucide-react';
import TaskDialog from './task-dialog';
import { ITask } from '@/models/Task';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/hooks/use-translation';
import { useSession } from 'next-auth/react';

export default function AllTasksView() {
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
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

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (scopeFilter !== 'all') params.append('scope', scopeFilter);
      if (searchQuery) params.append('q', searchQuery);

      const url = `/api/tasks?${params.toString()}`;
      console.log('Fetching tasks from:', url);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched tasks:', data);
        setFilteredTasks(data);
      } else {
        console.error(
          'Failed to fetch tasks:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, scopeFilter, searchQuery]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Initial load
  useEffect(() => {
    console.log('AllTasksView mounted, initial state:', {
      statusFilter,
      priorityFilter,
      scopeFilter,
      searchQuery,
    });
  }, []);

  const handleTaskEdit = (task: ITask) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!window.confirm(t('tasks.deleteTaskConfirm'))) return;

    // Optimistic UI update
    setFilteredTasks((prevTasks) =>
      prevTasks.filter((task) => task._id !== taskId)
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      fetchTasks(); // Re-fetch to ensure consistency
    } catch (error) {
      console.error('Failed to delete task:', error);
      fetchTasks(); // Revert optimistic update on error
    }
  };

  const handleTaskSave = (savedTask: ITask) => {
    if (editingTask) {
      setFilteredTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === savedTask._id ? savedTask : t))
      );
    } else {
      setFilteredTasks((prevTasks) => [...prevTasks, savedTask]);
    }
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setFilteredTasks((prevTasks) =>
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
      console.error('Failed to update task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'med':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog':
        return 'bg-slate-100 text-slate-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'done':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Mobile-first responsive layout */}
        <div className="space-y-4">
          {/* Search bar - full width on mobile */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('tasks.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters and New Task button - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Scope Filter */}
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.allTasks')}</SelectItem>
                <SelectItem value="my">{t('tasks.myTasks')}</SelectItem>
                <SelectItem value="global">{t('tasks.globalTasks')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.allStatus')}</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.allPriority')}</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="med">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            {/* New Task Button */}
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('tasks.newTask')}</span>
              <span className="sm:hidden">+</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Mobile-first responsive layout */}
                <div className="space-y-3">
                  {/* Header with priority and title */}
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityColor(task.priority)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {/* User information */}
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {typeof task.userId === 'object' &&
                            task.userId?.name
                              ? task.userId.name.charAt(0).toUpperCase()
                              : 'U'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {typeof task.userId === 'object' && task.userId?.name
                            ? task.userId.name
                            : 'Unknown User'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status and tags - responsive layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Badge className={`${getStatusColor(task.status)} w-fit`}>
                      {task.status.replace('_', ' ')}
                    </Badge>

                    {task.tags.length > 0 && (
                      <div className="flex items-center space-x-1 text-sm text-slate-600">
                        <Tag className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{task.tags.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Dates - responsive layout */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-slate-600">
                    {task.startAt && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          Start: {format(new Date(task.startAt), 'MMM d')}
                        </span>
                      </div>
                    )}

                    {task.dueAt && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          Due: {format(new Date(task.dueAt), 'MMM d')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Checklist progress */}
                  {task.items.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <span className="text-sm text-slate-600">
                          {task.items.filter((item) => item.checked).length}/
                          {task.items.length} completed
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
                  )}

                  {/* Manual progress */}
                  {task.items.length === 0 && task.percent > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Progress</span>
                        <span>{task.percent}%</span>
                      </div>
                      <Progress value={task.percent} className="h-2" />
                    </div>
                  )}

                  {/* Actions - responsive layout */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 border-t border-slate-100">
                    {/* Status selector - only show if user can edit */}
                    {canEditTask(task) && (
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          handleStatusChange(task._id, value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {/* Action buttons - only show if user can edit */}
                    {canEditTask(task) && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTaskEdit(task)}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="sm:hidden">Edit</span>
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTaskDelete(task._id)}
                          className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="sm:hidden">Delete</span>
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    )}

                    {/* Read-only indicator for other users' tasks */}
                    {!canEditTask(task) && (
                      <div className="flex items-center text-sm text-slate-500">
                        <span>Read-only view</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-slate-500">
                  {searchQuery ||
                  statusFilter !== 'all' ||
                  priorityFilter !== 'all'
                    ? t('tasks.noTasksFiltered')
                    : t('tasks.noTasks')}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
