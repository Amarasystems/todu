'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { ITask } from '@/models/Task';
import { useTranslation } from '@/lib/hooks/use-translation';
import { useSession } from 'next-auth/react';

type ViewMode = 'week' | 'month';
type TimelineMode = 'personal' | 'global' | 'calendar';

export default function TimelineView() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [timelineMode, setTimelineMode] = useState<TimelineMode>('personal');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Generate consistent colors for users
  const getUserColor = (userId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    const hash = userId.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Get all unique tags from tasks
  const getAllTags = () => {
    const allTags = new Set<string>();
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  // Filter tasks by selected tag
  const getFilteredTasks = (taskList: ITask[]) => {
    if (selectedTag === 'all') return taskList;
    return taskList.filter((task) => task.tags?.includes(selectedTag));
  };

  const fetchTasks = async () => {
    try {
      // Fetch all tasks for global view
      const response = await fetch('/api/tasks?scope=all');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        console.log('Timeline: Fetched tasks:', data.length);
        console.log('Timeline: Sample task:', data[0]);
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

  // const getTasksForWeek = (weekStart: Date) => {
  //   const weekEnd = endOfWeek(weekStart);
  //   return tasks.filter(task => {
  //     if (task.startAt && task.dueAt) {
  //       const start = new Date(task.startAt);
  //       const end = new Date(task.dueAt);
  //       return (start <= weekEnd && end >= weekStart);
  //     } else if (task.dueAt) {
  //       const due = new Date(task.dueAt);
  //       return due >= weekStart && due <= weekEnd;
  //     } else if (task.startAt) {
  //       const start = new Date(task.startAt);
  //       return start >= weekStart && start <= weekEnd;
  //     }
  //     return false;
  //   });
  //   };

  const renderCleanCalendar = () => {
    // Clean calendar view without tasks - just dates
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {t('timeline.cleanCalendar')}
          </h3>
          <p className="text-sm text-slate-500">
            {t('timeline.cleanCalendarDescription')}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div key={day.toISOString()} className="space-y-2">
                <div
                  className={`text-center p-3 rounded-lg ${
                    isToday
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : isWeekend
                        ? 'bg-slate-50 text-slate-600'
                        : 'bg-white text-slate-900'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>

                <div className="min-h-32 p-2 border border-slate-200 rounded-lg bg-slate-50/50">
                  {/* Empty space for clean calendar */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPersonalTimeline = () => {
    // Show only current user's tasks, filtered by tag
    const allUserTasks = tasks.filter((task) => {
      const taskUserId =
        typeof task.userId === 'string'
          ? task.userId
          : task.userId._id || task.userId.toString();
      return taskUserId === session?.user?.id;
    });
    const personalTasks = getFilteredTasks(allUserTasks);

    console.log('Personal Timeline Debug:');
    console.log('Current date:', currentDate);
    console.log('Current month:', currentDate.getMonth() + 1); // +1 because months are 0-indexed
    console.log('Session user ID:', session?.user?.id);
    console.log('Total tasks:', tasks.length);
    console.log('User tasks before filtering:', allUserTasks.length);
    console.log('User tasks after tag filtering:', personalTasks.length);
    console.log('Sample user task:', allUserTasks[0]);
    console.log('Sample task userId:', allUserTasks[0]?.userId);
    console.log('Sample task dates:', {
      startAt: allUserTasks[0]?.startAt,
      dueAt: allUserTasks[0]?.dueAt,
      startDate: allUserTasks[0]?.startAt
        ? new Date(allUserTasks[0].startAt)
        : null,
      dueDate: allUserTasks[0]?.dueAt ? new Date(allUserTasks[0].dueAt) : null,
    });

    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        {/* Personal Header */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full ${getUserColor(session?.user?.id || '')} flex items-center justify-center text-white font-bold text-sm`}
          >
            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              {t('timeline.myTimeline')}
            </h3>
            <p className="text-sm text-slate-500">
              {personalTasks.length} {t('board.tasks')}
            </p>
          </div>
        </div>

        {/* Personal Timeline */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            const dayTasks = personalTasks.filter((task) => {
              if (!task.startAt && !task.dueAt) return false;

              const startDate = task.startAt ? new Date(task.startAt) : null;
              const dueDate = task.dueAt ? new Date(task.dueAt) : null;

              // If task has both start and due dates, show it on all days in between
              if (startDate && dueDate) {
                return day >= startDate && day <= dueDate;
              }

              // If only start date, show on that day
              if (startDate && !dueDate) {
                return isSameDay(startDate, day);
              }

              // If only due date, show on that day
              if (!startDate && dueDate) {
                return isSameDay(dueDate, day);
              }

              return false;
            });

            return (
              <div key={day.toISOString()} className="space-y-2">
                <div
                  className={`text-center p-2 rounded-lg ${
                    isToday
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'bg-slate-100'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>

                <div className="space-y-1 min-h-32">
                  {dayTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`p-2 border rounded-lg shadow-sm text-xs ${
                        task.status === 'done'
                          ? 'bg-green-50 border-green-200'
                          : task.status === 'in_progress'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <div className="font-medium truncate flex-1">
                          {task.title}
                        </div>
                      </div>
                      {task.percent > 0 && (
                        <div className="mt-1">
                          <Progress value={task.percent} className="h-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGlobalTimeline = () => {
    // Group filtered tasks by user
    const filteredTasks = getFilteredTasks(tasks);
    const userTasks = filteredTasks.reduce(
      (acc, task) => {
        const taskUserId =
          typeof task.userId === 'string'
            ? task.userId
            : task.userId._id || task.userId.toString();
        if (!acc[taskUserId]) {
          acc[taskUserId] = {
            userId: taskUserId,
            userName: session?.user?.name || 'User',
            tasks: [],
          };
        }
        acc[taskUserId].tasks.push(task);
        return acc;
      },
      {} as Record<string, { userId: string; userName: string; tasks: ITask[] }>
    );

    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-6">
        {Object.values(userTasks).map((userData) => (
          <div key={userData.userId} className="space-y-2">
            {/* User Header */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full ${getUserColor(userData.userId)} flex items-center justify-center text-white font-bold text-sm`}
              >
                {userData.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {userData.userName}
                </h3>
                <p className="text-sm text-slate-500">
                  {userData.tasks.length} {t('board.tasks')}
                </p>
              </div>
            </div>

            {/* User Timeline */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day) => {
                const isToday = isSameDay(day, new Date());
                const dayTasks = userData.tasks.filter((task) => {
                  if (!task.startAt && !task.dueAt) return false;

                  const startDate = task.startAt
                    ? new Date(task.startAt)
                    : null;
                  const dueDate = task.dueAt ? new Date(task.dueAt) : null;

                  // If task has both start and due dates, show it on all days in between
                  if (startDate && dueDate) {
                    return day >= startDate && day <= dueDate;
                  }

                  // If only start date, show on that day
                  if (startDate && !dueDate) {
                    return isSameDay(startDate, day);
                  }

                  // If only due date, show on that day
                  if (!startDate && dueDate) {
                    return isSameDay(dueDate, day);
                  }

                  return false;
                });

                return (
                  <div key={day.toISOString()} className="space-y-2">
                    <div
                      className={`text-center p-2 rounded-lg ${
                        isToday
                          ? 'bg-blue-100 text-blue-900 font-semibold'
                          : 'bg-slate-100'
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-lg">{format(day, 'd')}</div>
                    </div>

                    <div className="space-y-1 min-h-32">
                      {dayTasks.map((task) => (
                        <div
                          key={task._id}
                          className={`p-2 border rounded-lg shadow-sm text-xs ${
                            task.status === 'done'
                              ? 'bg-green-50 border-green-200'
                              : task.status === 'in_progress'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <div className="font-medium truncate flex-1">
                              {task.title}
                            </div>
                          </div>
                          {task.percent > 0 && (
                            <div className="mt-1">
                              <Progress value={task.percent} className="h-1" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    // For month view, show filtered user timelines in a more compact format
    const filteredTasks = getFilteredTasks(tasks);
    const userTasks = filteredTasks.reduce(
      (acc, task) => {
        const taskUserId =
          typeof task.userId === 'string'
            ? task.userId
            : task.userId._id || task.userId.toString();
        if (!acc[taskUserId]) {
          acc[taskUserId] = {
            userId: taskUserId,
            userName: session?.user?.name || 'User',
            tasks: [],
          };
        }
        acc[taskUserId].tasks.push(task);
        return acc;
      },
      {} as Record<string, { userId: string; userName: string; tasks: ITask[] }>
    );

    return (
      <div className="space-y-6">
        {Object.values(userTasks).map((userData) => (
          <div key={userData.userId} className="space-y-4">
            {/* User Header */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full ${getUserColor(userData.userId)} flex items-center justify-center text-white font-bold text-sm`}
              >
                {userData.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {userData.userName}
                </h3>
                <p className="text-sm text-slate-500">
                  {userData.tasks.length} {t('board.tasks')}
                </p>
              </div>
            </div>

            {/* User Month Summary */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {eachDayOfInterval({
                start: startOfMonth(currentDate),
                end: endOfMonth(currentDate),
              }).map((day) => {
                const dayTasks = userData.tasks.filter((task) => {
                  if (!task.startAt && !task.dueAt) return false;

                  const startDate = task.startAt
                    ? new Date(task.startAt)
                    : null;
                  const dueDate = task.dueAt ? new Date(task.dueAt) : null;

                  // If task has both start and due dates, show it on all days in between
                  if (startDate && dueDate) {
                    return day >= startDate && day <= dueDate;
                  }

                  // If only start date, show on that day
                  if (startDate && !dueDate) {
                    return isSameDay(startDate, day);
                  }

                  // If only due date, show on that day
                  if (!startDate && dueDate) {
                    return isSameDay(dueDate, day);
                  }

                  return false;
                });
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth =
                  day.getMonth() === currentDate.getMonth();

                return (
                  <div key={day.toISOString()} className="space-y-1">
                    <div
                      className={`text-center p-1 rounded ${
                        isToday
                          ? 'bg-blue-100 text-blue-900 font-semibold'
                          : isCurrentMonth
                            ? 'text-slate-900'
                            : 'text-slate-400'
                      }`}
                    >
                      <div className="text-xs">{format(day, 'EEE')}</div>
                      <div className="text-sm">{format(day, 'd')}</div>
                    </div>

                    <div className="space-y-1 min-h-20">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task._id}
                          className={`p-1 border rounded text-xs ${
                            task.status === 'done'
                              ? 'bg-green-50 border-green-200'
                              : task.status === 'in_progress'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-slate-500 text-center">
                          +{dayTasks.length - 2} {t('common.more')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPersonalMonthView = () => {
    // Show only current user's tasks in month view, filtered by tag
    const allUserTasks = tasks.filter((task) => {
      const taskUserId =
        typeof task.userId === 'string'
          ? task.userId
          : task.userId._id || task.userId.toString();
      return taskUserId === session?.user?.id;
    });
    const personalTasks = getFilteredTasks(allUserTasks);

    console.log('Personal Month View Debug:');
    console.log('Session user ID:', session?.user?.id);
    console.log('Total tasks:', tasks.length);
    console.log('User tasks before filtering:', allUserTasks.length);
    console.log('User tasks after tag filtering:', personalTasks.length);

    return (
      <div className="space-y-4">
        {/* Personal Header */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full ${getUserColor(session?.user?.id || '')} flex items-center justify-center text-white font-bold text-sm`}
          >
            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              {t('timeline.myTimeline')}
            </h3>
            <p className="text-sm text-slate-500">
              {personalTasks.length} {t('board.tasks')}
            </p>
          </div>
        </div>

        {/* Personal Month Summary */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {eachDayOfInterval({
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate),
          }).map((day) => {
            const dayTasks = personalTasks.filter((task) => {
              if (!task.startAt && !task.dueAt) return false;

              const startDate = task.startAt ? new Date(task.startAt) : null;
              const dueDate = task.dueAt ? new Date(task.dueAt) : null;

              // If task has both start and due dates, show it on all days in between
              if (startDate && dueDate) {
                return day >= startDate && day <= dueDate;
              }

              // If only start date, show on that day
              if (startDate && !dueDate) {
                return isSameDay(startDate, day);
              }

              // If only due date, show on that day
              if (!startDate && dueDate) {
                return isSameDay(dueDate, day);
              }

              return false;
            });
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div key={day.toISOString()} className="space-y-1">
                <div
                  className={`text-center p-1 rounded ${
                    isToday
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : isCurrentMonth
                        ? 'text-slate-900'
                        : 'text-slate-400'
                  }`}
                >
                  <div className="text-xs">{format(day, 'EEE')}</div>
                  <div className="text-sm">{format(day, 'd')}</div>
                </div>

                <div className="space-y-1 min-h-20">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task._id}
                      className={`p-1 border rounded text-xs ${
                        task.status === 'done'
                          ? 'bg-green-50 border-green-200'
                          : task.status === 'in_progress'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <span className="truncate">{task.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dayTasks.length - 2} {t('common.more')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate((prev) =>
        direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
      );
    } else {
      setCurrentDate((prev) =>
        direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
      );
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToOctober = () => {
    setCurrentDate(new Date(2024, 9, 1)); // October 2024 (month is 0-indexed)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile-first responsive header */}
      <div className="space-y-4">
        {/* Title and date */}
        <div className="text-center lg:text-left">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
            {viewMode === 'week'
              ? format(currentDate, 'MMM d, yyyy')
              : format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>

        {/* Timeline mode buttons - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant={timelineMode === 'personal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimelineMode('personal')}
            className="w-full"
          >
            {t('timeline.personal')}
          </Button>
          <Button
            variant={timelineMode === 'global' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimelineMode('global')}
            className="w-full"
          >
            {t('timeline.global')}
          </Button>
          <Button
            variant={timelineMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimelineMode('calendar')}
            className="w-full"
          >
            {t('timeline.calendar')}
          </Button>
        </div>

        {/* View mode and navigation - responsive layout */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* View mode buttons */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="flex-1 sm:flex-none"
            >
              {t('timeline.week')}
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="flex-1 sm:flex-none"
            >
              {t('timeline.month')}
            </Button>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="flex-1 sm:flex-none"
            >
              {t('common.today')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToOctober}
              className="flex-1 sm:flex-none"
            >
              Oct 2024
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="flex-1 sm:flex-none"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tag Filter Controls - Mobile responsive */}
      {timelineMode !== 'calendar' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 block">
            {t('timeline.filterByTag')}:
          </label>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('timeline.allTags')}</option>
            {getAllTags().map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {timelineMode === 'calendar'
            ? renderCleanCalendar()
            : timelineMode === 'personal'
              ? viewMode === 'week'
                ? renderPersonalTimeline()
                : renderPersonalMonthView()
              : viewMode === 'week'
                ? renderGlobalTimeline()
                : renderMonthView()}
        </CardContent>
      </Card>
    </div>
  );
}
