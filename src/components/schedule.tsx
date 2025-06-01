import React from "react";
import { Card, CardHeader, CardBody, Input, Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export const Schedule: React.FC = () => {
  const [timeBlocks, setTimeBlocks] = React.useState<TimeBlock[]>([
    { id: "tb1", startTime: "08:00", endTime: "09:30", activity: "Morning planning and email", color: "default" },
    { id: "tb2", startTime: "09:30", endTime: "11:00", activity: "Work on project proposal", color: "primary" },
    { id: "tb3", startTime: "11:00", endTime: "12:00", activity: "Team meeting", color: "secondary" },
    { id: "tb4", startTime: "12:00", endTime: "13:00", activity: "Lunch break", color: "success" },
    { id: "tb5", startTime: "13:00", endTime: "15:00", activity: "Deep work session", color: "primary" },
    { id: "tb6", startTime: "15:00", endTime: "16:00", activity: "Client call", color: "warning" },
    { id: "tb7", startTime: "16:00", endTime: "17:30", activity: "Review and plan for tomorrow", color: "default" },
  ]);
  
  const [newBlock, setNewBlock] = React.useState<Omit<TimeBlock, "id">>({
    startTime: "",
    endTime: "",
    activity: "",
    color: "default"
  });
  
  const colorOptions: Array<TimeBlock["color"]> = [
    "default", "primary", "secondary", "success", "warning", "danger"
  ];
  
  const handleAddTimeBlock = () => {
    if (!newBlock.startTime || !newBlock.endTime || !newBlock.activity) return;
    
    setTimeBlocks([
      ...timeBlocks,
      { ...newBlock, id: `tb-${Date.now()}` }
    ]);
    
    setNewBlock({
      startTime: "",
      endTime: "",
      activity: "",
      color: "default"
    });
  };
  
  const handleDeleteTimeBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter(block => block.id !== id));
  };
  
  const handleUpdateTimeBlock = (id: string, field: keyof Omit<TimeBlock, "id">, value: string) => {
    setTimeBlocks(timeBlocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  };
  
  const handleColorChange = (id: string, color: TimeBlock["color"]) => {
    setTimeBlocks(timeBlocks.map(block => 
      block.id === id ? { ...block, color } : block
    ));
  };
  
  const sortedTimeBlocks = [...timeBlocks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:clock" className="text-primary" />
          <h2 className="font-semibold">Schedule</h2>
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
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={() => handleDeleteTimeBlock(block.id)}
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
          />
          <Input
            type="time"
            label="End Time"
            value={newBlock.endTime}
            onValueChange={(value) => setNewBlock({...newBlock, endTime: value})}
            variant="bordered"
            size="sm"
          />
          <Input
            label="Activity"
            placeholder="What are you doing?"
            value={newBlock.activity}
            onValueChange={(value) => setNewBlock({...newBlock, activity: value})}
            variant="bordered"
            size="sm"
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
              />
            ))}
          </div>
          
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onPress={handleAddTimeBlock}
            isDisabled={!newBlock.startTime || !newBlock.endTime || !newBlock.activity}
            startContent={<Icon icon="lucide:plus" />}
          >
            Add Time Block
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};