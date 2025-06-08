import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Button, Divider, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TimeboxSheetList } from "./timebox-sheet-list";
import { CalendarModal } from "./calendar-modal";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void; // Add optional onClose prop for mobile
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const history = useHistory();
  const location = useLocation();
  
  // Add state for calendar modal
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const navigateToHome = () => {
    history.push("/");
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  const navigateToSettings = () => {
    history.push("/settings");
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  // Replace createNewSheet function
  const openCalendar = () => {
    setIsCalendarOpen(true);
  };

  return (
    <aside 
      className={`bg-content1 border-r border-divider flex flex-col overflow-hidden h-full ${
        onClose 
          ? "w-full max-w-xs" // Mobile: full width of drawer with max width
          : isOpen 
            ? "w-64" // Desktop: fixed width when open
            : "w-0 sm:w-16" // Desktop: collapsed
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {isOpen && <h2 className="font-semibold text-lg">My Timebox</h2>}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Add close button for mobile */}
          {onClose && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={onClose}
              aria-label="Close sidebar"
            >
              <Icon icon="lucide:x" className="text-lg" />
            </Button>
          )}
          <Tooltip content="Create Timebox Sheet" placement="right">
            <Button 
              isIconOnly 
              color="primary" 
              size="sm" 
              variant="flat" 
              onPress={openCalendar}
              aria-label="Create new timebox sheet"
            >
              <Icon icon="lucide:plus" className="text-lg" />
            </Button>
          </Tooltip>
        </div>
      </div>
      
      <Divider />
      
      <div className="overflow-y-auto flex-1">
        <div className="p-2">
          <Button
            variant="flat"
            color={location.pathname === "/" ? "primary" : "default"}
            className={`w-full justify-start mb-2 ${!isOpen ? "justify-center" : ""}`}
            startContent={isOpen ? <Icon icon="lucide:home" /> : null}
            isIconOnly={!isOpen}
            onPress={navigateToHome}
          >
            {!isOpen ? <Icon icon="lucide:home" /> : "Home"}
          </Button>
          
          <Divider className="my-2" />
          
          {isOpen && <p className="text-xs text-foreground-500 px-2 py-1">TIMEBOX SHEETS</p>}
          
          <TimeboxSheetList isCollapsed={!isOpen} onItemClick={onClose} />
        </div>
      </div>
      
      <div className="p-4 border-t border-divider">
        <Button
          variant="flat"
          className={`w-full justify-start ${!isOpen ? "justify-center" : ""}`}
          startContent={isOpen ? <Icon icon="lucide:settings" /> : null}
          isIconOnly={!isOpen}
          onPress={navigateToSettings}
        >
          {!isOpen ? <Icon icon="lucide:settings" /> : "Settings"}
        </Button>
      </div>
      
      {/* Add Calendar Modal */}
      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
      />
    </aside>
  );
};