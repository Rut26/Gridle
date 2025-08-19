// src/app/tasks/page.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
// Correct import path for PlusIcon from components/ui/ClientLayout
import { PlusIcon } from '../../components/ui/ClientLayout'; 
import { HiMicrophone } from 'react-icons/hi'; // For voice input icon

const TasksPage = () => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeView, setActiveView] = useState('List');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [currentTaskToEdit, setCurrentTaskToEdit] = useState(null);
  const [taskFormName, setTaskFormName] = useState('');
  const [taskFormDueDate, setTaskFormDueDate] = useState('');
  const [taskFormPriority, setTaskFormPriority] = useState('Medium');
  const [taskFormCategory, setTaskFormCategory] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [showMoveToProjectModal, setShowMoveToProjectModal] = useState(false);
  const [selectedTaskForAction, setSelectedTaskForAction] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState('');

  const dummyGroups = [
    { id: 'g1', name: 'Marketing Team' },
    { id: 'g2', name: 'Product Development' },
    { id: 'g3', name: 'HR Initiatives' },
  ];
  const dummyProjects = [
    { id: 'p1', name: 'Gridle Core App' },
    { id: 'p2', name: 'Customer Engagement' },
    { id: 'p3', name: 'Internal Operations' },
  ];

  // Fetch tasks from API
  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  const getPriorityColorClasses = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-muted/30 text-muted-foreground';
    }
  };

  const handleToggleTaskStatus = (id) => {
    const task = tasks.find(t => t._id === id);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).then(() => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === id ? { ...task, status: newStatus } : task
        )
      )
    });
  };

  const openTaskModal = (task = null) => {
    if (task) {
      setIsEditingTask(true);
      setCurrentTaskToEdit(task);
      setTaskFormName(task.name);
      setTaskFormDueDate(task.dueDate);
      setTaskFormPriority(task.priority);
      setTaskFormCategory(task.category);
    } else {
      setIsEditingTask(false);
      setCurrentTaskToEdit(null);
      setTaskFormName('');
      setTaskFormDueDate('');
      setTaskFormPriority('Medium');
      setTaskFormCategory('');
    }
    setShowTaskModal(true);
    setOpenDropdownId(null);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setIsSavingTask(true);
    try {
      if (isEditingTask) {
        const response = await new Promise(resolve => setTimeout(() => {
          if (taskFormName && taskFormDueDate) {
            resolve({ success: true, task: {
              ...currentTaskToEdit,
              name: taskFormName,
              dueDate: taskFormDueDate,
              priority: taskFormPriority,
              category: taskFormCategory || 'Uncategorized',
            }});
          } else {
            resolve({ success: false, message: 'Task name and due date are required.' });
          }
        }, 1000));
        if (response.success) {
          setTasks(prevTasks => prevTasks.map(t => t.id === response.task.id ? response.task : t));
          alert('Task updated successfully!');
        } else {
          alert(response.message);
        }
      } else {
        const response = await new Promise(resolve => setTimeout(() => {
          if (taskFormName && taskFormDueDate) {
            resolve({ success: true, task: {
              id: String(tasks.length + 1),
              name: taskFormName,
              dueDate: taskFormDueDate,
              priority: taskFormPriority,
              category: taskFormCategory || 'Uncategorized',
              status: 'pending',
              aiSuggested: false,
              projectId: dummyProjects[0]?.id || null,
            }});
          } else {
            resolve({ success: false, message: 'Task name and due date are required.' });
          }
        }, 1000));
        if (response.success) {
          setTasks(prevTasks => [...prevTasks, response.task]);
          alert('Task added successfully!');
        } else {
          alert(response.message);
        }
      }
      setShowTaskModal(false);
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    setOpenDropdownId(null);
    if (window.confirm(`Are you sure you want to delete task "${tasks.find(t => t.id === taskId)?.name}"?`)) {
      new Promise(resolve => setTimeout(() => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        alert(`Task "${tasks.find(t => t.id === taskId)?.name}" deleted.`);
        resolve();
      }, 500));
    }
  };

  const toggleDropdown = (taskId) => {
    setOpenDropdownId(openDropdownId === taskId ? null : taskId);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (openDropdownId && dropdownRefs.current[openDropdownId] && !dropdownRefs.current[openDropdownId].contains(event.target)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const handleOpenAddToGroupModal = (task) => {
    setOpenDropdownId(null);
    setSelectedTaskForAction(task);
    setShowAddToGroupModal(true);
    setSelectedTargetId('');
  };

  const handleAddToGroup = async (e) => {
    e.preventDefault();
    if (!selectedTargetId) {
      alert('Please select a group.');
      return;
    }
    alert(`Adding task "${selectedTaskForAction.name}" to group "${dummyGroups.find(g => g.id === selectedTargetId)?.name}". (Simulating API call)`);
    setShowAddToGroupModal(false);
    setSelectedTaskForAction(null);
    setSelectedTargetId('');
  };

  const handleOpenMoveToProjectModal = (task) => {
    setOpenDropdownId(null);
    setSelectedTaskForAction(task);
    setShowMoveToProjectModal(true);
    setSelectedTargetId('');
  };

  const handleMoveToProject = async (e) => {
    e.preventDefault();
    if (!selectedTargetId) {
      alert('Please select a project.');
      return;
    }
    const newProject = dummyProjects.find(p => p.id === selectedTargetId);
    alert(`Moving task "${selectedTaskForAction.name}" to project "${newProject?.name}". (Simulating API call)`);
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === selectedTaskForAction.id ? { ...task, projectId: selectedTargetId } : task
    ));
    setShowMoveToProjectModal(false);
    setSelectedTaskForAction(null);
    setSelectedTargetId('');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery ? task.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesFilter = activeFilter === 'All' ||
                          (activeFilter === 'Pending' && task.status === 'pending') ||
                          (activeFilter === 'Completed' && task.status === 'completed');
    return matchesSearch && matchesFilter;
  });

  const renderTasks = () => {
    if (activeView === 'List') {
      return (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <p className="text-center text-muted-foreground">No tasks found matching your criteria.</p>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="flex items-center p-4 border border-border rounded-lg shadow-sm bg-card">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => handleToggleTaskStatus(task.id)}
                  className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary"
                />
                <div className="ml-4 flex-1">
                  <p className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.name}
                  </p>
                  <p className="text-sm text-muted-foreground">Due: {task.dueDate} | Category: {task.category}
                    {task.projectId && ` | Project: ${dummyProjects.find(p => p.id === task.projectId)?.name}`}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColorClasses(task.priority)}`}>
                  {task.priority}
                  {task.aiSuggested && <span className="ml-1 text-muted-foreground text-[0.6rem]">(AI)</span>}
                </span>

                <div className="relative ml-4" ref={el => dropdownRefs.current[task.id] = el}>
                  <button onClick={() => toggleDropdown(task.id)} className="p-2 rounded-full hover:bg-muted">
                    <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                  </button>
                  {openDropdownId === task.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                      <button onClick={() => openTaskModal(task)} className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors">
                        Edit Task
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className="block w-full text-left px-4 py-2 text-destructive hover:bg-muted transition-colors">
                        Delete Task
                      </button>
                      <button onClick={() => handleOpenMoveToProjectModal(task)} className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors">
                        Move to Project
                      </button>
                      <button onClick={() => handleOpenAddToGroupModal(task)} className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors">
                        Add to Group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      );
    } else if (activeView === 'Kanban') {
      return <div className="h-full bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">Kanban View (Coming Soon!)</div>;
    } else if (activeView === 'Calendar') {
      return <div className="h-full bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">Calendar View (Coming Soon!)</div>;
    }
    return null;
  };


  return (
    // NO <ClientLayout> wrapper here. It's handled by src/app/layout.js
    <div className="relative h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search tasks..."
          className="flex-grow p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex space-x-2">
          {['All', 'Pending', 'Completed'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors
                ${activeFilter === filter ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`
              }
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          {['List', 'Kanban', 'Calendar'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors
                ${activeView === view ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`
                }
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-card text-card-foreground p-6 rounded-xl shadow-md border border-border">
          {renderTasks()}
        </div>

        <button
          onClick={() => openTaskModal()}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-accent transition-colors duration-200 z-20"
        >
          <PlusIcon />
        </button>

        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-border">
              <h3 className="text-2xl font-semibold text-foreground mb-6">{isEditingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <form onSubmit={handleSaveTask} className="space-y-4">
                <input type="text" placeholder="Task Name" className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" value={taskFormName} onChange={(e) => setTaskFormName(e.target.value)} required />
                <input type="date" placeholder="Due Date" className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" value={taskFormDueDate} onChange={(e) => setTaskFormDueDate(e.target.value)} required />
                <select className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" value={taskFormPriority} onChange={(e) => setTaskFormPriority(e.target.value)}><option value="High">High Priority</option><option value="Medium">Medium Priority</option><option value="Low">Low Priority</option></select>
                <input type="text" placeholder="Category (e.g., Work, Personal)" className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" value={taskFormCategory} onChange={(e) => setTaskFormCategory(e.target.value)} />
                
                <button type="button" className="flex items-center text-primary hover:underline text-sm"><HiMicrophone className="mr-1" /> Voice Input for Name (AI)</button>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors" disabled={isSavingTask}>Cancel</button>
                  <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent transition-colors flex items-center justify-center" disabled={isSavingTask}>
                    {isSavingTask ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      isEditingTask ? 'Save Changes' : 'Add Task'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddToGroupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-border">
              <h3 className="text-2xl font-semibold text-foreground mb-6">Add "{selectedTaskForAction?.name}" to Group</h3>
              <form onSubmit={handleAddToGroup} className="space-y-4">
                <label htmlFor="select-group" className="block text-sm font-medium text-muted-foreground mb-2">Select Group:</label>
                <select id="select-group" className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" value={selectedTargetId} onChange={(e) => setSelectedTargetId(e.target.value)} required>
                  <option value="">-- Choose a group --</option>
                  {dummyGroups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
                </select>
                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" onClick={() => { setShowAddToGroupModal(false); setSelectedTaskForAction(null); setSelectedTargetId(''); }} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">Cancel</button>
                  <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent transition-colors">Add to Group</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMoveToProjectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-border">
              <h3 className="text-2xl font-semibold text-foreground mb-6">Move "{selectedTaskForAction?.name}" to Project</h3>
              <form onSubmit={handleMoveToProject} className="space-y-4">
                <label htmlFor="select-project" className="block text-sm font-medium text-muted-foreground mb-2">Select Project:</label>
                <select id="select-project" className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground" value={selectedTargetId} onChange={(e) => setSelectedTargetId(e.target.value)} required>
                  <option value="">-- Choose a project --</option>
                  {dummyProjects.map(project => (<option key={project.id} value={project.id}>{project.name}</option>))}
                </select>
                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" onClick={() => { setShowMoveToProjectModal(false); setSelectedTaskForAction(null); setSelectedTargetId(''); }} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">Cancel</button>
                  <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent transition-colors">Move Task</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

export default TasksPage;