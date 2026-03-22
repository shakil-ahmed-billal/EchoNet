"use client";

import { useQuery } from "@tanstack/react-query";
import { getStories, StoryGroup } from "@/services/stories.service";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function StoryBar() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data: groups = [] } = useQuery<StoryGroup[]>({
    queryKey: ["stories"],
    queryFn: getStories,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 px-1 scrollbar-none select-none">
      {/* Add Story card */}
      <div
        className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
        onClick={() => router.push("/stories/create")}
      >
        <div className="relative">
          <div className="h-16 w-16 rounded-full ring-2 ring-border/20 overflow-hidden bg-muted flex items-center justify-center transition-all group-hover:ring-primary/40">
            <Avatar className="h-full w-full">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                {user?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 bg-primary rounded-full flex items-center justify-center ring-2 ring-card shadow-lg">
            <Plus className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground truncate w-16 text-center">
          Add Story
        </span>
      </div>

      {/* Story groups */}
      {groups.map((group) => (
        <div
          key={group.author.id}
          className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
          onClick={() => router.push(`/stories/${group.author.id}`)}
        >
          <div
            className={cn(
              "h-16 w-16 rounded-full p-0.5 transition-all",
              group.hasUnseen
                ? "bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600 shadow-md shadow-primary/20"
                : "bg-muted/50 ring-2 ring-border/20"
            )}
          >
            <div className="h-full w-full rounded-full bg-card p-0.5 overflow-hidden">
              <Avatar className="h-full w-full">
                <AvatarImage src={group.author.image || group.author.avatarUrl} alt={group.author.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                  {group.author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-foreground/70 truncate w-16 text-center">
            {group.author.name.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}
