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
  eachWeekOfInterval,
  addMonths,
  subMonths,
} from 'date-fns';
import { ITask } from '@/models/Task';

type ViewMode = 'week' | 'month';

export default function TimelineView() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isLoading, setIsLoading] = useState(true);

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

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (task.startAt && task.dueAt) {
        const start = new Date(task.startAt);
        const end = new Date(task.dueAt);
        return date >= start && date <= end;
      } else if (task.dueAt) {
        return isSameDay(new Date(task.dueAt), date);
      } else if (task.startAt) {
        return isSameDay(new Date(task.startAt), date);
      }
      return false;
    });
  };

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
  // };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    // const weekTasks = getTasksForWeek(weekStart);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isToday = isSameDay(day, new Date());

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
                      className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-xs"
                    >
                      <div className="font-medium truncate">{task.title}</div>
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

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="space-y-4">
        {weeks.map((weekStart, weekIndex) => {
          const weekEnd = endOfWeek(weekStart);
          const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
          // const weekTasks = getTasksForWeek(weekStart);

          return (
            <div key={weekStart.toISOString()} className="space-y-2">
              <div className="text-sm font-medium text-slate-600">
                Week {weekIndex + 1}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const dayTasks = getTasksForDate(day);
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
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task._id}
                            className="p-1 bg-white border border-slate-200 rounded text-xs truncate"
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-slate-500 text-center">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {viewMode === 'week'
              ? format(currentDate, 'MMM d, yyyy')
              : format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {viewMode === 'week' ? renderWeekView() : renderMonthView()}
        </CardContent>
      </Card>
    </div>
  );
}
