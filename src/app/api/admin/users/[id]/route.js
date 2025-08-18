import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { updateUserSchema } from '@/lib/validations';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import { withAdminAuth, withValidation, withErrorHandling } from '@/lib/middleware';
import { strictRateLimit } from '@/lib/rateLimiter';

const putHandler = withErrorHandling(withAdminAuth(withValidation(updateUserSchema)(async (request, { params }) => {
  const updateData = request.validatedData;
  
  // Prevent admin from demoting themselves
  if (params.id === request.session.user.id && updateData.role === 'user') {
    return errorResponse('Cannot demote yourself from admin role', 400);
  }

  const user = await User.findByIdAndUpdate(
    params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password -resetPasswordToken');

  if (!user) {
    return notFoundResponse('User not found');
  }

  return successResponse(user, 'User updated successfully');
})));

const deleteHandler = withErrorHandling(withAdminAuth(async (request, { params }) => {
  // Prevent admin from deleting themselves
  if (params.id === request.session.user.id) {
    return errorResponse('Cannot delete your own account', 400);
  }

  const user = await User.findByIdAndDelete(params.id);

  if (!user) {
    return notFoundResponse('User not found');
  }

  return successResponse(null, 'User deleted successfully');
}));

export const PUT = strictRateLimit(putHandler);
export const DELETE = strictRateLimit(deleteHandler);