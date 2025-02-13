import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { useChat } from "@/contexts/ChatContext";
import { format } from "date-fns";

interface ContactsListProps {
  onSelectContact?: (contactId: string) => void;
  selectedContactId?: string;
}

const ContactsList = ({
  onSelectContact = () => {},
  selectedContactId = "",
}: ContactsListProps) => {
  const { conversations } = useChat();

  return (
    <div className="h-full bg-background border-r">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-1 p-2">
          {conversations.map((conversation) => {
            const otherParticipant = conversation.participants[0];
            const lastMessage = conversation.last_message;

            return (
              <button
                key={conversation.id}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors ${
                  selectedContactId === otherParticipant.id ? "bg-accent" : ""
                }`}
                onClick={() => onSelectContact(otherParticipant.id)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src={otherParticipant.avatar_url || undefined}
                      alt={otherParticipant.username || ""}
                    />
                    <AvatarFallback>
                      {(otherParticipant.username || "").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {otherParticipant.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">
                      {otherParticipant.username}
                    </p>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(lastMessage.created_at), "HH:mm")}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage?.content || "No messages yet"}
                    </p>
                    {!lastMessage?.read_at && (
                      <Badge variant="secondary" className="ml-2">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContactsList;
