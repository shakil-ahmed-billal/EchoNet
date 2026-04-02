"use client";

import { useQuery } from "@tanstack/react-query";
import { getPendingRequests } from "@/services/follow.service";
import { FriendCard } from "@/components/friends/friend-card";
import { useAuth } from "@/hooks/use-auth";
import { Bell, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ScrollContainer } from "@/components/ui/scroll-container";

export function FriendRequestsSlider() {
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: () => getPendingRequests(1, 15),
    enabled: isAuthenticated,
  });

  if (!isLoading && requests.length === 0) return null;

  return (
    <div className="bg-primary/5 border-y sm:border sm:rounded-3xl border-primary/10 py-5 sm:py-6 mb-8 overflow-hidden shadow-sm">
      <div className="px-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bell className="size-4 text-primary" />
            </div>
            <h3 className="font-bold text-[16px] sm:text-[18px] text-foreground tracking-tight">Friend Requests</h3>
        </div>
        <Link href="/friends" className="text-primary text-[14px] font-semibold hover:underline flex items-center">
          View All <ChevronRight className="h-4 w-4 ml-0.5" />
        </Link>
      </div>

      <ScrollContainer className="px-1">
        <div className="flex gap-2 sm:gap-3 px-4 pb-4 select-none">
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-10">
                <Loader2 className="size-6 animate-spin text-primary/40" />
            </div>
          ) : (
            requests.map((sender: any) => (
              <FriendCard key={sender.id} user={sender} mode="request" className="w-[180px] sm:w-[220px] shrink-0" />
            ))
          )}
        </div>
      </ScrollContainer>
    </div>
  );
}
