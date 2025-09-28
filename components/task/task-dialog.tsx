'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Tag, CheckSquare, AlertCircle } from 'lucide-react';
import { ITask } from '@/models/Task';
import { format } from 'date-fns';

const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be less than 120 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  status: z.enum(['backlog', 'in_progress', 'done']),
  priority: z.enum(['low', 'med', 'high']),
  tags: z.array(z.string()),
  startAt: z.string().optional(),
  dueAt: z.string().optional(),
  percent: z.number().min(0).max(100).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface TaskDialogProps {
  task?: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ITask) => void;
}

export default function TaskDialog({
  task,
  isOpen,
  onClose,
  onSave,
}: TaskDialogProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'backlog',
      priority: 'med',
      percent: 0,
      tags: [],
    },
  });

  const watchedPercent = watch('percent', 0);
  const watchedTags = watch('tags', []);
  const hasChecklist = checklistItems.length > 0;
  const checklistProgress = hasChecklist
    ? Math.round(
        (checklistItems.filter((item) => item.checked).length /
          checklistItems.length) *
          100
      )
    : watchedPercent || 0;

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        tags: task.tags || [],
        startAt: task.startAt
          ? format(new Date(task.startAt), 'yyyy-MM-dd')
          : '',
        dueAt: task.dueAt ? format(new Date(task.dueAt), 'yyyy-MM-dd') : '',
        percent: task.percent,
      });
      setChecklistItems(
        task.items?.map((item) => ({
          id: item._id,
          label: item.label,
          checked: item.checked,
        })) || []
      );
    } else {
      reset({
        title: '',
        description: '',
        status: 'backlog',
        priority: 'med',
        tags: [],
        startAt: '',
        dueAt: '',
        percent: 0,
      });
      setChecklistItems([]);
    }
  }, [task, reset]);

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      label: '',
      checked: false,
    };
    setChecklistItems([...checklistItems, newItem]);
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklistItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems((items) => items.filter((item) => item.id !== id));
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        items: checklistItems.map((item) => ({
          label: item.label,
          checked: item.checked,
        })),
        percent: hasChecklist ? undefined : data.percent,
        startAt: data.startAt
          ? new Date(data.startAt).toISOString()
          : undefined,
        dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : undefined,
      };

      const url = task ? `/api/tasks/${task._id}` : '/api/tasks';
      const method = task ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const savedTask = await response.json();
        onSave(savedTask);
      } else {
        console.error('Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    'status',
                    value as 'backlog' | 'in_progress' | 'done'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                onValueChange={(value) =>
                  setValue('priority', value as 'low' | 'med' | 'high')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="med">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Enter task description"
              className="w-full min-h-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start Date</Label>
              <Input id="startAt" type="date" {...register('startAt')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueAt">Due Date</Label>
              <Input id="dueAt" type="date" {...register('dueAt')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4" />
                <span>Checklist</span>
              </Label>
              <Button
                type="button"
                onClick={addChecklistItem}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {checklistItems.length > 0 && (
              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) =>
                        updateChecklistItem(item.id, {
                          checked: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <Input
                      value={item.label}
                      onChange={(e) =>
                        updateChecklistItem(item.id, { label: e.target.value })
                      }
                      placeholder="Checklist item"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeChecklistItem(item.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Progress value={checklistProgress} className="flex-1 h-2" />
                  <span>{checklistProgress}%</span>
                </div>
              </div>
            )}

            {!hasChecklist && (
              <div className="space-y-2">
                <Label htmlFor="percent">Progress (%)</Label>
                <Input
                  id="percent"
                  type="number"
                  min="0"
                  max="100"
                  {...register('percent', { valueAsNumber: true })}
                  placeholder="0"
                />
                <div className="flex items-center space-x-2">
                  <Progress
                    value={watchedPercent || 0}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-slate-600">
                    {watchedPercent || 0}%
                  </span>
                </div>
              </div>
            )}

            {hasChecklist && (
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Progress is automatically calculated from checklist completion
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : task
                  ? 'Update Task'
                  : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
