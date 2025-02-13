import React from "react";
import ChatLayout from "./messaging/ChatLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";

const Home = () => {
  const { profile } = useAuth();

  return (
    <div className="h-screen w-full bg-background">
      <ChatProvider>
        <ChatLayout
          userName={profile?.username || "Guest"}
          userAvatar={
            profile?.avatar_url ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
          }
          userStatus={profile?.status || "online"}
        />
      </ChatProvider>
    </div>
  );
};

export default Home;
