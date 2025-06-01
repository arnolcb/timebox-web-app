import React from "react";
import { Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ThemeSwitcher } from "./theme-switcher";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const handleNavigation = (path: string) => {
    history.push(path);
  };

  return (
    <header className="flex items-center justify-between px-4 h-16 border-b border-divider bg-content1">
      <div className="flex items-center">
        <Button 
          isIconOnly 
          variant="light" 
          onPress={toggleSidebar} 
          className="mr-2"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Icon icon={isMobile ? "lucide:menu" : (isSidebarOpen ? "lucide:panel-left-close" : "lucide:panel-left-open")} className="text-xl" />
        </Button>
        <div className="flex items-center gap-2"> 
          {/* This is a placeholder for the logo, replace with your actual logo component 
          <div className="bg-primary p-1 rounded text-white text-xs font-bold">T</div>*/}
          <h1 className="text-lg font-medium">Timebox</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button variant="light" isIconOnly className="rounded-full">
                <Avatar
                  name={user.name}
                  size="sm"
                  src={user.avatar}
                  className="cursor-pointer"
                  isBordered
                  color="primary"
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User actions">
              <DropdownItem key="user-info" className="h-14 gap-2" textValue={user.name}>
                <div className="flex items-center gap-2">
                  <Avatar
                    size="sm"
                    src={user.avatar}
                    name={user.name}
                  />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-foreground-400">{user.email}</p>
                  </div>
                </div>
              </DropdownItem>
              <DropdownItem 
                key="profile" 
                startContent={<Icon icon="lucide:user" />}
                onPress={() => handleNavigation("/profile")}
              >
                Profile
              </DropdownItem>
              <DropdownItem 
                key="settings" 
                startContent={<Icon icon="lucide:settings" />}
                onPress={() => handleNavigation("/settings")}
              >
                Settings
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                startContent={<Icon icon="lucide:log-out" />} 
                color="danger"
                onPress={handleLogout}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button 
            color="primary" 
            variant="flat" 
            size="sm"
            onPress={() => handleNavigation("/login")}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};