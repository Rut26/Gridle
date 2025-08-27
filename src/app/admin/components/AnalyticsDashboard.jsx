// admin/components/AnalyticsDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!analytics) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
      <h3 className="text-xl font-semibold text-foreground mb-6">System Analytics</h3>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">Total Users</h4>
          <p className="text-3xl font-bold text-primary">{analytics.totalUsers}</p>
        </div>
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">Active Users</h4>
          <p className="text-3xl font-bold text-primary">{analytics.activeUsers}</p>
        </div>
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">Groups Created</h4>
          <p className="text-3xl font-bold text-primary">{analytics.groupsCreated}</p>
        </div>
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">Tasks Created</h4>
          <p className="text-3xl font-bold text-primary">{analytics.tasksCreated}</p>
        </div>
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">Completion Rate</h4>
          <p className="text-3xl font-bold text-primary">{analytics.completionRate}%</p>
        </div>
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">Avg Tasks/User</h4>
          <p className="text-3xl font-bold text-primary">{analytics.avgTasksPerUser}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks by Status */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-foreground mb-4">Tasks by Status</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analytics.tasksByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                {analytics.tasksByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Group */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-foreground mb-4">Tasks by Group</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.tasksByGroup}>
              <XAxis dataKey="groupName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* User Signups Trend */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-foreground mb-4">User Signups (Weekly)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.userTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Group Creation Trend */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-foreground mb-4">Group Creation (Weekly)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.groupTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
