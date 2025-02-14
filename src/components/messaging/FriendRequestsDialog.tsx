import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface FriendRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: any[];
  onRequestsChange: () => void;
}

const FriendRequestsDialog = ({
  open,
  onOpenChange,
  requests,
  onRequestsChange,
}: FriendRequestsDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRequest = async (
    requestId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: `Friend request ${status}`,
        description:
          status === "accepted"
            ? "You are now friends!"
            : "Friend request rejected",
      });

      onRequestsChange();
    } catch (error) {
      console.error(`Error ${status} friend request:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not ${status} friend request`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Friend Requests</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No pending friend requests
            </p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-2 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.sender.avatar_url} />
                    <AvatarFallback>
                      {request.sender.username?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.sender.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, "accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendRequestsDialog;
