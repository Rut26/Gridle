import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { updateTaskSchema } from '@/lib/validations';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import { withAuth, withValidation, withErrorHandling } from '@/lib/middleware';
import { apiRateLimit } from '@/lib/rateLimiter';

const getHandler = withErrorHandling(withAuth(async (request, { params }) => {
  const task = await Task.findOne({ 
    _id: params.id, 
    userId: request.session.user.id 
  })
  .populate('projectId', 'name')
  .populate('groupId', 'name');

  if (!task) {
    return notFoundResponse('Task not found');
  }

  return successResponse(task);
}));

const putHandler = withErrorHandling(withAuth(withValidation(updateTaskSchema)(async (request, { params }) => {
  const updateData = request.validatedData;
  
  const task = await Task.findOneAndUpdate(
    { _id: params.id, userId: request.session.user.id },
    updateData,
    { new: true, runValidators: true }
  )
  .populate('projectId', 'name')
  .populate('groupId', 'name');

  if (!task) {
    return notFoundResponse('Task not found');
  }

  return successResponse(task, 'Task updated successfully');
})));

const deleteHandler = withErrorHandling(withAuth(async (request, { params }) => {
  const task = await Task.findOneAndDelete({ 
    _id: params.id, 
    userId: request.session.user.id 
  });

  if (!task) {
    return notFoundResponse('Task not found');
  }

  return successResponse(null, 'Task deleted successfully');
}));

export const GET = apiRateLimit(getHandler);
export const PUT = apiRateLimit(putHandler);
export const DELETE = apiRateLimit(deleteHandler);