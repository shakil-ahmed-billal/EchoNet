import { UserSuggestion } from "@/services/users.service";
import { followUser, unfollowUser, acceptUser } from "@/services/follow.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus, UserCheck, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FriendCardProps {
  user: UserSuggestion;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  mode?: 'suggestion' | 'request';
}

export function FriendCard({ user, className, layout = 'vertical', mode = 'suggestion' }: FriendCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [hidden, setHidden] = useState(false);
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => isFollowing ? unfollowUser(user.id) : followUser(user.id),
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? `Cancelled request to ${user.name}` : `Friend request sent to ${user.name}`);
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Something went wrong"),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptUser(user.id),
    onSuccess: () => {
      toast.success(`You are now friends with ${user.name}`);
      setHidden(true);
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => unfollowUser(user.id),
    onSuccess: () => {
      toast.info(`Declined request from ${user.name}`);
      setHidden(true);
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  if (hidden) return null;

  const dummyAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

  if (layout === 'horizontal') {
    return (
      <div className={cn("bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-row items-center p-3 sm:p-4 gap-3 sm:gap-4", className)}>
        <Link href={`/profile/${user.id}`} className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full relative overflow-hidden bg-muted shrink-0 border border-border/20">
          <img 
            src={user.image || user.avatarUrl || dummyAvatar} 
            alt={user.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex flex-col min-w-0 flex-1">
          <Link href={`/profile/${user.id}`}>
            <h4 className="font-bold text-sm text-foreground/90 truncate hover:text-primary transition-colors leading-tight">{user.name}</h4>
          </Link>
          <p className="text-[11px] font-bold text-muted-foreground/50 tracking-wide mt-1">
            {mode === 'suggestion' ? "Suggested for you" : "Sent you a request"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
          {mode === 'suggestion' ? (
            <>
              <Button 
                variant={isFollowing ? "secondary" : "default"} 
                className="h-8 sm:h-9 md:h-10 rounded-xl text-xs sm:text-[13px] font-bold shadow-sm w-[100px] sm:w-[120px]"
                disabled={followMutation.isPending}
                onClick={() => followMutation.mutate()}
              >
                {followMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  isFollowing ? <><UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" /> Sent</> : <><UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" /> Add Friend</>
                )}
              </Button>
              {!isFollowing && (
                <Button 
                  variant="ghost" 
                  className="h-8 sm:h-9 md:h-10 rounded-xl text-xs sm:text-[13px] font-semibold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all w-[100px] sm:w-auto"
                  onClick={() => setHidden(true)}
                >
                  Remove
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                className="h-8 sm:h-9 md:h-10 rounded-xl text-xs sm:text-[13px] font-bold shadow-sm w-[100px] sm:w-[120px]"
                disabled={acceptMutation.isPending}
                onClick={() => acceptMutation.mutate()}
              >
                {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-3.5 w-3.5 mr-1.5" /> Confirm</>}
              </Button>
              <Button 
                variant="secondary"
                className="h-8 sm:h-9 md:h-10 rounded-xl text-xs sm:text-[13px] font-semibold bg-muted hover:bg-muted/80 w-[100px] sm:w-[120px]"
                disabled={declineMutation.isPending}
                onClick={() => declineMutation.mutate()}
              >
                {declineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-3.5 w-3.5 mr-1.5" /> Delete</>}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full", className)}>
      <Link href={`/profile/${user.id}`} className="aspect-square w-full relative overflow-hidden bg-muted block">
        <img 
          src={user.image || user.avatarUrl || dummyAvatar} 
          alt={user.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <Link href={`/profile/${user.id}`}>
          <h4 className="font-bold text-[15px] text-foreground/90 truncate hover:text-primary transition-colors leading-tight">{user.name}</h4>
          <p className="text-[11px] font-bold text-muted-foreground/40 tracking-wide mt-1">
            {mode === 'suggestion' ? "Suggested for you" : "Friend Request"}
          </p>
        </Link>
        <div className="mt-auto flex flex-col gap-2">
          {mode === 'suggestion' ? (
            <>
              <Button 
                variant={isFollowing ? "secondary" : "default"} 
                className="w-full h-9 rounded-xl text-xs sm:text-[13px] font-bold shadow-sm"
                disabled={followMutation.isPending}
                onClick={() => followMutation.mutate()}
              >
                {followMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                  isFollowing ? <><UserCheck className="h-3.5 w-3.5 mr-1.5" /> Sent</> : <><UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Friend</>
                )}
              </Button>
              {!isFollowing && (
                <Button 
                  variant="ghost" 
                  className="w-full h-9 rounded-xl text-[12px] sm:text-[13px] font-semibold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all"
                  onClick={() => setHidden(true)}
                >
                  Remove
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                className="w-full h-9 rounded-xl text-xs sm:text-[13px] font-bold shadow-sm"
                disabled={acceptMutation.isPending}
                onClick={() => acceptMutation.mutate()}
              >
                {acceptMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="h-3.5 w-3.5 mr-1.5" /> Confirm</>}
              </Button>
              <Button 
                variant="secondary"
                className="w-full h-9 rounded-xl text-[12px] sm:text-[13px] font-semibold bg-muted hover:bg-muted/80 transition-all"
                disabled={declineMutation.isPending}
                onClick={() => declineMutation.mutate()}
              >
                {declineMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><X className="h-3.5 w-3.5 mr-1.5" /> Delete</>}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
