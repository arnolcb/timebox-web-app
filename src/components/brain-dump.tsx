import React from "react";
import { Card, CardHeader, CardBody, Textarea, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Note {
  id: string;
  content: string;
}

export const BrainDump: React.FC = () => {
  const [notes, setNotes] = React.useState<Note[]>([
    { id: "n1", content: "Research new marketing strategies for Q4" },
    { id: "n2", content: "Don't forget to call the client about project timeline" }
  ]);
  const [newNote, setNewNote] = React.useState("");
  
  const handleAddNote = () => {
    if (newNote.trim() === "") return;
    
    setNotes([
      ...notes,
      { id: `n-${Date.now()}`, content: newNote }
    ]);
    setNewNote("");
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  const handleUpdateNote = (id: string, content: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, content } : note
    ));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAddNote();
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:brain" className="text-primary" />
          <h2 className="font-semibold">Brain Dump</h2>
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
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onPress={() => handleDeleteNote(note.id)}
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
          />
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onPress={handleAddNote}
            isDisabled={newNote.trim() === ""}
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