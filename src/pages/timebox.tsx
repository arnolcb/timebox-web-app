import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, Input, Button, Textarea, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TopPriorities } from "../components/top-priorities";
import { BrainDump } from "../components/brain-dump";
import { Schedule } from "../components/schedule";

interface TimeboxParams {
  id: string;
}

export const TimeboxPage: React.FC = () => {
  const { id } = useParams<TimeboxParams>();
  
  // Extract date from ID (assuming format sheet-YYYY-MM-DD)
  const dateFromId = id.replace('sheet-', '');
  
  // Set default title to formatted date
  const [title, setTitle] = React.useState(() => {
    try {
      const date = new Date(dateFromId);
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    } catch (e) {
      return "Untitled Timebox";
    }
  });
  
  const [date, setDate] = React.useState(dateFromId || new Date().toISOString().split('T')[0]);
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            value={title}
            onValueChange={setTitle}
            variant="bordered"
            size="lg"
            className="font-semibold"
            classNames={{
              input: "text-xl",
              inputWrapper: "border-none bg-transparent"
            }}
          />
          <Input
            type="date"
            value={date}
            onValueChange={setDate}
            size="sm"
            variant="bordered"
            className="max-w-xs"
            classNames={{
              inputWrapper: "border-none bg-transparent"
            }}
            startContent={<Icon icon="lucide:calendar" className="text-foreground-400" />}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="flat" 
            startContent={<Icon icon="lucide:share-2" />}
          >
            Share
          </Button>
          <Button 
            color="primary" 
            variant="flat" 
            startContent={<Icon icon="lucide:save" />}
          >
            Save
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopPriorities />
          <div className="mt-6">
            <BrainDump />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Schedule />
        </div>
      </div>
    </div>
  );
};