import React, { Suspense, lazy } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import ContactsList from "./ContactsList";
import ProfileSection from "./ProfileSection";

const UserSearchDialog = lazy(() => import("./UserSearchDialog"));

interface LeftPanelProps {
  onContactSelect?: (contactId: string) => void;
  selectedContactId?: string;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  userName?: string;
  userAvatar?: string;
  userStatus?: "online" | "away" | "offline";
}

const LeftPanel = ({
  onContactSelect = () => {},
  selectedContactId = "",
  onSettingsClick = () => {},
  onLogoutClick = () => {},
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  userStatus = "online",
}: LeftPanelProps) => {
  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-9" />
          </div>
          <Suspense fallback={null}>
            <UserSearchDialog />
          </Suspense>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ContactsList
          onSelectContact={onContactSelect}
          selectedContactId={selectedContactId}
        />
      </div>

      <ProfileSection
        userName={userName}
        userAvatar={userAvatar}
        status={userStatus}
        onSettingsClick={onSettingsClick}
        onLogoutClick={onLogoutClick}
      />
    </div>
  );
};

export default LeftPanel;
