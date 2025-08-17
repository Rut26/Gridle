import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    await connectDB();

    let query = { userId: session.user.id };

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('groupId', 'name')
      .sort({ dueDate: 1 });

    return NextResponse.json(tasks);

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, dueDate, priority, category, projectId, groupId } = data;

    if (!name || !dueDate) {
      return NextResponse.json(
        { message: 'Name and due date are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.create({
      name,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      category: category || 'Uncategorized',
      userId: session.user.id,
      projectId: projectId || null,
      groupId: groupId || null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name')
      .populate('groupId', 'name');

    return NextResponse.json(populatedTask, { status: 201 });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}