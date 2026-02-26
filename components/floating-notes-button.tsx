'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import * as actions from '@/app/actions';

export function FloatingNotesButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async () => {
    setIsLoading(true);
    try {
      const fetchedNotes = await actions.getNotes();
      setNotes(fetchedNotes);
      setIsOpen(true);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await actions.addNote({ content: newNote });
      setNewNote('');
      const fetchedNotes = await actions.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await actions.deleteNote(id);
      const fetchedNotes = await actions.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
        size="lg"
        title={t('notes')}
      >
        <Plus className="w-6 h-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('notes')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">{t('addNote')}</label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t('noteContent')}
                className="min-h-24"
              />
              <Button
                onClick={handleAddNote}
                className="w-full"
                disabled={!newNote.trim()}
              >
                {t('save')}
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">{t('notes')}</h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">{t('loading')}...</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noData')}</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <p className="text-sm whitespace-pre-wrap break-words flex-1">{note.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-destructive hover:text-destructive ml-2 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
