import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Note from '@/models/Note';
import { createNoteSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/response';
import { withAuth, withValidation, withErrorHandling } from '@/lib/middleware';
import { apiRateLimit } from '@/lib/rateLimiter';

const getHandler = withErrorHandling(withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;

  let query = { userId: request.session.user.id, isArchived: false };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const notes = await Note.find(query)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Note.countDocuments(query);

  return successResponse({
    notes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}));

const postHandler = withErrorHandling(withAuth(withValidation(createNoteSchema)(async (request) => {
  const { title, content, tags } = request.validatedData;

  const note = await Note.create({
    title,
    content,
    tags: tags || [],
    userId: request.session.user.id,
  });

  return successResponse(note, 'Note created successfully', 201);
})));

export const GET = apiRateLimit(getHandler);
export const POST = apiRateLimit(postHandler);
  }
}