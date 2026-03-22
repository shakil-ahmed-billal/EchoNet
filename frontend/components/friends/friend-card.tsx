"use client";

import { UserSuggestion } from "@/services/users.service";
import { followUser, unfollowUser } from "@/services/follow.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FriendCard({ user, className }: { user: UserSuggestion, className?: string }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [hidden, setHidden] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => isFollowing ? unfollowUser(user.id) : followUser(user.id),
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? `Cancelled request to ${user.name}` : `Friend request sent to ${user.name}`);
      queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Something went wrong"),
  });

  if (hidden) return null;

  const dummyAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

  return (
    <div className={cn("bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full", className)}>
      <Link href={`/profile/${user.id}`} className="aspect-square w-full relative overflow-hidden bg-muted block">
        <img 
          src={user.image || user.avatarUrl || dummyAvatar} 
          alt={user.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <Link href={`/profile/${user.id}`}>
          <h4 className="font-bold text-[14px] sm:text-[15px] truncate hover:text-primary transition-colors leading-tight">{user.name}</h4>
        </Link>
        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          <Button 
            variant={isFollowing ? "secondary" : "default"} 
            className="w-full h-8 sm:h-9 rounded-xl text-xs sm:text-[13px] font-bold shadow-sm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
              isFollowing ? <><UserCheck className="h-3.5 w-3.5 mr-1.5" /> Request Sent</> : <><UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Friend</>
            )}
          </Button>
          {!isFollowing && (
            <Button 
              variant="ghost" 
              className="w-full h-8 sm:h-9 rounded-xl text-[12px] sm:text-[13px] font-semibold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all"
              onClick={() => setHidden(true)}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
