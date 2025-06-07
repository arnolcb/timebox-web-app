// src/components/brain-dump.tsx
import React from "react";
import { Card, CardHeader, CardBody, Textarea, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TimeboxData } from "../services/timeboxService";

interface Note {
  id: string;
  content: string;
}

interface BrainDumpProps {
  timeboxId?: string;
  timebox?: TimeboxData | null;
  onUpdate?: (data: Partial<TimeboxData>) => Promise<void>;
}

export const BrainDump: React.FC<BrainDumpProps> = ({ timeboxId, timebox, onUpdate }) => {
  const [newNote, setNewNote] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  const notes = timebox?.notes || [];
  
  const updateNotes = async (newNotes: Note[]) => {
    if (!timeboxId || !onUpdate) return;
    
    try {
      setIsUpdating(true);
      await onUpdate({ notes: newNotes });
    } catch (error) {
      console.error('Failed to update notes:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAddNote = async () => {
    if (newNote.trim() === "" || !timeboxId) return;
    
    const newNoteObj: Note = {
      id: `n-${Date.now()}`,
      content: newNote.trim()
    };
    
    await updateNotes([...notes, newNoteObj]);
    setNewNote("");
  };
  
  const handleDeleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    await updateNotes(updatedNotes);
  };
  
  const handleUpdateNote = async (id: string, content: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, content } : note
    );
    await updateNotes(updatedNotes);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAddNote();
    }
  };
  
  if (!timeboxId) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:brain" className="text-primary" />
            <h2 className="font-semibold">Brain Dump</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-foreground-500 text-center py-4">
            Select a timebox to manage notes
          </p>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:brain" className="text-primary" />
          <h2 className="font-semibold">Brain Dump</h2>
          {isUpdating && <Icon icon="lucide:loader-2" className="animate-spin text-sm" />}
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-3 mb-4">
          {notes.map((note) => (
            <div key={note.id} className="group relative">
              <Textarea
                value={note.content}
                onValueChange={(value) => handleUpdateNote(note.id, value)}
                variant="bordered"
                size="sm"
                classNames={{
                  input: "min-h-[60px]"
                }}
                isDisabled={isUpdating}
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onPress={() => handleDeleteNote(note.id)}
                isDisabled={isUpdating}
              >
                <Icon icon="lucide:x" className="text-foreground-400 text-sm" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Add a note... (Ctrl+Enter to save)"
            value={newNote}
            onValueChange={setNewNote}
            onKeyDown={handleKeyDown}
            size="sm"
            minRows={2}
            isDisabled={isUpdating}
          />
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onPress={handleAddNote}
            isDisabled={newNote.trim() === "" || isUpdating}
            startContent={<Icon icon="lucide:plus" />}
            className="self-end"
          >
            Add Note
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};