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
    <div className="flex flex-col gap-4 md:gap-6 max-w-4xl mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Pending Requests */}
      {requests.length > 0 && (
        <section className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Bell className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Friend Requests</h2>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Review incoming requests</p>
                </div>
              </div>
              <div className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20">
                {requests.length} NEW
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

      {/* Suggested Friends */}
      <section className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <UserPlus className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">People You May Know</h2>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Suggested for you</p>
            </div>
          </div>
        </div>

        {isLoadingSuggestions ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary/30" /></div>
        ) : suggestions.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <Users2 className="size-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-bold text-muted-foreground/40">No suggestions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 md:p-4 px-3">
            {suggestions.map((user: UserSuggestion) => (
              <FriendCard 
                key={user.id} 
                user={user} 
                mode="suggestion" 
                className="md:rounded-2xl border-0 md:border border-border/10 shadow-none hover:shadow-md transition-all h-full"
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
