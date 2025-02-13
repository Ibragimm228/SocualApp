import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Settings, LogOut, User, Bell } from "lucide-react";

interface ProfileSectionProps {
  userName?: string;
  userAvatar?: string;
  status?: "online" | "away" | "offline";
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

const ProfileSection = ({
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  status = "online",
  onSettingsClick = () => {},
  onLogoutClick = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
  },
}: ProfileSectionProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-t bg-background">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-sm">{userName}</h3>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-500" : "bg-gray-500"}`}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSettingsClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogoutClick}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProfileSection;
