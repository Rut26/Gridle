import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { createTaskSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/response';
import { withAuth, withValidation, withErrorHandling } from '@/lib/middleware';
import { apiRateLimit } from '@/lib/rateLimiter';

const getHandler = withErrorHandling(withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;

  let query = { userId: request.session.user.id };

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
    .sort({ dueDate: 1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Task.countDocuments(query);

  return successResponse({
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}));

const postHandler = withErrorHandling(withAuth(withValidation(createTaskSchema)(async (request) => {
  const { name, description, dueDate, priority, category, projectId, groupId } = request.validatedData;

  const task = await Task.create({
    name,
    description,
    dueDate: new Date(dueDate),
    priority,
    category,
    userId: request.session.user.id,
    projectId: projectId || null,
    groupId: groupId || null,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('projectId', 'name')
    .populate('groupId', 'name');

  return successResponse(populatedTask, 'Task created successfully', 201);
})));

export const GET = apiRateLimit(getHandler);
export const POST = apiRateLimit(postHandler);