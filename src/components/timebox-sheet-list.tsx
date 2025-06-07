// src/components/timebox-sheet-list.tsx
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Button, Tooltip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTimeboxes } from "../hooks/useTimeboxes";

interface TimeboxSheetListProps {
  isCollapsed: boolean;
}

export const TimeboxSheetList: React.FC<TimeboxSheetListProps> = ({ isCollapsed }) => {
  const history = useHistory();
  const location = useLocation();
  const { timeboxes, loading, deleteTimebox } = useTimeboxes();
  
  const navigateToSheet = (id: string) => {
    history.push(`/timebox/${id}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const handleDeleteSheet = async (id: string) => {
    
    try {
      await deleteTimebox(id);
      
      // If we're on the deleted sheet, navigate home
      if (location.pathname === `/timebox/${id}`) {
        history.push("/");
      }
    } catch (error) {
      console.error('Failed to delete timebox:', error);
      // You could add a toast notification here
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    );
  }

  if (timeboxes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-foreground-400">
          {isCollapsed ? "No sheets" : "No timebox sheets yet"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {timeboxes.map((sheet) => {
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
              onPress={() => handleDeleteSheet(sheet.id)}
            >
              <Icon icon="lucide:trash-2" className="text-xs" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};