import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/db';
import Task from '../../../models/Task';
import { taskSchema, getTasksQuerySchema } from '../../../lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = getTasksQuerySchema.parse({
      status: searchParams.get('status') || undefined,
      q: searchParams.get('q') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    });

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { userId: session.user.id };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.q) {
      filter.$or = [
        { title: { $regex: query.q, $options: 'i' } },
        { description: { $regex: query.q, $options: 'i' } },
      ];
    }

    if (query.from || query.to) {
      filter.$and = [];
      if (query.from) {
        filter.$and.push({
          $or: [
            { startAt: { $gte: query.from } },
            { dueAt: { $gte: query.from } },
          ],
        });
      }
      if (query.to) {
        filter.$and.push({
          $or: [{ startAt: { $lte: query.to } }, { dueAt: { $lte: query.to } }],
        });
      }
    }

    const tasks = await Task.find(filter).sort({ status: 1, order: 1 }).lean();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const taskData = taskSchema.parse(body);

    await connectDB();

    // Get the next order number for the status
    const lastTask = await Task.findOne(
      { userId: session.user.id, status: taskData.status },
      { order: 1 }
    ).sort({ order: -1 });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      ...taskData,
      userId: session.user.id,
      order,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
