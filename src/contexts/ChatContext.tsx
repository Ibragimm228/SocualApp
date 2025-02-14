import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];
type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  participants: Profile[];
  last_message?: Message;
};

interface ChatContextType {
  uploadFile: (file: File) => Promise<string>;
  searchMessages: (query: string) => Promise<Message[]>;
  typingUsers: { [key: string]: string[] };
  setTyping: (conversationId: string, isTyping: boolean) => void;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation) => void;
  startConversation: (participantId: string) => Promise<void>;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string[] }>(
    {},
  );

  useEffect(() => {
    if (user) {
      // Fetch conversations
      fetchConversations();

      // Subscribe to new messages and presence
      const channel = supabase.channel("chat");

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const typing: { [key: string]: string[] } = {};

          Object.values(state).forEach((presence) => {
            presence.forEach((p: any) => {
              if (p.typing) {
                if (!typing[p.typing]) typing[p.typing] = [];
                typing[p.typing].push(p.user_id);
              }
            });
          });

          setTypingUsers(typing);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });

      const messagesSubscription = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const newMessage = payload.new as Message;
            if (newMessage.conversation_id === currentConversation?.id) {
              setMessages((prev) => [...prev, newMessage]);
            }
            // Update last message in conversations
            updateConversationLastMessage(newMessage);
          },
        )
        .subscribe();

      return () => {
        messagesSubscription.unsubscribe();
      };
    }
  }, [user, currentConversation?.id]);

  const fetchConversations = async () => {
    try {
      // Get conversations and their participants in a single query
      // First get the conversations where the user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user?.id);

      if (participantError) throw participantError;

      if (!participantData || participantData.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = participantData.map((p) => p.conversation_id);

      // Then get the full conversation data
      // Get conversations with their participants
      const { data: conversationsData, error: conversationsError } =
        await supabase
          .from("conversations")
          .select(
            `
          *,
          conversation_participants!inner (profile:profiles!inner(*)),
          messages!left (content, created_at, sender_id, read_at)
        `,
          )
          .in("id", conversationIds)
          .order("created_at", { ascending: false });

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        setConversations([]);
        return;
      }

      if (!conversationsData) {
        setConversations([]);
        return;
      }

      // Format the conversations data
      const formattedConversations = conversationsData.map((conv: any) => ({
        ...conv,
        participants: conv.participants
          .map((p: any) => p.profile)
          .filter(Boolean),
        last_message: conv.messages?.[0],
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConversationLastMessage = (message: Message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversation_id
          ? { ...conv, last_message: message }
          : conv,
      ),
    );
  };

  const startConversation = async (participantId: string) => {
    try {
      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Add participants
      const participants = [user?.id, participantId];
      const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert(
          participants.map((id) => ({
            conversation_id: newConversation.id,
            profile_id: id,
          })),
        );

      if (participantsError) throw participantsError;

      // Fetch the complete conversation with participants
      await fetchConversations();
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentConversation || !user) return;

    try {
      const { error } = await supabase.from("messages").insert({
        content,
        conversation_id: currentConversation.id,
        sender_id: user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (currentConversation) {
      // Fetch messages for current conversation
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", currentConversation.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          return;
        }

        setMessages(data);
      };

      fetchMessages();
    }
  }, [currentConversation]);

  const searchMessages = async (query: string) => {
    if (!currentConversation || !query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversation.id)
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching messages:", error);
      return [];
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const setTyping = async (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    const channel = supabase.channel("chat");
    await channel.track({
      user_id: user.id,
      typing: isTyping ? conversationId : null,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        sendMessage,
        setCurrentConversation,
        startConversation,
        loading,
        typingUsers,
        setTyping,
        searchMessages,
        uploadFile,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
