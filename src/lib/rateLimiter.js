import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map();

export function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later.',
  } = options;

  return (handler) => {
    return async (request, context) => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old entries
      for (const [key, data] of rateLimitMap.entries()) {
        if (data.resetTime < now) {
          rateLimitMap.delete(key);
        }
      }
      
      const key = `${ip}:${request.url}`;
      const current = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };
      
      if (current.resetTime < now) {
        current.count = 0;
        current.resetTime = now + windowMs;
      }
      
      current.count++;
      rateLimitMap.set(key, current);
      
      if (current.count > max) {
        return NextResponse.json({
          success: false,
          error: message,
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString(),
          }
        });
      }
      
      const response = await handler(request, context);
      
      // Add rate limit headers to successful responses
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Limit', max.toString());
        response.headers.set('X-RateLimit-Remaining', (max - current.count).toString());
        response.headers.set('X-RateLimit-Reset', current.resetTime.toString());
      }
      
      return response;
    };
  };
}

// Specific rate limiters for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
});