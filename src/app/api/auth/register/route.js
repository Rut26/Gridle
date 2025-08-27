import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { authRateLimit } from '@/lib/rateLimiter';

async function handler(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    const { name, email, password } = validatedData;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save middleware
    });

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return successResponse(userResponse, 'User registered successfully', 201);

  } catch (error) {
    if (error.name === 'ZodError') {
      return validationErrorResponse(error.errors);
    }
    
    if (error.code === 11000) {
      return errorResponse('User with this email already exists', 400);
    }

    console.error('Registration error:', error);
    return errorResponse('Registration failed');
  }
}

export const POST = authRateLimit(handler);