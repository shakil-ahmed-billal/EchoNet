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

export default function FriendsPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [requestPage, setRequestPage] = useState(1);
  const [suggestionPage, setSuggestionPage] = useState(1);
  const LIMIT_REQUESTS = 6;
  const LIMIT_SUGGESTIONS = 10;
  
  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["friend-requests", requestPage],
    queryFn: () => getPendingRequests(requestPage, LIMIT_REQUESTS),
  });

  const { data: suggestions = [], isLoading: isLoadingSuggestions, isError } = useQuery({
    queryKey: ["friend-suggestions", suggestionPage],
    queryFn: () => getSuggestions(suggestionPage, LIMIT_SUGGESTIONS),
  });

  const acceptMutation = useMutation({
    mutationFn: (userId: string) => acceptUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests", "sidebar"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Friend request accepted!");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests", "sidebar"] });
      toast.info("Friend request declined.");
    },
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-12 border border-dashed border-border/40 rounded-4xl bg-card/20 mx-auto mt-12 w-full max-w-2xl">
        <div className="size-16 rounded-3xl bg-destructive/10 flex items-center justify-center mb-6">
           <ShieldAlert className="size-8 text-destructive/40" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">System Interruption</h3>
        <p className="text-sm text-muted-foreground mt-2">Unable to retrieve connections from the network core.</p>
        <Button variant="outline" className="mt-8 rounded-xl" onClick={() => window.location.reload()}>Retry Handshake</Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Pending Requests Section - Priority 1 */}
      {requests.length > 0 && (
        <section className="bg-card/40 rounded-4xl border border-border/40 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
               <div className="size-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                  <Bell className="size-5.5 text-primary" />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-foreground tracking-tight">Pending Requests</h2>
                 <p className="text-[11px] font-bold text-muted-foreground/50 tracking-wide mt-1">Incoming connections</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">
                {requests.length} New
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded-lg"
                  onClick={() => setRequestPage((prev: number) => Math.max(1, prev - 1))}
                  disabled={requestPage === 1}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <span className="text-xs font-bold text-muted-foreground min-w-[3rem] text-center">Page {requestPage}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded-lg"
                  onClick={() => setRequestPage((prev: number) => prev + 1)}
                  disabled={requests.length < LIMIT_REQUESTS}
                >
                  <ChevronRight className="size-3.5" /> 
                </Button>
              </div>
            </div>
          </div>

          {isLoadingRequests ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary/40" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {requests.map((sender: any) => (
                <div key={sender.id} className="flex flex-col items-center bg-card border border-border/40 rounded-4xl overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary/20 group p-6 gap-4 text-center">
                  <Avatar className="h-20 w-20 ring-2 ring-border/10 group-hover:ring-primary/20 transition-all shadow-md">
                    <AvatarImage src={sender.avatarUrl || sender.image} alt={sender.name} />
                    <AvatarFallback className="font-bold bg-muted text-muted-foreground text-2xl">{sender.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 w-full">
                    <span className="text-[15px] font-bold truncate text-foreground/90 leading-tight">{sender.name}</span>
                    <span className="text-[11px] font-bold text-muted-foreground/40 tracking-wide uppercase">Sent you a request</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full mt-auto">
                    <Button
                      className="w-full h-9 rounded-xl font-bold text-xs shadow-sm active:scale-[0.98] transition-all"
                      onClick={() => acceptMutation.mutate(sender.id)}
                      disabled={acceptMutation.isPending}
                    >
                      {acceptMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="h-3.5 w-3.5 mr-1" />Accept</>}
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full h-9 rounded-xl font-bold text-xs active:scale-[0.98] transition-all"
                      onClick={() => rejectMutation.mutate(sender.id)}
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><X className="h-3.5 w-3.5 mr-1" />Decline</>}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Network Pulse Section - Priority 2 */}
      <section className="px-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 px-4">
          <div className="flex items-center gap-4">
             <div className="size-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                <UserPlus className="size-5.5 text-primary" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-foreground tracking-tight">Network Pulse</h2>
               <p className="text-[11px] font-bold text-muted-foreground/50 tracking-wide mt-1">Suggested for you</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
              onClick={() => setSuggestionPage((prev: number) => Math.max(1, prev - 1))}
              disabled={suggestionPage === 1}
            >
              Previous
            </Button>
            <div className="h-8 w-px bg-border/20 mx-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-4 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => setSuggestionPage((prev: number) => prev + 1)}
              disabled={suggestions.length < LIMIT_SUGGESTIONS}
            >
              Next
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {suggestions.map((user: UserSuggestion) => (
              <FriendCard key={user.id} user={user} layout="vertical" />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
