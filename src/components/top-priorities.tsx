import React from "react";
import { Card, CardHeader, CardBody, Input, Button, Checkbox } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Priority {
  id: string;
  text: string;
  completed: boolean;
}

export const TopPriorities: React.FC = () => {
  const [priorities, setPriorities] = React.useState<Priority[]>([
    { id: "p1", text: "Complete project proposal", completed: false },
    { id: "p2", text: "Prepare for client meeting", completed: false },
    { id: "p3", text: "Review quarterly goals", completed: false },
  ]);
  const [newPriority, setNewPriority] = React.useState("");
  
  const handleAddPriority = () => {
    if (newPriority.trim() === "") return;
    
    setPriorities([
      ...priorities,
      { id: `p-${Date.now()}`, text: newPriority, completed: false }
    ]);
    setNewPriority("");
  };
  
  const handleTogglePriority = (id: string) => {
    setPriorities(priorities.map(priority => 
      priority.id === id 
        ? { ...priority, completed: !priority.completed } 
        : priority
    ));
  };
  
  const handleDeletePriority = (id: string) => {
    setPriorities(priorities.filter(priority => priority.id !== id));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPriority();
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:target" className="text-primary" />
          <h2 className="font-semibold">Top Priorities</h2>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-2 mb-4">
          {priorities.map((priority) => (
            <div key={priority.id} className="flex items-center gap-2 group">
              <Checkbox
                isSelected={priority.completed}
                onValueChange={() => handleTogglePriority(priority.id)}
                lineThrough
                size="sm"
              >
                <span className={priority.completed ? "line-through text-foreground-400" : ""}>
                  {priority.text}
                </span>
              </Checkbox>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                onPress={() => handleDeletePriority(priority.id)}
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
          />
          <Button
            isIconOnly
            color="primary"
            size="sm"
            variant="flat"
            onPress={handleAddPriority}
            isDisabled={newPriority.trim() === ""}
          >
            <Icon icon="lucide:plus" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};