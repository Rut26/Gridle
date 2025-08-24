import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const tasks = await Task.find({ groupId: params.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tasks });

  } catch (error) {
    console.error('Get group tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}