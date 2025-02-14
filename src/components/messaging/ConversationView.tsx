import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";

interface MessageBubbleProps {
  message: any;
  isSelf: boolean;
  senderAvatar?: string;
  senderName?: string;
}

const MessageBubble = ({
  message,
  isSelf,
  senderAvatar,
  senderName,
}: MessageBubbleProps) => {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex ${isSelf ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[70%]`}
      >
        <Avatar className="h-8 w-8">
          <img src={senderAvatar} alt={senderName} />
        </Avatar>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isSelf ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">
            {message.content.split("\n").map((line, i) => {
              // Match markdown image and link syntax
              const imgMatch = line.match(/!\[([^\]]*)\]\(([^\)]*)\)/);
              const linkMatch = line.match(/\[([^\]]*)\]\(([^\)]*)\)/);

              if (imgMatch) {
                return (
                  <img
                    key={i}
                    src={imgMatch[2]}
                    alt={imgMatch[1]}
                    className="max-w-[300px] rounded-lg my-2"
                  />
                );
              } else if (linkMatch) {
                return (
                  <a
                    key={i}
                    href={linkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {linkMatch[1]}
                  </a>
                );
              }
              return (
                <span key={i}>
                  {line}
                  <br />
                </span>
              );
            })}
          </p>
          <div
            className={`flex items-center gap-1 text-xs mt-1 ${
              isSelf ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <span>{format(new Date(message.created_at), "HH:mm")}</span>
            {isSelf && message.read_at && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCheck className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Read</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversationView = () => {
  const { messages, currentConversation } = useChat();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const { typingUsers } = useChat();

  if (!currentConversation) {
    return (
      <div className="h-full bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-muted-foreground">
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-950 flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isSelf = message.sender_id === user?.id;
            const sender = currentConversation.participants.find(
              (p) => p.id === message.sender_id,
            );

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isSelf={isSelf}
                senderAvatar={sender?.avatar_url}
                senderName={sender?.username}
              />
            );
          })}
          {typingUsers[currentConversation.id]?.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
              <span>
                {currentConversation.participants
                  .filter((p) =>
                    typingUsers[currentConversation.id].includes(p.id),
                  )
                  .map((p) => p.username)
                  .join(", ")}{" "}
                is typing
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationView;
