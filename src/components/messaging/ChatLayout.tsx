import React from "react";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import { useChat } from "@/contexts/ChatContext";

interface ChatLayoutProps {
  userName?: string;
  userAvatar?: string;
  userStatus?: "online" | "away" | "offline";
}

const ChatLayout = React.memo(function ChatLayout({
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  userStatus = "online",
}: ChatLayoutProps) {
  const { sendMessage, setCurrentConversation, conversations } = useChat();

  const handleContactSelect = (contactId: string) => {
    const conversation = conversations.find((conv) =>
      conv.participants.some((p) => p.id === contactId),
    );
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  return (
    <div className="flex h-full w-full bg-background">
      <div className="w-[380px] h-full">
        <LeftPanel
          onContactSelect={handleContactSelect}
          userName={userName}
          userAvatar={userAvatar}
          userStatus={userStatus}
        />
      </div>
      <div className="flex-1 h-full">
        <RightPanel onSendMessage={sendMessage} />
      </div>
    </div>
  );
});

export default ChatLayout;
