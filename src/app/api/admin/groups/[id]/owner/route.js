// app/api/admin/groups/[id]/owner/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Group from '@/models/Group';
import User from '@/models/User';
import { auth } from '@/auth';

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { newOwnerId } = await request.json();
    
    await connectDB();

    // Check if new owner exists
    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
      return NextResponse.json({ message: 'New owner not found' }, { status: 404 });
    }

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ message: 'Group not found' }, { status: 404 });
    }

    // Check if new owner is a member of the group
    const isMember = group.members.some(
      member => member.user.toString() === newOwnerId
    );

    if (!isMember) {
      return NextResponse.json({ message: 'New owner must be a group member' }, { status: 400 });
    }

    // Update group user
    group.user = newOwnerId;
    
    // Update member role if needed (make old user a regular member)
    const oldUserIndex = group.members.findIndex(
      member => member.user.toString() === group.user.toString()
    );
    
    if (oldUserIndex !== -1) {
      group.members[oldUserIndex].role = 'member';
    }

    // Ensure new owner has admin role
    const newOwnerIndex = group.members.findIndex(
      member => member.user.toString() === newOwnerId
    );
    
    if (newOwnerIndex !== -1) {
      group.members[newOwnerIndex].role = 'admin';
    }

    await group.save();

    // Populate the response with user details
    await group.populate('user', 'name email');
    await group.populate('members.user', 'name email');

    return NextResponse.json({ 
      message: 'Ownership transferred successfully',
      group 
    });

  } catch (error) {
    console.error('Reassign ownership error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}