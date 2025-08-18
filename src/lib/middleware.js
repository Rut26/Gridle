import { auth } from '@/auth';
import { errorResponse, unauthorizedResponse, forbiddenResponse } from './response';
import { connectDB } from './mongodb';

export async function withAuth(handler) {
  return async (request, context) => {
    try {
      const session = await auth();
      if (!session) {
        return unauthorizedResponse('Authentication required');
      }

      await connectDB();
      
      // Add session to request context
      request.session = session;
      return handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return errorResponse('Authentication failed');
    }
  };
}

export async function withAdminAuth(handler) {
  return async (request, context) => {
    try {
      const session = await auth();
      if (!session) {
        return unauthorizedResponse('Authentication required');
      }

      if (session.user.role !== 'admin') {
        return forbiddenResponse('Admin access required');
      }

      await connectDB();
      
      // Add session to request context
      request.session = session;
      return handler(request, context);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return errorResponse('Authentication failed');
    }
  };
}

export function withValidation(schema) {
  return (handler) => {
    return async (request, context) => {
      try {
        const body = await request.json();
        const validatedData = schema.parse(body);
        
        // Add validated data to request
        request.validatedData = validatedData;
        return handler(request, context);
      } catch (error) {
        if (error.name === 'ZodError') {
          return validationErrorResponse(error.errors);
        }
        return errorResponse('Invalid request data');
      }
    };
  };
}

export function withErrorHandling(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.name === 'ValidationError') {
        return validationErrorResponse(Object.values(error.errors).map(e => e.message));
      }
      
      if (error.name === 'CastError') {
        return errorResponse('Invalid ID format', 400);
      }
      
      return errorResponse('Internal server error');
    }
  };
}