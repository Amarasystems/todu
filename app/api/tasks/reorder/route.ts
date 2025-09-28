import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/db';
import Task from '../../../../models/Task';
import { reorderTaskSchema } from '../../../../lib/validations';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fromStatus, toStatus, taskId, toIndex } =
      reorderTaskSchema.parse(body);

    await connectDB();

    const task = await Task.findOne({ _id: taskId, userId: session.user.id });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // If moving within the same status, just reorder
    if (fromStatus === toStatus) {
      const tasks = await Task.find({
        userId: session.user.id,
        status: fromStatus,
        _id: { $ne: taskId },
      }).sort({ order: 1 });

      // Update order for all tasks
      const updatedTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        let newOrder = i;
        if (i >= toIndex) {
          newOrder = i + 1;
        }
        if (i < toIndex) {
          newOrder = i;
        }

        const updatedTask = await Task.findByIdAndUpdate(
          tasks[i]._id,
          { order: newOrder },
          { new: true }
        );
        updatedTasks.push(updatedTask);
      }

      // Update the moved task
      const updatedMovedTask = await Task.findByIdAndUpdate(
        taskId,
        { order: toIndex },
        { new: true }
      );

      return NextResponse.json({
        message: 'Tasks reordered successfully',
        tasks: [...updatedTasks, updatedMovedTask],
      });
    } else {
      // Moving between different statuses
      // First, update the moved task
      await Task.findByIdAndUpdate(taskId, {
        status: toStatus,
        order: toIndex,
      });

      // Reorder tasks in the source status (shift up)
      const sourceTasks = await Task.find({
        userId: session.user.id,
        status: fromStatus,
        order: { $gt: task.order },
      });

      for (const sourceTask of sourceTasks) {
        await Task.findByIdAndUpdate(sourceTask._id, {
          order: sourceTask.order - 1,
        });
      }

      // Reorder tasks in the target status (shift down)
      const targetTasks = await Task.find({
        userId: session.user.id,
        status: toStatus,
        order: { $gte: toIndex },
        _id: { $ne: taskId },
      });

      for (const targetTask of targetTasks) {
        await Task.findByIdAndUpdate(targetTask._id, {
          order: targetTask.order + 1,
        });
      }

      return NextResponse.json({
        message: 'Task moved successfully',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Reorder task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
