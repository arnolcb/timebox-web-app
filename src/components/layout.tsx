import React from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Drawer, DrawerContent, DrawerBody } from "@heroui/react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);
  
  // Add resize listener to detect mobile devices
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Close sidebar by default on mobile
  React.useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar - only visible on desktop */}
      {!isMobile && (
        <Sidebar isOpen={isSidebarOpen} />
      )}
      
      {/* Mobile drawer - only on mobile */}
      {isMobile && (
        <Drawer 
          isOpen={isSidebarOpen} 
          onOpenChange={setIsSidebarOpen}
          placement="left"
          size="xs"
          hideCloseButton={true} // Hide the default close button
        >
          <DrawerContent>
            {(onClose) => (
              <DrawerBody className="p-0">
                <Sidebar isOpen={true} onClose={onClose} />
              </DrawerBody>
            )}
          </DrawerContent>
        </Drawer>
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isMobile={isMobile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};