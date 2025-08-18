import { z } from 'zod';

// User validations
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const updatePasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});

// Task validations
export const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(200, 'Task name cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  dueDate: z.string().datetime('Invalid due date format'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  category: z.string().max(50, 'Category cannot exceed 50 characters').default('Uncategorized'),
  projectId: z.string().optional(),
  groupId: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['pending', 'completed', 'in-progress']).optional(),
});

// Note validations
export const createNoteSchema = z.object({
  title: z.string().min(1, 'Note title is required').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(1, 'Note content is required').max(10000, 'Content cannot exceed 10000 characters'),
  tags: z.array(z.string()).optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

// Project validations
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#3B82F6'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['active', 'completed', 'on-hold', 'cancelled']).optional(),
});

// Group validations
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  isPrivate: z.boolean().default(false),
});

export const joinGroupSchema = z.object({
  joinCode: z.string().min(6, 'Invalid join code').max(8, 'Invalid join code'),
});

// Profile validations
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters').optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    popupNotifications: z.boolean().optional(),
    reminderFrequency: z.string().optional(),
    aiPrioritization: z.boolean().optional(),
    aiReminderIntensity: z.string().optional(),
    grammarAutocorrection: z.boolean().optional(),
  }).optional(),
});

// Admin validations
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters').optional(),
  role: z.enum(['user', 'admin']).optional(),
  emailVerified: z.date().optional(),
});