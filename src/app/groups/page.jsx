// src/app/groups/page.jsx
"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { PlusIcon } from '../../components/ui/ClientLayout'; 
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const GroupsPage = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(true); // true for create, false for join
  const [groupFormName, setGroupFormName] = useState('');
  const [groupJoinCode, setGroupJoinCode] = useState('');
  const [isSubmittingGroupAction, setIsSubmittingGroupAction] = useState(false);

  // Group details modal
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupTasks, setGroupTasks] = useState([]);
  const [groupNotes, setGroupNotes] = useState([]);
  const [loadingGroupDetails, setLoadingGroupDetails] = useState(false);

  // Fetch groups from API
  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      if (data.success) {
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative h-full flex flex-col space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const openGroupModal = (isCreate = true) => {
    setIsCreatingGroup(isCreate);
    setGroupFormName('');
    setGroupJoinCode('');
    setShowGroupModal(true);
  };

  const handleGroupAction = async (e) => {
    e.preventDefault();
    setIsSubmittingGroupAction(true);
    try {
      if (isCreatingGroup) {
        const response = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: groupFormName,
            description: `New group: ${groupFormName}`
          }),
        });
        const data = await response.json();
        
        if (data.success) {
          setGroups(prev => [...prev, data.data]);
          toast({
            title: "Success",
            description: `Group "${groupFormName}" created!`,
          });
        } else {
          toast({
            title: "Error",
            description: data.error || 'Failed to create group',
            variant: "destructive",
          });
        }
      } else { // Joining group
        const response = await fetch('/api/groups/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ joinCode: groupJoinCode }),
        });
        const data = await response.json();
        
        if (data.success) {
          setGroups(prev => {
            if (!prev.some(g => g._id === data.data._id)) {
              return [...prev, data.data];
            }
            return prev;
          });
          toast({
            title: "Success",
            description: `Joined group "${data.data.name}"!`,
          });
          } else {
          toast({
            title: "Error",
            description: data.error || 'Failed to join group',
            variant: "destructive",
          });
          }
      }
      setShowGroupModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGroupAction(false);
    }
  };

  const openGroupDetails = async (group) => {
    setSelectedGroup(group);
    setShowGroupDetailsModal(true);
    setLoadingGroupDetails(true);
    
    try {
      // Fetch group tasks and notes
      const [tasksRes, notesRes] = await Promise.all([
        fetch(`/api/groups/${group._id}/tasks`),
        fetch(`/api/groups/${group._id}/notes`)
      ]);
      
      const [tasksData, notesData] = await Promise.all([
        tasksRes.json(),
        notesRes.json()
      ]);
      
      if (tasksData.success) setGroupTasks(tasksData.data || []);
      if (notesData.success) setGroupNotes(notesData.data || []);
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoadingGroupDetails(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // NO <ClientLayout> wrapper here. It's handled by src/app/layout.js
    <div className="relative h-full flex flex-col space-y-6">
      <input
        type="text"
        placeholder="Search groups..."
        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground mb-6"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto bg-card text-card-foreground p-6 rounded-xl shadow-md border border-border">
        {filteredGroups.length === 0 ? (
          <p className="text-center text-muted-foreground">No groups found matching your criteria. Click '+' to create or join one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map(group => (
              <div key={group._id} className="p-5 border border-border rounded-xl shadow-sm bg-card flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-medium text-foreground flex items-center mb-2">
                    {group.name}
                    {group.createdBy === session?.user?.id && (
                      <span className="ml-2 text-primary">
                        <svg className="w-5 h-5 inline-block -mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0H4V6h16v4zM4 14h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2zm16 4H4v-2h16v2z"/></svg>
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{group.description || 'No description'}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    <span>{group.members?.length || 0} Members</span>
                    <span className="ml-2">Code: {group.joinCode}</span>
                  </div>
                  <button
                    onClick={() => openGroupDetails(group)}
                    className="text-primary hover:underline text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => openGroupModal(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-accent transition-colors duration-200 z-20"
      >
        <PlusIcon />
      </button>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-border">
            <h3 className="text-2xl font-semibold text-foreground mb-6">{isCreatingGroup ? 'Create New Group' : 'Join Existing Group'}</h3>
            <form onSubmit={handleGroupAction} className="space-y-4">
              {isCreatingGroup ? (
                <input type="text" placeholder="Group Name" className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" value={groupFormName} onChange={(e) => setGroupFormName(e.target.value)} required />
              ) : (
                <input type="text" placeholder="Enter Group Join Code" className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" value={groupJoinCode} onChange={(e) => setGroupJoinCode(e.target.value)} required />
              )}
              
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowGroupModal(false)} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors" disabled={isSubmittingGroupAction}>Cancel</button>
                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent transition-colors flex items-center justify-center" disabled={isSubmittingGroupAction}>
                  {isSubmittingGroupAction ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    isCreatingGroup ? 'Create Group' : 'Join Group'
                  )}
                </button>
              </div>
            </form>
            <div className="my-4 text-center text-muted-foreground">
              <button onClick={() => setIsCreatingGroup(!isCreatingGroup)} className="text-primary hover:underline text-sm">
                {isCreatingGroup ? 'Want to join a group instead?' : 'Want to create a group instead?'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGroupDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">{selectedGroup.name}</h3>
                  <p className="text-muted-foreground mt-1">{selectedGroup.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Join Code: <span className="font-mono bg-muted px-2 py-1 rounded">{selectedGroup.joinCode}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowGroupDetailsModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loadingGroupDetails ? (
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Group Tasks ({groupTasks.length})</h4>
                    {groupTasks.length === 0 ? (
                      <p className="text-muted-foreground">No tasks in this group yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {groupTasks.map(task => (
                          <div key={task._id} className="p-3 border border-border rounded-lg">
                            <h5 className="font-medium">{task.name}</h5>
                            <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              task.priority === 'High' ? 'bg-red-100 text-red-800' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Group Notes ({groupNotes.length})</h4>
                    {groupNotes.length === 0 ? (
                      <p className="text-muted-foreground">No notes in this group yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {groupNotes.map(note => (
                          <div key={note._id} className="p-3 border border-border rounded-lg">
                            <h5 className="font-medium">{note.title}</h5>
                            <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-lg font-semibold mb-3">Members ({selectedGroup.members?.length || 0})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGroup.members?.map(member => (
                    <div key={member.user._id || member.user} className="flex items-center bg-muted px-3 py-1 rounded-full">
                      <span className="text-sm">{member.user.name || 'Unknown User'}</span>
                      {member.role === 'admin' && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Admin</span>
                      )}
                    </div>
                  )) || (
                    <p className="text-muted-foreground">No members found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;