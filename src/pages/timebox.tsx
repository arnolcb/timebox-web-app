// src/pages/timebox.tsx
import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { Card, CardBody, CardHeader, Input, Button, Textarea, Divider, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TopPriorities } from "../components/top-priorities";
import { BrainDump } from "../components/brain-dump";
import { Schedule } from "../components/schedule";
import { useTimebox } from "../hooks/useTimeboxes";

interface TimeboxParams {
  id: string;
}

export const TimeboxPage: React.FC = () => {
  const { id } = useParams<TimeboxParams>();
  const history = useHistory();
  const { timebox, loading, error, updateTimebox } = useTimebox(id);
  
  const [localTitle, setLocalTitle] = React.useState("");
  const [localDate, setLocalDate] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  // Update local state when timebox loads
  React.useEffect(() => {
    if (timebox) {
      setLocalTitle(timebox.title);
      setLocalDate(timebox.date);
    }
  }, [timebox]);
  
  // Auto-save title with debounce
  React.useEffect(() => {
    if (!timebox || localTitle === timebox.title) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        await updateTimebox({ title: localTitle });
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timeoutId);
  }, [localTitle, timebox, updateTimebox]);
  
  const handleSave = async () => {
    if (!timebox) return;
    
    try {
      setIsUpdating(true);
      await updateTimebox({
        title: localTitle
      });
      // Could show success message here
    } catch (error) {
      console.error('Failed to save:', error);
      // Could show error message here
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-foreground-500">Loading timebox...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !timebox) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardBody className="text-center py-12">
            <Icon icon="lucide:alert-triangle" className="text-4xl text-danger mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2 text-danger">Timebox Not Found</h2>
            <p className="text-foreground-500 mb-4">
              {error || "The requested timebox sheet could not be found."}
            </p>
            <Button 
              color="primary" 
              onPress={() => history.push("/")}
              startContent={<Icon icon="lucide:home" />}
            >
              Go Home
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            value={localTitle}
            onValueChange={setLocalTitle}
            variant="bordered"
            size="lg"
            className="font-semibold"
            classNames={{
              input: "text-xl",
              inputWrapper: "border-none bg-transparent"
            }}
            placeholder="Enter timebox title..."
          />
          {/* Date display - read only with timezone fix */}
          <div className="flex items-center gap-2 mt-2 text-sm text-foreground-500">
            <Icon icon="lucide:calendar" className="w-4 h-4" />
            <span>{(() => {
              // Fix timezone issue by parsing date in local timezone
              const [year, month, day] = localDate.split('-').map(Number);
              const date = new Date(year, month - 1, day); // month is 0-indexed
              return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            })()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="flat" 
            startContent={<Icon icon="lucide:share-2" />}
            isDisabled // TODO: Implement sharing
          >
            Share
          </Button>
          <Button 
            color="primary" 
            variant="flat" 
            startContent={isUpdating ? <Spinner size="sm" /> : <Icon icon="lucide:save" />}
            onPress={handleSave}
            isDisabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopPriorities timeboxId={id} timebox={timebox} onUpdate={updateTimebox} />
          <div className="mt-6">
            <BrainDump timeboxId={id} timebox={timebox} onUpdate={updateTimebox} />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Schedule timeboxId={id} timebox={timebox} onUpdate={updateTimebox} />
        </div>
      </div>
    </div>
  );
};