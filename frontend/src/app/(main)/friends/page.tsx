"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserSuggestion } from "@/services/users.service";
import { getPendingRequests, getSuggestions, acceptUser, unfollowUser } from "@/services/follow.service";
import { FriendCard } from "@/components/friends/friend-card";
import { Users2, ShieldAlert, Loader2, UserPlus, Check, X, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ScrollContainer } from "@/components/ui/scroll-container";

export default function FriendsPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: () => getPendingRequests(1, 20), // Fetch more for slider
  });

  const { data: suggestions = [], isLoading: isLoadingSuggestions, isError } = useQuery({
    queryKey: ["friend-suggestions"],
    queryFn: () => getSuggestions(1, 20), // Fetch more for slider
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-12 border border-dashed border-border/40 rounded-4xl bg-card/20 mx-auto mt-12 w-full max-w-2xl">
        <div className="size-16 rounded-3xl bg-destructive/10 flex items-center justify-center mb-6">
           <ShieldAlert className="size-8 text-destructive/40" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground">System Interruption</h3>
        <p className="text-sm text-muted-foreground mt-2 font-medium">Unable to retrieve connections from the network core.</p>
        <Button variant="outline" className="mt-8 rounded-xl font-bold px-8 h-12" onClick={() => window.location.reload()}>Retry Handshake</Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Pending Requests Slider */}
      {requests.length > 0 && (
        <section className="bg-muted/30 rounded-[2.5rem] border border-border/40 p-1 transition-all">
          <div className="p-6 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                  <Bell className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground tracking-tight">Friend Requests</h2>
                  <p className="text-[10px] font-black text-muted-foreground/40 mt-0.5">Incoming Intel</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20">
                   {requests.length} New
                 </div>
                 <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground">
                   See All
                 </Button>
              </div>
            </div>
          </div>

          {isLoadingRequests ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary/40" /></div>
          ) : (
            <ScrollContainer className="px-6 pb-6 pt-2">
              <div className="flex gap-4">
                {requests.map((sender: any) => (
                  <div key={sender.id} className="min-w-[220px] max-w-[220px]">
                     <FriendCard user={sender} mode="request" />
                  </div>
                ))}
              </div>
            </ScrollContainer>
          )}
        </section>
      )}

      {/* Network Pulse Slider (Suggestions) */}
      <section className="px-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 px-4">
          <div className="flex items-center gap-4">
             <div className="size-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                <UserPlus className="size-5.5 text-primary" />
             </div>
             <div>
               <h2 className="text-xl font-black text-foreground tracking-tight">Network Pulse</h2>
               <p className="text-[11px] font-black text-muted-foreground/40 mt-1">Suggested for you</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-xs font-black text-muted-foreground hover:bg-muted ">
              Explore Network
            </Button>
          </div>
        </div>

        {isLoadingSuggestions ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary/40" /></div>
        ) : suggestions.length === 0 ? (
          <div className="p-20 text-center border border-dashed border-border/20 rounded-4xl bg-card/5 flex flex-col items-center">
            <Users2 className="size-12 text-muted-foreground/10 mb-6" />
            <h4 className="text-lg font-bold text-foreground/40">No suggestions available</h4>
            <p className="text-[11px] mt-2 text-muted-foreground/30 max-w-sm font-bold tracking-tight leading-relaxed">The connection registry is currently empty.</p>
          </div>
        ) : (
          <ScrollContainer className="px-4 pb-8">
            <div className="flex gap-5">
              {suggestions.map((user: UserSuggestion) => (
                <div key={user.id} className="min-w-[240px] max-w-[240px]">
                  <FriendCard user={user} mode="suggestion" />
                </div>
              ))}
            </div>
          </ScrollContainer>
        )}
      </section>

    </div>
  );
}
