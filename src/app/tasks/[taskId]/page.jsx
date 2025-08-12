// src/app/tasks/[taskId]/page.jsx
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
// ClientLayout is removed from the import and wrapper.
// It is provided by src/app/layout.js
// So, we just remove the ClientLayout import, as it's not used directly here.

const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId;

  const dummyTasks = [
    { id: '1', name: 'Finalize Project Proposal for Gridle v1.0 Launch', description: 'Complete all sections including budget, timeline, and resource allocation. Ensure all stakeholder feedback is incorporated before final submission.', dueDate: 'Friday, 26th July 2025, 5 PM', priority: 'High', category: 'Work', aiInsight: 'Critical due to direct impact on project timeline and upcoming stakeholder review.' },
    { id: '2', name: 'Review client feedback on wireframes', description: 'Go through the feedback provided by Client X on the latest wireframes. Schedule a follow-up meeting for clarifications if needed.', dueDate: 'Monday, 29th July 2025', priority: 'Medium', category: 'Design' },
    { id: '3', name: 'Research AI libraries', description: 'Explore new Python libraries for advanced NLP and predictive analytics to enhance Gridle\'s AI features. Look into spaCy, Hugging Face Transformers, and Prophet.', dueDate: 'Thursday, 28th July 2025', priority: 'High', category: 'Project', aiInsight: 'Essential for next phase AI feature development. Dependencies on new library integration.' },
  ];

  const task = dummyTasks.find(t => t.id === taskId);

  if (!task) {
    // This page content itself is returned, no ClientLayout wrapper
    return (
      <div className="text-center text-muted-foreground p-8 bg-card rounded-xl shadow-md border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Task Not Found</h2>
        <p>The task with ID "{taskId}" does not exist or you do not have access.</p>
        <button onClick={() => router.back()} className="mt-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors">Go Back</button>
      </div>
    );
  }

  return (
    // This page content itself is returned, no ClientLayout wrapper
    <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-foreground">{task.name}</h2>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${task.priority === 'High' ? 'bg-destructive/10 text-destructive' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {task.priority} Priority
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Due Date</p>
          <p className="text-lg font-medium text-foreground">{task.dueDate}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Category</p>
          <p className="text-lg font-medium text-foreground">{task.category}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">Description</p>
        <p className="text-foreground leading-relaxed">{task.description}</p>
      </div>

      {task.aiInsight && (
        <div className="bg-muted p-4 rounded-lg border border-border">
          <p className="text-sm font-semibold text-foreground mb-1">AI Insight:</p>
          <p className="text-muted-foreground text-sm">{task.aiInsight}</p>
        </div>
      )}

      <div className="pt-6 border-t border-border flex justify-end space-x-3">
        <button onClick={() => router.back()} className="bg-secondary text-secondary-foreground px-5 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
          Go Back
        </button>
        <button className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-semibold hover:bg-accent transition-colors">
          Edit Task
        </button>
        <button className="bg-destructive text-destructive-foreground px-5 py-2 rounded-lg font-semibold hover:bg-destructive/80 transition-colors">
          Delete Task
        </button>
      </div>
    </div>
  );
};

export default TaskDetailPage;