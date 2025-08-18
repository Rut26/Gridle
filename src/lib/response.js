import { NextResponse } from 'next/server';

export function successResponse(data = null, message = 'Success', status = 200) {
  return NextResponse.json({
    success: true,
    data,
    message,
  }, { status });
}

export function errorResponse(error = 'An error occurred', status = 500, details = null) {
  return NextResponse.json({
    success: false,
    error,
    details,
  }, { status });
}

export function validationErrorResponse(errors) {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    details: errors,
  }, { status: 400 });
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 403 });
}

export function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 404 });
}