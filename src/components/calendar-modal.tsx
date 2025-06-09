// src/components/calendar-modal.tsx
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useHistory } from "react-router-dom";
import { DatePicker } from "@heroui/react";
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { useTimeboxes } from "../hooks/useTimeboxes";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const history = useHistory();
  const { timeboxes, createTimebox, checkDateExists } = useTimeboxes();
  const [selectedDate, setSelectedDate] = React.useState<CalendarDate>(today(getLocalTimeZone()));
  const [customTitle, setCustomTitle] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Get existing dates from timeboxes
  const existingDates = timeboxes.map(tb => tb.date);
  
  // Generate default title when date changes
  React.useEffect(() => {
    try {
      // Fix timezone issue by parsing date in local timezone
      const dateStr = selectedDate.toString();
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      const defaultTitle = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      setCustomTitle(defaultTitle);
    } catch (e) {
      setCustomTitle("New Timebox");
    }
  }, [selectedDate]);
  
  const isDateUnavailable = (date: CalendarDate) => {
    const dateStr = date.toString();
    return existingDates.includes(dateStr);
  };
  
  const handleCreateSheet = async () => {
    try {
      setIsCreating(true);
      setError(null);
      
      const dateStr = selectedDate.toString();
      
      // Check if sheet already exists
      const exists = await checkDateExists(dateStr);
      
      if (exists) {
        // Navigate to existing sheet
        const existingSheet = timeboxes.find(tb => tb.date === dateStr);
        if (existingSheet) {
          history.push(`/timebox/${existingSheet.id}`);
        }
      } else {
        // Create new sheet with custom title
        const newTimebox = await createTimebox(dateStr, customTitle.trim() || undefined);
        history.push(`/timebox/${newTimebox.id}`);
      }
      
      onClose();
      // Reset title for next time
      setCustomTitle("");
    } catch (error) {
      console.error('Failed to create/navigate to timebox:', error);
      setError('Failed to create timebox. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  const selectedDateExists = isDateUnavailable(selectedDate);
  
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {selectedDateExists ? "View Timebox Sheet" : "Create Timebox Sheet"}
            </ModalHeader>
            <ModalBody>
              <p className="text-foreground-500 mb-4">
                {selectedDateExists 
                  ? "A timebox sheet already exists for this date. You'll be redirected to it."
                  : "Select a date and customize the title for your new timebox sheet."
                }
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:alert-circle" className="text-danger" />
                    <span className="text-danger text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  isDateUnavailable={isDateUnavailable}
                  minValue={parseDate("2023-01-01")}
                  maxValue={parseDate("2025-12-31")}
                />
                
                {!selectedDateExists && (
                  <Input
                    label="Timebox Title"
                    placeholder="Enter a custom title"
                    value={customTitle}
                    onValueChange={setCustomTitle}
                    description="Leave empty to use the default date format"
                    startContent={<Icon icon="lucide:edit" className="text-foreground-400" />}
                  />
                )}
                
                {selectedDateExists && (
                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:info" className="text-warning-600" />
                      <span className="text-warning-700 text-sm">
                        Sheet exists for {selectedDate.toString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose} isDisabled={isCreating}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleCreateSheet}
                isDisabled={isCreating}
                startContent={isCreating ? <Spinner size="sm" /> : null}
              >
                {isCreating ? "Creating..." : (selectedDateExists ? "View Sheet" : "Create Sheet")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};