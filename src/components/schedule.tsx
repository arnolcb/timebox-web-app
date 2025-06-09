// src/components/schedule.tsx
import React from "react";
import { Card, CardHeader, CardBody, Input, Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TimeboxData } from "../services/timeboxService";
import { CleanTimePicker } from "./CleanTimePicker";

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
  
  // Format time for display
  const formatTimeForDisplay = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const period = h >= 12 ? 'PM' : 'AM';
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
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
              <div className={`border-l-4 border-${block.color} pl-4 py-3 pr-12 rounded-r-lg bg-${block.color}/5 hover:bg-${block.color}/10 transition-colors`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground-600">
                    <Icon icon="lucide:clock" className="w-4 h-4" />
                    <span>{formatTimeForDisplay(block.startTime)} - {formatTimeForDisplay(block.endTime)}</span>
                  </div>
                  <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-4 h-4 rounded-full bg-${color} hover:scale-110 transition-transform ${
                          block.color === color ? 'ring-2 ring-offset-1 ring-foreground' : ''
                        }`}
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
                  placeholder="What are you doing?"
                  classNames={{
                    inputWrapper: "bg-transparent border-b-1",
                    input: "bg-transparent text-sm"
                  }}
                  isDisabled={isUpdating}
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={() => handleDeleteTimeBlock(block.id)}
                  isDisabled={isUpdating}
                >
                  <Icon icon="lucide:trash-2" className="text-sm" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Divider className="my-6" />
        
        {/* New Time Block Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-600 flex items-center gap-2">
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Add New Time Block
          </h3>
          
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-3">
            <div className="sm:col-span-1">
              <CleanTimePicker
                label="Start Time"
                value={newBlock.startTime}
                onChange={(time) => setNewBlock({...newBlock, startTime: time})}
                disabled={isUpdating}
              />
            </div>
            
            <div className="sm:col-span-1">
              <CleanTimePicker
                label="End Time"
                value={newBlock.endTime}
                onChange={(time) => setNewBlock({...newBlock, endTime: time})}
                disabled={isUpdating}
              />
            </div>
            
            <div className="sm:col-span-3">
              <Input
                label="Activity"
                placeholder="What are you doing?"
                value={newBlock.activity}
                onValueChange={(value) => setNewBlock({...newBlock, activity: value})}
                variant="bordered"
                size="md"
                isDisabled={isUpdating}
                startContent={<Icon icon="lucide:activity" className="text-foreground-400 w-4 h-4" />}
                classNames={{
                  inputWrapper: "h-12",
                  input: "text-sm"
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-600">Color:</span>
              <div className="flex gap-1.5">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-full bg-${color} hover:scale-110 transition-transform ${
                      newBlock.color === color ? 'ring-2 ring-offset-1 ring-foreground' : ''
                    }`}
                    onClick={() => setNewBlock({...newBlock, color})}
                    aria-label={`Set color to ${color}`}
                    disabled={isUpdating}
                  />
                ))}
              </div>
            </div>
            
            <Button
              color="primary"
              size="sm"
              variant="solid"
              onPress={handleAddTimeBlock}
              isDisabled={!newBlock.startTime || !newBlock.endTime || !newBlock.activity || isUpdating}
              startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
              className="min-w-28 h-9"
            >
              Add Block
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};