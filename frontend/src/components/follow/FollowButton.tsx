"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/services/api-client";

interface FollowButtonProps {
  userId: string;
  initialStatus: "PENDING" | "ACCEPTED" | "NONE";
  onStatusChange?: (status: "PENDING" | "ACCEPTED" | "NONE") => void;
}

export function FollowButton({ userId, initialStatus, onStatusChange }: FollowButtonProps) {
  const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "NONE">(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post("/follow/follow", { followingId: userId });
      const newStatus = response.data.data.status;
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
      toast.success(newStatus === "ACCEPTED" ? "Following" : "Follow request sent");
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try {
      await apiClient.post("/follow/unfollow", { followingId: userId });
      setStatus("NONE");
      if (onStatusChange) onStatusChange("NONE");
      toast.success("Unfollowed");
    } catch (error) {
      toast.error("Failed to unfollow user");
    } finally {
      setLoading(false);
    }
  };

  if (status === "ACCEPTED") {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleUnfollow} 
        disabled={loading}
        className="gap-2 rounded-xl font-bold h-9"
      >
        <UserCheck className="h-4 w-4" />
        Following
      </Button>
    );
  }

  if (status === "PENDING") {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleUnfollow} 
        disabled={loading}
        className="gap-2 rounded-xl font-bold h-9 bg-muted/20"
      >
        <Clock className="h-4 w-4" />
        Requested
      </Button>
    );
  }

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={handleFollow} 
      disabled={loading}
      className="gap-2 rounded-xl font-bold h-9 shadow-sm"
    >
      <UserPlus className="h-4 w-4" />
      Follow
    </Button>
  );
}
