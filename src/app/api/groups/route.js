import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Group from '@/models/Group';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const groups = await Group.find({
      $or: [
        { createdBy: session.user.id },
        { 'members.user': session.user.id }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });

    return NextResponse.json(groups);

  } catch (error) {
    console.error('Get groups error:', error);
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
    const { name, description, isPrivate } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Group name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const group = await Group.create({
      name,
      description,
      createdBy: session.user.id,
      isPrivate: isPrivate || false,
      members: [{
        user: session.user.id,
        role: 'admin',
      }],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    return NextResponse.json(populatedGroup, { status: 201 });

  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}