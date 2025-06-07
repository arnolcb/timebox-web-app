// src/components/schedule.tsx
import React from "react";
import { Card, CardHeader, CardBody, Input, Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TimeboxData } from "../services/timeboxService";

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

interface ScheduleProps {
  timeboxId?: string;
  timebox?: TimeboxData | null;
  onUpdate?: (data: Partial<TimeboxData>) => Promise<void>;
}

export const Schedule: React.FC<ScheduleProps> = ({ timeboxId, timebox, onUpdate }) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [newBlock, setNewBlock] = React.useState<Omit<TimeBlock, "id">>({
    startTime: "",
    endTime: "",
    activity: "",
    color: "default"
  });
  
  const timeBlocks = timebox?.schedule || [];
  const colorOptions: Array<TimeBlock["color"]> = [
    "default", "primary", "secondary", "success", "warning", "danger"
  ];
  
  const updateSchedule = async (newSchedule: TimeBlock[]) => {
    if (!timeboxId || !onUpdate) return;
    
    try {
      setIsUpdating(true);
      await onUpdate({ schedule: newSchedule });
    } catch (error) {
      console.error('Failed to update schedule:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAddTimeBlock = async () => {
    if (!newBlock.startTime || !newBlock.endTime || !newBlock.activity || !timeboxId) return;
    
    const newTimeBlock: TimeBlock = {
      ...newBlock,
      id: `tb-${Date.now()}`
    };
    
    await updateSchedule([...timeBlocks, newTimeBlock]);
    
    setNewBlock({
      startTime: "",
      endTime: "",
      activity: "",
      color: "default"
    });
  };
  
  const handleDeleteTimeBlock = async (id: string) => {
    const updatedBlocks = timeBlocks.filter(block => block.id !== id);
    await updateSchedule(updatedBlocks);
  };
  
  const handleUpdateTimeBlock = async (id: string, field: keyof Omit<TimeBlock, "id">, value: string) => {
    const updatedBlocks = timeBlocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    );
    await updateSchedule(updatedBlocks);
  };
  
  const handleColorChange = async (id: string, color: TimeBlock["color"]) => {
    await handleUpdateTimeBlock(id, "color", color);
  };
  
  const sortedTimeBlocks = [...timeBlocks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  if (!timeboxId) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:clock" className="text-primary" />
            <h2 className="font-semibold">Schedule</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-foreground-500 text-center py-4">
            Select a timebox to manage schedule
          </p>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:clock" className="text-primary" />
          <h2 className="font-semibold">Schedule</h2>
          {isUpdating && <Icon icon="lucide:loader-2" className="animate-spin text-sm" />}
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4 mb-6">
          {sortedTimeBlocks.map((block) => (
            <div key={block.id} className="group relative">
              <div className={`border-l-4 border-${block.color} pl-3 py-2 pr-10 rounded-r-md bg-${block.color}-100/20`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{block.startTime} - {block.endTime}</span>
                  <div className="flex gap-1 ml-auto">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-4 h-4 rounded-full bg-${color} opacity-0 group-hover:opacity-100 transition-opacity ${block.color === color ? 'ring-2 ring-offset-1' : ''}`}
                        onClick={() => handleColorChange(block.id, color)}
                        aria-label={`Set color to ${color}`}
                        disabled={isUpdating}
                      />
                    ))}
                  </div>
                </div>
                <Input
                  value={block.activity}
                  onValueChange={(value) => handleUpdateTimeBlock(block.id, "activity", value)}
                  variant="underlined"
                  size="sm"
                  classNames={{
                    inputWrapper: "bg-transparent",
                    input: "bg-transparent"
                  }}
                  isDisabled={isUpdating}
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={() => handleDeleteTimeBlock(block.id)}
                  isDisabled={isUpdating}
                >
                  <Icon icon="lucide:x" className="text-foreground-400 text-sm" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Divider className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            type="time"
            label="Start Time"
            value={newBlock.startTime}
            onValueChange={(value) => setNewBlock({...newBlock, startTime: value})}
            variant="bordered"
            size="sm"
            isDisabled={isUpdating}
          />
          <Input
            type="time"
            label="End Time"
            value={newBlock.endTime}
            onValueChange={(value) => setNewBlock({...newBlock, endTime: value})}
            variant="bordered"
            size="sm"
            isDisabled={isUpdating}
          />
          <Input
            label="Activity"
            placeholder="What are you doing?"
            value={newBlock.activity}
            onValueChange={(value) => setNewBlock({...newBlock, activity: value})}
            variant="bordered"
            size="sm"
            isDisabled={isUpdating}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-1">
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full bg-${color} ${newBlock.color === color ? 'ring-2 ring-offset-1' : ''}`}
                onClick={() => setNewBlock({...newBlock, color})}
                aria-label={`Set color to ${color}`}
                disabled={isUpdating}
              />
            ))}
          </div>
          
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onPress={handleAddTimeBlock}
            isDisabled={!newBlock.startTime || !newBlock.endTime || !newBlock.activity || isUpdating}
            startContent={<Icon icon="lucide:plus" />}
          >
            Add Time Block
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};