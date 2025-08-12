// src/app/notes/page.jsx
"use client";

import React, { useState } from 'react';
import { PlusIcon } from '../../components/ui/ClientLayout'; 
import { HiMicrophone } from 'react-icons/hi'; // For voice input icon

const NotesPage = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Meeting with Client X', content: 'Discussed project scope, deliverables, and timeline. Agreed on next steps for UI/UX review and backend API integration. Follow up on Monday.', date: '2025-07-20' },
    { id: 2, title: 'Brainstorming - AI Features', content: 'Ideas for advanced AI integrations: sentiment analysis on task descriptions, predictive resource allocation, self-learning task categorization.', date: '2025-07-18' },
    { id: 3, title: 'Personal Reminders', content: 'Remember to pick up dry cleaning by 6 PM. Call dentist for appointment confirmation.', date: '2025-07-22' },
    { id: 4, title: 'Project Gridle Requirements', content: 'Need to clarify authentication flows and ensure all AI features have clear user touchpoints. Also, define admin panel permissions precisely.', date: '2025-07-23' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentNoteToEdit, setCurrentNoteToEdit] = useState(null);
  const [noteFormTitle, setNoteFormTitle] = useState('');
  const [noteFormContent, setNoteFormContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);


  const openNoteModal = (note = null) => {
    if (note) {
      setIsEditingNote(true);
      setCurrentNoteToEdit(note);
      setNoteFormTitle(note.title);
      setNoteFormContent(note.content);
    } else {
      setIsEditingNote(false);
      setCurrentNoteToEdit(null);
      setNoteFormTitle('');
      setNoteFormContent('');
    }
    setShowNoteModal(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setIsSavingNote(true);
    try {
      if (isEditingNote) {
        const response = await new Promise(resolve => setTimeout(() => {
          if (noteFormTitle && noteFormContent) {
            resolve({ success: true, note: {
              ...currentNoteToEdit,
              title: noteFormTitle,
              content: noteFormContent,
              date: new Date().toLocaleDateString('en-IN'), // Update date on edit
            }});
          } else {
            resolve({ success: false, message: 'Note title and content are required.' });
          }
        }, 1000));
        if (response.success) {
          setNotes(prevNotes => prevNotes.map(n => n.id === response.note.id ? response.note : n));
          alert('Note updated successfully!');
        } else {
          alert(response.message);
        }
      } else {
        const response = await new Promise(resolve => setTimeout(() => {
          if (noteFormTitle && noteFormContent) {
            resolve({ success: true, note: {
              id: notes.length + 1,
              title: noteFormTitle,
              content: noteFormContent,
              date: new Date().toLocaleDateString('en-IN'),
            }});
          } else {
            resolve({ success: false, message: 'Note title and content are required.' });
          }
        }, 1000));
        if (response.success) {
          setNotes(prevNotes => [...prevNotes, response.note]);
          alert('Note added successfully!');
        } else {
          alert(response.message);
        }
      }
      setShowNoteModal(false);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm(`Are you sure you want to delete note "${notes.find(n => n.id === noteId)?.title}"?`)) {
      new Promise(resolve => setTimeout(() => {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        alert(`Note "${notes.find(n => n.id === noteId)?.title}" deleted.`);
        resolve();
      }, 500));
    }
  };

  const handleSummarizeNote = (noteId) => {
    alert(`Summarizing note ${noteId} using AI... (Feature coming soon!)`);
    // In a real app, send note content to an AI API for summarization
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // NO <ClientLayout> wrapper here. It's handled by src/app/layout.js
    <div className="relative h-full flex flex-col space-y-6">
      <input
        type="text"
        placeholder="Search notes..."
        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground mb-6"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto bg-card text-card-foreground p-6 rounded-xl shadow-md border border-border">
        {filteredNotes.length === 0 ? (
          <p className="text-center text-muted-foreground">No notes found matching your criteria.</p>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map(note => (
              <div key={note.id} className="p-4 border border-border rounded-lg shadow-sm bg-card cursor-pointer hover:bg-muted/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-1">{note.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{note.content}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Last Modified: {note.date}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => openNoteModal(note)} className="text-primary hover:underline">Edit</button>
                    <button onClick={() => handleDeleteNote(note.id)} className="text-destructive hover:underline">Delete</button>
                    <button onClick={() => handleSummarizeNote(note.id)} className="text-primary hover:underline">Summarize (AI)</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => openNoteModal()}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-accent transition-colors duration-200 z-20"
      >
        <PlusIcon />
      </button>

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-lg border border-border">
            <h3 className="text-2xl font-semibold text-foreground mb-6">{isEditingNote ? 'Edit Note' : 'Create New Note'}</h3>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <input
                type="text"
                placeholder="Note Title"
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground"
                value={noteFormTitle}
                onChange={(e) => setNoteFormTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Start writing your note here..."
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground h-32 mb-3"
                value={noteFormContent}
                onChange={(e) => setNoteFormContent(e.target.value)}
                required
              ></textarea>
              <div className="flex items-center justify-between">
                <button type="button" className="flex items-center text-primary hover:underline text-sm"><HiMicrophone className="mr-1" /> Voice Input (AI)</button>
                <div>
                  <button type="button" onClick={() => setShowNoteModal(false)} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors mr-2" disabled={isSavingNote}>Cancel</button>
                  <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent transition-colors flex items-center justify-center" disabled={isSavingNote}>
                    {isSavingNote ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      isEditingNote ? 'Save Changes' : 'Save Note'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;