// src/components/top-priorities.tsx
import React from "react";
import { Card, CardHeader, CardBody, Input, Button, Checkbox } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TimeboxData } from "../services/timeboxService";

interface Priority {
  id: string;
  text: string;
  completed: boolean;
}

interface TopPrioritiesProps {
  timeboxId?: string;
  timebox?: TimeboxData | null;
  onUpdate?: (data: Partial<TimeboxData>) => Promise<void>;
}

export const TopPriorities: React.FC<TopPrioritiesProps> = ({ timeboxId, timebox, onUpdate }) => {
  const [newPriority, setNewPriority] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  const priorities = timebox?.priorities || [];
  
  const updatePriorities = async (newPriorities: Priority[]) => {
    if (!timeboxId || !onUpdate) return;
    
    try {
      setIsUpdating(true);
      await onUpdate({ priorities: newPriorities });
    } catch (error) {
      console.error('Failed to update priorities:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAddPriority = async () => {
    if (newPriority.trim() === "" || !timeboxId) return;
    
    const newPriorityObj: Priority = {
      id: `p-${Date.now()}`,
      text: newPriority.trim(),
      completed: false
    };
    
    await updatePriorities([...priorities, newPriorityObj]);
    setNewPriority("");
  };
  
  const handleTogglePriority = async (id: string) => {
    const updatedPriorities = priorities.map(priority => 
      priority.id === id 
        ? { ...priority, completed: !priority.completed } 
        : priority
    );
    await updatePriorities(updatedPriorities);
  };
  
  const handleDeletePriority = async (id: string) => {
    const updatedPriorities = priorities.filter(priority => priority.id !== id);
    await updatePriorities(updatedPriorities);
  };
  
  const handleUpdatePriorityText = async (id: string, text: string) => {
    const updatedPriorities = priorities.map(priority => 
      priority.id === id 
        ? { ...priority, text } 
        : priority
    );
    await updatePriorities(updatedPriorities);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPriority();
    }
  };
  
  if (!timeboxId) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:target" className="text-primary" />
            <h2 className="font-semibold">Top Priorities</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-foreground-500 text-center py-4">
            Select a timebox to manage priorities
          </p>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:target" className="text-primary" />
          <h2 className="font-semibold">Top Priorities</h2>
          {isUpdating && <Icon icon="lucide:loader-2" className="animate-spin text-sm" />}
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-2 mb-4">
          {priorities.map((priority) => (
            <div key={priority.id} className="flex items-center gap-2 group">
              <Checkbox
                isSelected={priority.completed}
                onValueChange={() => handleTogglePriority(priority.id)}
                size="sm"
              />
              <Input
                value={priority.text}
                onValueChange={(text) => handleUpdatePriorityText(priority.id, text)}
                variant="underlined"
                size="sm"
                className={`flex-1 ${priority.completed ? "line-through opacity-60" : ""}`}
                classNames={{
                  inputWrapper: "bg-transparent border-none shadow-none",
                  input: "bg-transparent"
                }}
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onPress={() => handleDeletePriority(priority.id)}
                isDisabled={isUpdating}
              >
                <Icon icon="lucide:x" className="text-foreground-400 text-sm" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Add a priority..."
            value={newPriority}
            onValueChange={setNewPriority}
            onKeyDown={handleKeyDown}
            size="sm"
            startContent={<Icon icon="lucide:plus" className="text-foreground-400" />}
            isDisabled={isUpdating}
          />
          <Button
            isIconOnly
            color="primary"
            size="sm"
            variant="flat"
            onPress={handleAddPriority}
            isDisabled={newPriority.trim() === "" || isUpdating}
          >
            <Icon icon="lucide:plus" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};