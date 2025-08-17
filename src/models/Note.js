import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a note title'],
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please provide note content'],
    maxlength: [10000, 'Content cannot be more than 10000 characters'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
  summary: {
    type: String, // AI-generated summary
  },
}, {
  timestamps: true,
});

// Index for better search performance
NoteSchema.index({ userId: 1, title: 'text', content: 'text' });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);