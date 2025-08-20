// src/app/admin/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPanelPage = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    if (session) {
      fetchAdminData();
    }
  }, [session]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users')
      ]);

      const [statsData, usersData] = await Promise.all([
        statsRes.json(),
        usersRes.json()
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (usersData.success) {
        setUsers(usersData.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        toast({
          title: "Success",
          description: `User role updated to ${newRole}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update user role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You do not have administrative privileges to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="relative h-full flex flex-col space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="relative h-full flex flex-col space-y-6">
      <h2 className="text-3xl font-bold text-foreground mb-4">System Administration</h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.overview?.users || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.overview?.tasks || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.overview?.notes || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.overview?.groups || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* User Registration Chart */}
      {stats?.userRegistrations && (
        <Card>
          <CardHeader>
            <CardTitle>User Registrations (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.userRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search users..."
            className="mb-4"
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
                    <tr key={user._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                          className="text-sm border border-border rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={user._id === session.user.id}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Task Statistics */}
      {stats?.taskStats && (
        <Card>
          <CardHeader>
            <CardTitle>Task Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.taskStats.completed || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.taskStats.pending || 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.taskStats['in-progress'] || 0}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Most Active Users */}
      {stats?.activeUsers && stats.activeUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.activeUsers.slice(0, 5).map((user, index) => (
                <div key={user._id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-sm text-muted-foreground">{user.taskCount} tasks</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>

  );
};

export default AdminPanelPage;