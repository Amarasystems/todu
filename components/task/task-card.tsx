'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Calendar,
  CheckSquare,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ITask } from '@/models/Task';

interface TaskCardProps {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
  canEdit?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  canEdit = true,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d');
  };

  const checklistProgress =
    task.items.length > 0
      ? Math.round(
          (task.items.filter((item) => item.checked).length /
            task.items.length) *
            100
        )
      : task.percent;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isHovered ? 'shadow-md' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
            />
            <h3 className="font-medium text-slate-900 text-sm leading-tight">
              {task.title}
            </h3>
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task._id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {task.items.length > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <CheckSquare className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-600">
              {task.items.filter((item) => item.checked).length}/
              {task.items.length}
            </span>
            <Progress value={checklistProgress} className="flex-1 h-2" />
          </div>
        )}

        {task.items.length === 0 && task.percent > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Progress</span>
              <span>{task.percent}%</span>
            </div>
            <Progress value={task.percent} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            {task.startAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.startAt)}</span>
              </div>
            )}
            {task.dueAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueAt)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
