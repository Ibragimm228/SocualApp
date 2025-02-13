import React from "react";
import ConversationView from "./ConversationView";
import MessageInput from "./MessageInput";

interface Contact {
  id: string;
  name: string;
  avatar: string;
}

interface RightPanelProps {
  selectedContact?: Contact;
  onSendMessage?: (message: string) => void;
}

const defaultContact: Contact = {
  id: "1",
  name: "Jane Doe",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
};

const RightPanel = ({
  selectedContact = defaultContact,
  onSendMessage = () => {},
}: RightPanelProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{selectedContact.name}</h2>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-hidden">
        <ConversationView />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default RightPanel;
