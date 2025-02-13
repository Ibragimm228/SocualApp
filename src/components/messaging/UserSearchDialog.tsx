import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";

const UserSearchDialog = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { startConversation } = useChat();
  const [open, setOpen] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user?.id)
        .ilike("username", `%${query}%`)
        .limit(5);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (userId: string) => {
    await startConversation(userId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <UserPlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchUsers(e.target.value);
            }}
          />
          <div className="space-y-2">
            {loading && (
              <p className="text-sm text-muted-foreground">Searching...</p>
            )}
            {!loading && users.length === 0 && search && (
              <p className="text-sm text-muted-foreground">No users found</p>
            )}
            {users.map((user) => (
              <button
                key={user.id}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors"
                onClick={() => handleStartConversation(user.id)}
              >
                <Avatar>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.username?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.status || "offline"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;
