import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from '../task-card';
import { ITask } from '@/models/Task';

const mockTask: ITask = {
  _id: '1',
  userId: 'user1',
  title: 'Test Task',
  description: 'Test description',
  status: 'backlog',
  order: 0,
  priority: 'med',
  startAt: new Date('2024-01-01'),
  dueAt: new Date('2024-01-10'),
  items: [
    { _id: '1', label: 'Item 1', checked: true },
    { _id: '2', label: 'Item 2', checked: false },
  ],
  percent: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TaskCard', () => {
  it('renders task title', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders checklist progress', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders priority indicator', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Priority indicator should be present (yellow dot for medium priority)
    const priorityDot = document.querySelector('.bg-yellow-500');
    expect(priorityDot).toBeInTheDocument();
  });
});
