import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";

interface TimeboxSheet {
  id: string;
  title: string;
  date: string;
}

interface TimeboxSheetListProps {
  isCollapsed: boolean;
}

export const TimeboxSheetList: React.FC<TimeboxSheetListProps> = ({ isCollapsed }) => {
  const history = useHistory();
  const location = useLocation();
  
  // Mock data for timebox sheets
  const [sheets, setSheets] = React.useState<TimeboxSheet[]>([
    { id: "sheet-2023-10-16", title: "Monday Planning", date: "2023-10-16" },
    { id: "sheet-2023-10-17", title: "Tuesday Focus", date: "2023-10-17" },
    { id: "sheet-2023-10-18", title: "Project Deadline", date: "2023-10-18" },
    { id: "sheet-2023-10-20", title: "Weekly Review", date: "2023-10-20" },
    { id: "sheet-2023-10-31", title: "Monthly Goals", date: "2023-10-31" },
  ]);
  
  const navigateToSheet = (id: string) => {
    history.push(`/timebox/${id}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Add delete function
  const handleDeleteSheet = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    // In a real app, you would delete from a database
    setSheets(sheets.filter(sheet => sheet.id !== id));
    
    // Show confirmation toast
    addToast({
      title: "Sheet Deleted",
      description: "Your timebox sheet has been deleted successfully",
      color: "success",
    });
    
    // If we're on the deleted sheet, navigate home
    if (location.pathname === `/timebox/${id}`) {
      history.push("/");
    }
  };
  
  return (
    <div className="space-y-1">
      {sheets.map((sheet) => {
        const isActive = location.pathname === `/timebox/${sheet.id}`;
        
        return isCollapsed ? (
          <Tooltip key={sheet.id} content={sheet.title} placement="right">
            <Button
              variant="flat"
              color={isActive ? "primary" : "default"}
              className="w-full justify-center"
              isIconOnly
              onPress={() => navigateToSheet(sheet.id)}
            >
              <Icon icon="lucide:calendar" />
            </Button>
          </Tooltip>
        ) : (
          <div key={sheet.id} className="relative group">
            <Button
              variant="flat"
              color={isActive ? "primary" : "default"}
              className="w-full justify-start pr-8"
              onPress={() => navigateToSheet(sheet.id)}
              startContent={<Icon icon="lucide:calendar" />}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm truncate max-w-[160px]">{sheet.title}</span>
                <span className="text-xs text-foreground-400">{formatDate(sheet.date)}</span>
              </div>
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onPress={(e) => handleDeleteSheet(e, sheet.id)}
            >
              <Icon icon="lucide:trash-2" className="text-xs" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};