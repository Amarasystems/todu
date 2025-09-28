'use client';

import { useState, useEffect } from 'react';
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
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TaskDialog from './task-dialog';
import { ITask } from '@/models/Task';
import { format } from 'date-fns';

export default function AllTasksView() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data);
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

  useEffect(() => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

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
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === savedTask._id ? savedTask : t))
      );
    } else {
      setTasks((prevTasks) => [...prevTasks, savedTask]);
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="med">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(task.priority)}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>

                      {task.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
                          <span>{task.tags.join(', ')}</span>
                        </div>
                      )}

                      {task.startAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Start: {format(new Date(task.startAt), 'MMM d')}
                          </span>
                        </div>
                      )}

                      {task.dueAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Due: {format(new Date(task.dueAt), 'MMM d')}
                          </span>
                        </div>
                      )}
                    </div>

                    {task.items.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          {task.items.filter((item) => item.checked).length}/
                          {task.items.length} completed
                        </span>
                        <Progress
                          value={Math.round(
                            (task.items.filter((item) => item.checked).length /
                              task.items.length) *
                              100
                          )}
                          className="flex-1 h-2"
                        />
                      </div>
                    )}

                    {task.items.length === 0 && task.percent > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Progress</span>
                          <span>{task.percent}%</span>
                        </div>
                        <Progress value={task.percent} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        handleStatusChange(task._id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="backlog">Backlog</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTaskEdit(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTaskDelete(task._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    ? 'No tasks match your filters'
                    : 'No tasks yet. Create your first task to get started!'}
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
