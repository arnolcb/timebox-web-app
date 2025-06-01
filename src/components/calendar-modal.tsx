import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useHistory } from "react-router-dom";
import { DatePicker } from "@heroui/react";
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const history = useHistory();
  const [selectedDate, setSelectedDate] = React.useState<CalendarDate>(today(getLocalTimeZone()));
  const formatter = useDateFormatter({ dateStyle: "full" });
  
  // Function to check if a date already has a timebox sheet
  const [existingDates, setExistingDates] = React.useState<string[]>([
    "2023-10-16", "2023-10-17", "2023-10-18", "2023-10-20", "2023-10-31"
  ]);
  
  const isDateUnavailable = (date: CalendarDate) => {
    const dateStr = date.toString();
    return existingDates.includes(dateStr);
  };
  
  const handleCreateSheet = () => {
    // Format the date as YYYY-MM-DD
    const dateStr = selectedDate.toString();
    
    // Check if sheet already exists
    if (existingDates.includes(dateStr)) {
      // Navigate to existing sheet (in a real app, you'd look up the ID)
      const existingSheetId = `sheet-${dateStr}`;
      history.push(`/timebox/${existingSheetId}`);
    } else {
      // Create new sheet with date as ID
      const newSheetId = `sheet-${dateStr}`;
      
      // In a real app, you would save this to a database
      setExistingDates([...existingDates, dateStr]);
      
      // Navigate to the new sheet
      history.push(`/timebox/${newSheetId}`);
    }
    
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create Timebox Sheet
            </ModalHeader>
            <ModalBody>
              <p className="text-foreground-500 mb-4">
                Select a date to create or view a timebox sheet. You can only have one sheet per day.
              </p>
              
              <div className="flex flex-col items-center">
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  isDateUnavailable={isDateUnavailable}
                  minValue={parseDate("2023-01-01")}
                  maxValue={parseDate("2025-12-31")}
                />
                
                {isDateUnavailable(selectedDate) && (
                  <div className="mt-4 p-2 bg-warning-100 text-warning-700 rounded-md flex items-center gap-2">
                    <Icon icon="lucide:info" />
                    <span>A timebox sheet already exists for this date. You'll be redirected to it.</span>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleCreateSheet}>
                {isDateUnavailable(selectedDate) ? "View Sheet" : "Create Sheet"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};