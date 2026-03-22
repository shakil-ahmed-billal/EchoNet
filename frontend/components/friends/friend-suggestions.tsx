"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/users.service";
import { FriendCard } from "./friend-card";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function FriendSuggestions() {
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["suggested-users"],
    queryFn: () => getUsers({ limit: 10 }),
    enabled: isAuthenticated,
  });

  const suggestions = users.filter(u => u.id !== currentUser?.id);

  if (!isLoading && suggestions.length === 0) return null;

  return (
    <div className="bg-card/40 border-y sm:border sm:rounded-3xl border-border/40 py-5 sm:py-6 mb-8 overflow-hidden shadow-sm">
      <div className="px-5 mb-4 flex items-center justify-between">
        <h3 className="font-bold text-[16px] sm:text-[18px] text-foreground tracking-tight">People You May Know</h3>
        <Link href="/friends" className="text-primary text-[14px] font-semibold hover:underline flex items-center">
          See All <ChevronRight className="h-4 w-4 ml-0.5" />
        </Link>
      </div>

      <div className="flex gap-2.5 sm:gap-3 px-5 overflow-x-auto pb-4 custom-scrollbar snap-x touch-pan-x">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[160px] sm:w-[180px] md:w-[200px] shrink-0 bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3.5 flex flex-col gap-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-full mt-auto" />
              </div>
            </div>
          ))
        ) : (
          suggestions.map((user) => (
            <FriendCard key={user.id} user={user} className="w-[160px] sm:w-[180px] md:w-[200px] shrink-0 snap-start" />
          ))
        )}
      </div>
    </div>
  );
}
