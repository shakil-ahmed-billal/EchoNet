"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers, UserSuggestion } from "@/services/users.service";
import { FriendCard } from "@/components/friends/friend-card";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Users2 } from "lucide-react";

export default function FriendsPage() {
  const { user: currentUser } = useAuth();
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({ limit: 50 }),
  });

  const suggestions = users.filter((u: UserSuggestion) => u.id !== currentUser?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5 tracking-tight">
            <Users2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" /> Friends
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base font-medium">Discover people you may know</p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/40 shadow-sm p-5 sm:p-8 mb-8">
        <h2 className="text-[18px] sm:text-xl font-bold mb-6 tracking-tight">People You May Know</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3.5 flex flex-col gap-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
            {suggestions.map((user: UserSuggestion) => (
              <FriendCard key={user.id} user={user} className="w-full" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground font-medium bg-muted/20 border border-border/30 rounded-2xl">
            No friend suggestions available right now.
          </div>
        )}
      </div>
    </div>
  );
}
