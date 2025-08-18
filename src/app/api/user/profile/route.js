import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { updateProfileSchema } from '@/lib/validations';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import { withAuth, withValidation, withErrorHandling } from '@/lib/middleware';
import { apiRateLimit } from '@/lib/rateLimiter';

const getHandler = withErrorHandling(withAuth(async (request) => {
  const user = await User.findById(request.session.user.id)
    .select('-password -resetPasswordToken');

  if (!user) {
    return notFoundResponse('User not found');
  }

  return successResponse(user);
}));

const putHandler = withErrorHandling(withAuth(withValidation(updateProfileSchema)(async (request) => {
  const updateData = request.validatedData;
  
  const user = await User.findByIdAndUpdate(
    request.session.user.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password -resetPasswordToken');

  if (!user) {
    return notFoundResponse('User not found');
  }

  return successResponse(user, 'Profile updated successfully');
})));

export const GET = apiRateLimit(getHandler);
export const PUT = apiRateLimit(putHandler);