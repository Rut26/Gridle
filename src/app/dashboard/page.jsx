// src/app/dashboard/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import { PlusIcon } from '../../components/ui/ClientLayout'; 
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const { data: session } = useSession();
  const [date, setDate] = useState(new Date()); 
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, notesRes, groupsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/notes'),
        fetch('/api/groups')
      ]);

      const [tasksData, notesData, groupsData] = await Promise.all([
        tasksRes.json(),
        notesRes.json(),
        groupsRes.json()
      ]);

      if (tasksData.success && notesData.success && groupsData.success) {
        const tasks = tasksData.data.tasks || [];
        const notes = notesData.data.notes || [];
        const groups = groupsData.data || [];

        // Calculate stats
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const dueTodayTasks = tasks.filter(t => {
          const today = new Date().toDateString();
          return new Date(t.dueDate).toDateString() === today;
        }).length;

        // Create chart data for last 7 days
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayTasks = tasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            return taskDate.toDateString() === date.toDateString();
          }).length;
          
          chartData.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            tasks: dayTasks
          });
        }

        // Get upcoming tasks as events
        const upcomingTasks = tasks
          .filter(t => new Date(t.dueDate) >= new Date())
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5)
          .map(t => ({
            date: new Date(t.dueDate),
            title: t.name,
            description: t.description,
            type: 'task',
            id: t._id
          }));

        setDashboardData({
          totalTasks,
          completedTasks,
          pendingTasks,
          dueTodayTasks,
          totalNotes: notes.length,
          totalGroups: groups.length,
          chartData,
          upcomingTasks,
          priorityTask: tasks.find(t => t.priority === 'High' && t.status === 'pending')
        });
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative h-full flex flex-col space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedDateEvents = dashboardData?.upcomingTasks?.filter(event =>
    event.date.getDate() === date.getDate() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  ) || [];

  const tileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dayEvents = dashboardData?.upcomingTasks?.filter(event =>
        event.date.getDate() === tileDate.getDate() &&
        event.date.getMonth() === tileDate.getMonth() &&
        event.date.getFullYear() === tileDate.getFullYear()
      ) || [];

      if (dayEvents.length > 0) {
        return <div className="event-dot"></div>;
      }
    }
    return null;
  };

  const handleGoToTasksPage = () => {
    router.push('/tasks');
  };

  const handleViewSpecificTaskDetails = (taskId) => {
    if (taskId) {
      router.push(`/tasks/${taskId}`);
    } else {
      console.warn("No Task ID provided for View Task Details button.");
    }
  };

  return (
    <div className="relative h-full flex flex-col space-y-6">
      <h2 className="text-3xl font-bold text-foreground mb-4">
        Good Morning, {session?.user?.name || 'User'}!
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-8">
            {dashboardData?.priorityTask ? (
              <>
                <h3 className="text-xl font-semibold mb-3">
                  Your Top Priority 
                  <span className="inline-flex items-center ml-2 px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                    High Priority
                  </span>
                </h3>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                  {dashboardData.priorityTask.name}
                </p>
                <p className="text-base text-muted-foreground mb-4">
                  Due: {new Date(dashboardData.priorityTask.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  {dashboardData.priorityTask.description}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-3">All Caught Up!</h3>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                  No high priority tasks pending
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Great job! You're on top of your tasks.
                </p>
              </>
            )}
            <button
              onClick={handleGoToTasksPage}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors duration-200 shadow-md"
            >
              Go to Tasks Page
            </button>
          </CardContent>
        </Card>

        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col justify-center items-center text-center">
              <span className="text-accent mb-2">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path>
                </svg>
              </span>
              <p className="text-sm text-muted-foreground mb-1">Tasks Due Today</p>
              <p className="text-4xl font-extrabold text-foreground">{dashboardData?.dueTodayTasks || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col justify-center items-center text-center">
              <span className="text-green-500 mb-2">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </span>
              <p className="text-sm text-muted-foreground mb-1">Completed Tasks</p>
              <p className="text-4xl font-extrabold text-foreground">{dashboardData?.completedTasks || 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData?.totalTasks || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData?.totalNotes || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData?.totalGroups || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData?.pendingTasks || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Creation Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines & Events</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={tileContent}
              className="w-full max-w-sm"
            />
            <div className="flex justify-end text-sm text-muted-foreground mt-4 w-full max-w-sm">
              <span className="flex items-center mr-4"><span className="w-3 h-3 bg-accent rounded-full mr-1"></span> Task/Event</span>
              <span className="flex items-center"><span className="w-3 h-3 bg-destructive rounded-full mr-1"></span> Overdue (Conceptual)</span>
            </div>
          </div>

          <div className="pt-0 md:pt-2">
            <h4 className="text-lg font-semibold text-foreground mb-4">Events for {date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground">No events or tasks scheduled for this date.</p>
            ) : (
              <ul className="space-y-3">
                {selectedDateEvents.map(event => (
                  <li key={event.id || event.title} className="bg-muted/30 p-4 rounded-lg flex items-center justify-between border border-border">
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    {event.type === 'task' && event.id && (
                      <button
                        onClick={() => handleViewSpecificTaskDetails(event.id)}
                        className="text-primary hover:underline text-sm ml-4 flex-shrink-0"
                      >
                        View Task
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </CardContent>
      </Card>

      <button className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-accent transition-colors duration-200 z-20">
        <PlusIcon /> 
      </button>
    </div>
  );
};

export default DashboardPage;