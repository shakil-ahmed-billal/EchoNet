"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Eye, Heart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  storyId: string;
  className?: string;
  isSidebar?: boolean;
}

const reactionEmojis: Record<string, string> = {
  LOVE: "❤️",
  LIKE: "👍",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
};

export function StoryInsightsList({ storyId, className, isSidebar }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["story-insights", storyId],
    queryFn: async () => {
      const res = await apiClient.get(`/stories/${storyId}/insights`);
      return res.data.data;
    },
    enabled: !!storyId,
  });

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <Tabs defaultValue="views" className="flex flex-col h-full">
        <div className="px-4 py-2 bg-muted/30">
          <TabsList className="grid w-full grid-cols-3 rounded-full h-11">
            <TabsTrigger value="views" className="rounded-full gap-2">
              <Eye className="h-4 w-4" />
              <span>{data?.counts?.views || 0}</span>
            </TabsTrigger>
            <TabsTrigger value="reactions" className="rounded-full gap-2">
              <Heart className="h-4 w-4" />
              <span>{data?.counts?.reactions || 0}</span>
            </TabsTrigger>
            <TabsTrigger value="replies" className="rounded-full gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{data?.counts?.messages || 0}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <TabsContent value="views" className="mt-0">
                  <div className="space-y-4 pb-10">
                    {data?.views?.length > 0 ? (
                      data.views.map((v: any) => (
                        <div key={v.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-11 w-11 shadow-sm border border-border/50 transition-transform group-hover:scale-105">
                              <AvatarImage src={v.viewer.image || v.viewer.avatarUrl} alt={v.viewer.name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {v.viewer.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{v.viewer.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Viewed {formatDistanceToNow(new Date(v.viewedAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-10 text-sm">No views yet</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reactions" className="mt-0">
                  <div className="space-y-4 pb-10">
                    {data?.reactions?.length > 0 ? (
                      data.reactions.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-11 w-11 shadow-sm border border-border/50 transition-transform group-hover:scale-105">
                                <AvatarImage src={r.user.image || r.user.avatarUrl} alt={r.user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                  {r.user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="absolute -bottom-1 -right-1 text-base bg-background rounded-full p-0.5 shadow-sm border border-border/40">
                                {reactionEmojis[r.type] || "❤️"}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{r.user.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Reacted {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-10 text-sm">No reactions yet</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="replies" className="mt-0">
                  <div className="space-y-4 pb-10">
                    {data?.messages?.length > 0 ? (
                      data.messages.map((m: any) => (
                        <div key={m.id} className="flex items-start gap-3 group">
                          <Avatar className="h-11 w-11 shadow-sm border border-border/50 mt-0.5 transition-transform group-hover:scale-105">
                            <AvatarImage src={m.sender.image || m.sender.avatarUrl} alt={m.sender.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {m.sender.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm">{m.sender.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="mt-1 p-2.5 rounded-2xl rounded-tl-none bg-muted/60 text-sm">
                              {m.content}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-10 text-sm">No replies yet</p>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
