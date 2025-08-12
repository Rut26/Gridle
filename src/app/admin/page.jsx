// src/app/admin/page.jsx
"use client";

import React, { useState } from 'react';
import { PlusIcon } from '../../components/ui/ClientLayout'; // PlusIcon might not be used here, but kept for consistency

const AdminPanelPage = () => {
  const userIsGlobalAdmin = true; // Set to true for demonstration; replace with actual auth check

  if (!userIsGlobalAdmin) {
    // This page content itself is returned, no ClientLayout wrapper
    return (
      <div className="text-center text-muted-foreground p-8 bg-card rounded-xl shadow-md border border-border">
        <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  const [users, setUsers] = useState([
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User' },
  ]);

  const [groups, setGroups] = useState([
    { id: 1, name: 'Marketing Team', creator: 'Alice Smith', members: 5 },
    { id: 2, name: 'Product Development', creator: 'Bob Johnson', members: 8 },
  ]);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    group.creator.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  const handleEditUserRole = (userId) => {
    alert(`Editing role for user ${userId}... (Simulated)`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm(`Are you sure you want to delete user ${users.find(u => u.id === userId)?.name}?`)) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      alert(`User ${userId} deleted.`);
    }
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm(`Are you sure you want to delete group ${groups.find(g => g.id === groupId)?.name}?`)) {
      setGroups(prev => prev.filter(group => group.id !== groupId));
      alert(`Group ${groupId} deleted.`);
    }
  };

  const handleViewGroupDetails = (groupId) => {
    alert(`Viewing details for group ${groupId}... (Simulated navigation)`);
  };

  const handleViewAiLogs = () => {
    alert("Viewing AI logs... (Simulated)");
  };

  const handleRetrainAi = () => {
    if (window.confirm("Are you sure you want to retrain AI models? This may take time.")) {
      alert("AI models retraining started... (Simulated)");
    }
  };

  return (
    // NO <ClientLayout> wrapper here. It's handled by src/app/layout.js
    <div className="relative h-full flex flex-col space-y-6">
      <h2 className="text-3xl font-bold text-foreground mb-4">System Administration</h2>

      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">User Management</h3>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground mb-4"
          value={userSearchQuery}
          onChange={(e) => setUserSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted-foreground">No users found.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground">{user.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground">{user.role}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => handleEditUserRole(user.id)} className="text-primary hover:underline text-sm mr-2">Edit Role</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:underline text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">Group Management</h3>
        <input
          type="text"
          placeholder="Search groups..."
          className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground mb-4"
          value={groupSearchQuery}
          onChange={(e) => setGroupSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Group Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Creator</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Members</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredGroups.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted-foreground">No groups found.</td></tr>
              ) : (
                filteredGroups.map(group => (
                  <tr key={group.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground">{group.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{group.creator}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground">{group.members}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => handleViewGroupDetails(group.id)} className="text-primary hover:underline text-sm mr-2">View</button>
                      <button onClick={() => handleDeleteGroup(group.id)} className="text-destructive hover:underline text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">System Metrics & AI Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground">
            Total Users: <span>{users.length}</span>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground">
            Total Groups: <span>{groups.length}</span>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground col-span-full flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
            <p className="mb-2 sm:mb-0">AI Model Status: <span className="text-green-600 font-medium">Active</span></p>
            <div className="flex space-x-2">
              <button onClick={handleViewAiLogs} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm hover:bg-secondary/80">View AI Logs</button>
              <button onClick={handleRetrainAi} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm hover:bg-secondary/80">Retrain AI (Placeholder)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;