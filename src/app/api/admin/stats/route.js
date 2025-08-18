import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Note from '@/models/Note';
import Group from '@/models/Group';
import Project from '@/models/Project';
import { successResponse } from '@/lib/response';
import { withAdminAuth, withErrorHandling } from '@/lib/middleware';
import { strictRateLimit } from '@/lib/rateLimiter';

const getHandler = withErrorHandling(withAdminAuth(async (request) => {
  // Get basic counts
  const [userCount, taskCount, noteCount, groupCount, projectCount] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments(),
    Note.countDocuments(),
    Group.countDocuments(),
    Project.countDocuments(),
  ]);

  // Get user registrations over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get task completion stats
  const taskStats = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get most active users (by task count)
  const activeUsers = await Task.aggregate([
    {
      $group: {
        _id: '$userId',
        taskCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        taskCount: 1
      }
    },
    {
      $sort: { taskCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  return successResponse({
    overview: {
      users: userCount,
      tasks: taskCount,
      notes: noteCount,
      groups: groupCount,
      projects: projectCount,
    },
    userRegistrations,
    taskStats: taskStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    activeUsers,
  });
}));

export const GET = strictRateLimit(getHandler);