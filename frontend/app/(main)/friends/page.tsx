"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers, UserSuggestion } from "@/services/users.service";
import { FriendCard } from "@/components/friends/friend-card";
import { Users2, ShieldAlert, Loader2, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function FriendsPage() {
  const { user: currentUser } = useAuth();
  
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({ limit: 50 }),
  });

  const suggestions = users.filter((u: UserSuggestion) => u.id !== currentUser?.id && !u.isFriend);
  const friends = users.filter((u: UserSuggestion) => u.id !== currentUser?.id && u.isFriend);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest animate-pulse">Running Neural Scan...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 border border-dashed border-edge rounded-3xl bg-muted/5 max-w-lg mx-auto mt-12">
        <div className="size-16 rounded-full bg-muted/20 flex items-center justify-center mb-6">
           <ShieldAlert className="size-8 text-destructive/20" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest">Network Outage</p>
        <p className="text-xs mt-1 text-muted-foreground">Unable to fetch the user directory at this time.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 flex flex-col gap-12">
      
      {/* Existing Friends Section */}
      {friends.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2.5 bg-emerald-500/10 rounded-2xl">
                <UserCheck className="size-5 text-emerald-500" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-foreground tracking-tight">Your Friends</h2>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((user: UserSuggestion) => (
              <FriendCard key={user.id} user={user} layout="vertical" />
            ))}
          </div>
        </section>
      )}

      {/* Suggestions Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Users2 className="size-5 text-primary" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-foreground tracking-tight">Friend Suggestions</h2>
             <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">People you might know</p>
           </div>
        </div>

        {suggestions.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground border border-dashed border-edge rounded-3xl bg-muted/5 flex flex-col items-center">
            <Users2 className="size-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-semibold uppercase tracking-widest">No Suggestions</p>
            <p className="text-xs mt-2 max-w-sm">We couldn't find any more users in the system to connect with right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((user: UserSuggestion) => (
              <FriendCard key={user.id} user={user} layout="vertical" />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
