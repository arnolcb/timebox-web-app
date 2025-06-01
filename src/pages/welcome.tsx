import React from "react";
import { useHistory } from "react-router-dom";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

export const WelcomePage: React.FC = () => {
  const history = useHistory();
  
  const createNewSheet = () => {
    // In a real app, we would create a new sheet and get its ID
    const newSheetId = `sheet-${Date.now()}`;
    history.push(`/timebox/${newSheetId}`);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Timebox</h1>
        <p className="text-foreground-500 max-w-lg mx-auto">
          Organize your day with top priorities, brain dumps, and scheduled time blocks to maximize productivity.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="lucide:check-circle" className="text-primary text-xl" />
                <h2 className="text-xl font-semibold">Get Started</h2>
              </div>
              <p className="text-foreground-500 mb-6">
                Create your first timebox sheet to start organizing your day effectively.
              </p>
              <Button 
                color="primary" 
                onPress={createNewSheet}
                startContent={<Icon icon="lucide:plus" />}
              >
                Create New Sheet
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="lucide:info" className="text-primary text-xl" />
                <h2 className="text-xl font-semibold">How It Works</h2>
              </div>
              <ul className="space-y-3 text-foreground-500">
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:target" className="text-foreground-400 mt-1" />
                  <span>Set your <strong>top priorities</strong> for the day</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:brain" className="text-foreground-400 mt-1" />
                  <span>Use the <strong>brain dump</strong> to capture all your thoughts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:clock" className="text-foreground-400 mt-1" />
                  <span>Schedule your day with <strong>time blocks</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Icon icon="lucide:target" className="text-primary text-xl" />
              </div>
              <h3 className="font-medium">Top Priorities</h3>
            </div>
            <p className="text-sm text-foreground-500">
              Focus on what matters most by identifying your 3-5 most important tasks for the day.
            </p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Icon icon="lucide:brain" className="text-primary text-xl" />
              </div>
              <h3 className="font-medium">Brain Dump</h3>
            </div>
            <p className="text-sm text-foreground-500">
              Clear your mind by writing down all your thoughts, ideas, and tasks in one place.
            </p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Icon icon="lucide:clock" className="text-primary text-xl" />
              </div>
              <h3 className="font-medium">Schedule</h3>
            </div>
            <p className="text-sm text-foreground-500">
              Plan your day hour by hour to ensure you allocate time for your priorities.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};