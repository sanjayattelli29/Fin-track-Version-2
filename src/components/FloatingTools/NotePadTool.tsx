
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Plus, Save, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
}

const NotePadTool = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notepad_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Error parsing notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notepad_notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      timestamp: new Date()
    };
    
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setNoteTitle(newNote.title);
    setNoteContent(newNote.content);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!activeNoteId) return;

    const updatedNotes = notes.map(note => 
      note.id === activeNoteId 
        ? { ...note, title: noteTitle, content: noteContent, timestamp: new Date() } 
        : note
    );
    
    setNotes(updatedNotes);
    setIsEditing(false);
    
    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully."
    });
  };

  const selectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setIsEditing(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const deleteNote = () => {
    if (!deleteId) return;
    
    const updatedNotes = notes.filter(note => note.id !== deleteId);
    setNotes(updatedNotes);
    
    if (activeNoteId === deleteId) {
      setActiveNoteId(null);
      setNoteTitle('');
      setNoteContent('');
    }
    
    setShowDeleteDialog(false);
    setDeleteId(null);
    
    toast({
      title: "Note Deleted",
      description: "Your note has been deleted."
    });
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="notepad-container">
      {/* Notes list header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">My Notes</h3>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={createNewNote}
        >
          <Plus className="h-4 w-4 mr-1" /> New Note
        </Button>
      </div>

      {/* Notes list */}
      <div className="notes-list mb-4 max-h-36 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No notes yet. Create your first note!
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map(note => (
              <li 
                key={note.id} 
                className={`
                  p-2 rounded cursor-pointer flex justify-between items-center 
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${activeNoteId === note.id ? 'bg-gray-100 dark:bg-gray-700' : ''}
                `}
                onClick={() => selectNote(note)}
              >
                <div className="flex-1">
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(new Date(note.timestamp))}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(note.id);
                  }}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Note editor */}
      {activeNoteId && (
        <div className="note-editor border rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              className="font-medium bg-transparent border-none outline-none w-full"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              readOnly={!isEditing}
              placeholder="Note Title"
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => isEditing ? saveNote() : setIsEditing(true)}
            >
              {isEditing ? (
                <Save className="h-4 w-4 text-green-500" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <Textarea
            className="min-h-[120px] resize-none"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            readOnly={!isEditing}
            placeholder="Write your note here..."
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this note? This action cannot be undone.</p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={deleteNote}>Delete</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotePadTool;
