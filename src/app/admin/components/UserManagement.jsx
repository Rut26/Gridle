// admin/components/UserManagement.jsx
"use client";

import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    fetchUsers();

     const interval = setInterval(() => {
    fetchUsers(userPage, userSearchQuery);
  }, 30000);

  return () => clearInterval(interval);
}, [sortField, sortOrder, statusFilter, roleFilter, userPage, userSearchQuery]);

  const fetchUsers = async (page = 1, search = '') => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: sortField,
        sortOrder: sortOrder,
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(roleFilter !== 'all' && { role: roleFilter })
      });
      
      const res = await fetch(`/api/admin/users?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUserTotalPages(data.totalPages);
        setUserPage(data.currentPage);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Optimistic edit
  const handleEditUser = async (userId, updates) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        // Update UI immediately
        setUsers((prev) =>
          prev.map((user) => (user._id === userId ? { ...user, ...updates } : user))
        );
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' });
      if (res.ok) {
        alert('Password reset email sent to user');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleViewActivity = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/activity`);
      if (res.ok) {
        const activityData = await res.json();
        setSelectedUser({ id: userId, activity: activityData });
        setShowActivityModal(true);
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

  const handleSearchUsers = (e) => {
    e.preventDefault();
    fetchUsers(1, userSearchQuery);
  };

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusValue = (user) => (user.isBanned ? 'banned' : user.isActive ? 'active' : 'inactive');

  const handleStatusChange = async (userId, newStatus) => {
    let updates = {};
    if (newStatus === 'banned') updates = { isBanned: true, isActive: false };
    else if (newStatus === 'active') updates = { isBanned: false, isActive: true };
    else if (newStatus === 'inactive') updates = { isBanned: false, isActive: false };
    await handleEditUser(userId, updates);
  };

  return (
    <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border">
      <h3 className="text-xl font-semibold text-foreground mb-6">User Management</h3>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <form onSubmit={handleSearchUsers} className="md:col-span-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search users..."
              className="flex-1 p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent"
            >
              Search
            </button>
          </div>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort('createdAt')}>
                Registered {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort('lastActivity')}>
                Last Activity {sortField === 'lastActivity' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-muted-foreground">No users found.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id}>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">{user.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">
                    <select
                      value={user.role}
                      onChange={(e) => handleEditUser(user._id, { role: e.target.value })}
                      className="bg-input border border-border rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">
                    <select
                      value={getStatusValue(user)}
                      onChange={(e) => handleStatusChange(user._id, e.target.value)}
                      className="bg-input border border-border rounded px-2 py-1"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <button onClick={() => handleViewActivity(user._id)} className="text-primary hover:underline text-xs text-left">View Activity</button>
                      <button onClick={() => handleResetPassword(user._id)} className="text-primary hover:underline text-xs text-left">Reset Password</button>
                      <button onClick={() => handleDeleteUser(user._id)} className="text-destructive hover:underline text-xs text-left">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button onClick={() => fetchUsers(userPage - 1, userSearchQuery)} disabled={userPage === 1} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg disabled:opacity-50">Previous</button>
        <span className="text-muted-foreground">Page {userPage} of {userTotalPages}</span>
        <button onClick={() => fetchUsers(userPage + 1, userSearchQuery)} disabled={userPage === userTotalPages} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg disabled:opacity-50">Next</button>
      </div>

      {/* Activity Modal */}
      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">User Activity</h3>
              <button onClick={() => setShowActivityModal(false)} className="text-muted-foreground hover:text-foreground">&times;</button>
            </div>
            {selectedUser.activity && selectedUser.activity.length > 0 ? (
              <div className="space-y-4">
                {selectedUser.activity.map((activity, index) => (
                  <div key={index} className="border-b border-border pb-3">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                    {activity.details && <p className="text-sm mt-1">{activity.details}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No activity recorded for this user.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
