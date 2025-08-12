// src/app/dashboard/page.jsx
"use client";

import React, { useState } from 'react';
import Calendar from 'react-calendar';
// Removed ClientLayout import as it's provided by root layout.
// Only PlusIcon is imported if used directly.
import { PlusIcon } from '../../components/ui/ClientLayout'; 
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const [date, setDate] = useState(new Date()); 
  const router = useRouter();

  const events = [
    { date: new Date(2025, 6, 25), title: 'Project Proposal Due', description: 'Finalize and submit the Gridle v1.0 project proposal to stakeholders.', type: 'task', id: '1' },
    { date: new Date(2025, 6, 28), title: 'Client Meeting - UI/UX Review', description: 'Discuss feedback on dashboard wireframes with Client X.', type: 'event' },
    { date: new Date(2025, 6, 28), title: 'Team Sync Call', description: 'Weekly team meeting to review progress and assign new tasks.', type: 'event' },
    { date: new Date(2025, 7, 5), title: 'Feature Review - AI Prioritization', description: 'Internal review of the AI task prioritization algorithm and UI integration.', type: 'task', id: '3' },
  ];

  const selectedDateEvents = events.filter(event =>
    event.date.getDate() === date.getDate() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  );

  const tileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dayEvents = events.filter(event =>
        event.date.getDate() === tileDate.getDate() &&
        event.date.getMonth() === tileDate.getMonth() &&
        event.date.getFullYear() === tileDate.getFullYear()
      );

      if (dayEvents.length > 0) {
        return <div className="event-dot"></div>;
      }
    }
    return null;
  };

  // Removed unused getPriorityColorClasses function.

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
    // ClientLayout is removed here. It is now handled by src/app/layout.js
    <div className="relative h-full flex flex-col space-y-6">
      <h2 className="text-3xl font-bold text-foreground mb-4">Good Morning, User!</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border flex flex-col justify-between">
          <h3 className="text-xl font-semibold mb-3">
            Your Top Priority <span className="inline-flex items-center ml-2 px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>
              AI Suggestion
            </span>
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">Finalize Project Proposal for Gridle v1.0 Launch</p>
          <p className="text-base text-muted-foreground mb-4">Due: Friday, 26th July 2025, 5 PM</p>
          <p className="text-sm text-muted-foreground mb-6">AI suggests this is critical due to its direct impact on project timeline and upcoming stakeholder review.</p>
          <button
            onClick={handleGoToTasksPage}
            className="self-start bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors duration-200 shadow-md">
            Go to Tasks Page
          </button>
        </div>

        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-md border border-border flex flex-col justify-center items-center text-center">
            <span className="text-accent mb-2"><svg className="w-9 h-9" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg></span>
            <p className="text-sm text-muted-foreground mb-1">Tasks Due Today</p>
            <p className="text-4xl font-extrabold text-foreground">3</p>
          </div>
          <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-md border border-border flex flex-col justify-center items-center text-center">
            <span className="text-green-500 mb-2"><svg className="w-9 h-9" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg></span>
            <p className="text-sm text-muted-foreground mb-1">Completed This Week</p>
            <p className="text-4xl font-extrabold text-foreground">12</p>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-5">Upcoming Deadlines & Events</h3>
        
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
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-5">Productivity Trends</h3>
        <div className="h-52 bg-muted/50 flex items-center justify-center rounded-lg text-muted-foreground">
          [Advanced Productivity Graph Placeholder: e.g., using Recharts or Nivo]
        </div>
      </div>

      <button className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-accent transition-colors duration-200 z-20">
          {/* PlusIcon is used directly, not imported from ClientLayout as a prop */}
          <PlusIcon /> 
        </button>
      </div>
  );
};

export default DashboardPage;