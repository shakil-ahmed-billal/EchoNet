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
    <div className="flex gap-2 md:gap-2.5 overflow-x-auto pb-4 px-1 scrollbar-none select-none">
      {/* Add Story card - Facebook Style */}
      <div
        className="relative flex flex-col w-[100px] md:w-[112px] h-[170px] md:h-[190px] rounded-xl overflow-hidden cursor-pointer group shrink-0 shadow-sm border border-border/20 bg-card"
        onClick={() => router.push("/stories/create")}
      >
        <div className="flex-1 overflow-hidden bg-muted">
          {user?.image ? (
            <img 
              src={user.image} 
              alt={user.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 brightness-[0.9]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
              {user?.name?.substring(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="h-10 md:h-12 bg-card relative flex items-center justify-center pt-1 shadow-[0_-10px_15px_rgba(0,0,0,0.1)]">
          <div className="absolute -top-4 md:-top-5 h-8 md:h-9 w-8 md:w-9 bg-primary rounded-full flex items-center justify-center ring-4 ring-card shadow-lg z-10 transition-transform group-hover:scale-110">
            <Plus className="h-4 md:h-5 w-4 md:w-5 text-primary-foreground" />
          </div>
          <span className="text-[11px] md:text-[12px] font-bold text-foreground/90 mt-1.5">
            Create story
          </span>
        </div>
      </div>

      {/* Story groups - Facebook Style */}
      {groups.map((group) => {
        const latestStory = group.stories[0];
        return (
          <div
            key={group.author.id}
            className="relative w-[100px] md:w-[112px] h-[170px] md:h-[190px] rounded-xl overflow-hidden cursor-pointer group shrink-0 shadow-md border border-border/10 bg-muted/20"
            onClick={() => router.push(`/stories/${group.author.id}`)}
          >
            {/* Background Preview */}
            {latestStory?.mediaUrl ? (
              <img 
                src={latestStory.mediaUrl} 
                alt={group.author.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.85] group-hover:brightness-100"
              />
            ) : (
              <div className="absolute inset-0 bg-primary/10" />
            )}
            
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

            {/* Author Avatar positioned top-left */}
            <div className="absolute top-3 left-3 z-10">
              <div className={cn(
                "h-10 w-10 rounded-full p-0.5 transition-all shadow-lg ring-2",
                group.hasUnseen
                  ? "ring-primary"
                  : "ring-border/40"
              )}>
                <Avatar className="h-full w-full border border-black/10">
                  <AvatarImage src={group.author.image || group.author.avatarUrl} alt={group.author.name} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-[10px]">
                    {group.author.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Name text at the bottom */}
            <span className="absolute bottom-3 left-3 right-3 z-10 text-[11px] font-bold text-white truncate drop-shadow-md">
              {group.author.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
