"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStories, viewStory, deleteStory, StoryGroup } from "@/services/stories.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Pause, Play, Trash2, X, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

const STORY_DURATION = 5000;

export default function StoryViewPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery<StoryGroup[]>({
    queryKey: ["stories"],
    queryFn: getStories,
  });

  // Find initial group index from userId param
  const userId = params?.userId as string;
  const [groupIdx, setGroupIdx] = useState<number | null>(null);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial group once data is loaded
  useEffect(() => {
    if (groups.length > 0 && groupIdx === null) {
      const idx = groups.findIndex((g) => g.author.id === userId);
      setGroupIdx(idx >= 0 ? idx : 0);
    }
  }, [groups, userId, groupIdx]);

  const group = groupIdx !== null ? groups[groupIdx] : null;
  const story = group?.stories[storyIdx];

  const { mutate: markViewed } = useMutation({ mutationFn: viewStory });
  const { mutate: doDeleteStory } = useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story deleted");
      goNext();
    },
  });

  useEffect(() => {
    if (story && !story.isSeen) markViewed(story.id);
  }, [story?.id]);

  const goNext = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!group || groupIdx === null) return;
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx((s) => s + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((g) => (g ?? 0) + 1);
      setStoryIdx(0);
    } else {
      router.push("/");
    }
  }, [storyIdx, groupIdx, group, groups, router]);

  const goPrev = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (groupIdx === null) return;
    if (storyIdx > 0) {
      setStoryIdx((s) => s - 1);
    } else if (groupIdx > 0) {
      setGroupIdx((g) => (g ?? 0) - 1);
      setStoryIdx(0);
    }
  }, [storyIdx, groupIdx]);

  // Progress bar timer
  useEffect(() => {
    setProgress(0);
    if (paused || !story) return;
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) goNext();
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storyIdx, groupIdx, paused, story?.id]);

  // Keyboard navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") router.push("/");
      if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [goNext, goPrev, router]);

  if (isLoading || groupIdx === null || !group || !story) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const isOwnStory = group.author.id === currentUser?.id;

  return (
    <div className="fixed inset-0 bg-black flex overflow-hidden">
      {/* Left nav (prev user) */}
      {groupIdx > 0 && (
        <button
          onClick={() => { setGroupIdx(g => (g ?? 0) - 1); setStoryIdx(0); }}
          className="hidden lg:flex items-center justify-center w-16 shrink-0 hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="h-8 w-8 text-white/70" />
        </button>
      )}

      {/* Story viewport */}
      <div className="flex-1 flex items-center justify-center">
        {/* Story card */}
        <div className="relative h-full max-w-sm w-full mx-auto flex flex-col">
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3">
            {group.stories.map((s, i) => (
              <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
                    transition: i === storyIdx ? "none" : undefined,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top bar */}
          <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-3 pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 ring-2 ring-white/60">
                <AvatarImage src={group.author.image || group.author.avatarUrl} alt={group.author.name} />
                <AvatarFallback className="bg-primary font-bold text-sm text-white">
                  {group.author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-bold text-sm drop-shadow">{group.author.name}</p>
                <p className="text-white/60 text-[11px]">
                  {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:bg-white/10 rounded-full h-9 w-9"
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              {isOwnStory && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:bg-red-500/20 rounded-full h-9 w-9"
                  onClick={() => doDeleteStory(story.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:bg-white/10 rounded-full h-9 w-9"
                onClick={() => router.push("/")}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Story image */}
          <div className="relative flex-1 bg-gray-900">
            <img
              src={story.mediaUrl}
              alt="story"
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Tap zones */}
            <div className="absolute inset-0 flex">
              <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
              <div className="w-2/3 h-full cursor-pointer" onClick={goNext} />
            </div>
          </div>

          {/* Caption */}
          {story.caption && (
            <div className="absolute bottom-8 left-4 right-4 z-10">
              <p className="text-white text-sm font-medium text-center drop-shadow-lg bg-black/40 rounded-2xl py-2.5 px-4">
                {story.caption}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right nav (next user) */}
      {groupIdx < groups.length - 1 && (
        <button
          onClick={() => { setGroupIdx((g) => (g ?? 0) + 1); setStoryIdx(0); }}
          className="hidden lg:flex items-center justify-center w-16 shrink-0 hover:bg-white/5 transition-colors"
        >
          <ChevronRight className="h-8 w-8 text-white/70" />
        </button>
      )}

      {/* Sidebar: other users' stories */}
      <div className="hidden xl:flex flex-col w-80 shrink-0 bg-[#18191a] border-l border-white/5 overflow-y-auto">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">Stories</h2>
          <p className="text-white/40 text-xs mt-0.5">All stories</p>
        </div>
        <div className="flex flex-col gap-1 p-2">
          {groups.map((g, idx) => (
            <button
              key={g.author.id}
              onClick={() => { setGroupIdx(idx); setStoryIdx(0); }}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl text-left transition-all",
                idx === groupIdx ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-full p-0.5 shrink-0",
                g.hasUnseen ? "bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600" : "bg-white/20"
              )}>
                <div className="h-full w-full rounded-full bg-[#18191a] p-0.5">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={g.author.image || g.author.avatarUrl} alt={g.author.name} />
                    <AvatarFallback className="bg-primary/30 text-white font-bold text-xs">
                      {g.author.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{g.author.name}</p>
                <p className="text-white/40 text-xs">{g.stories.length} story{g.stories.length > 1 ? "ies" : ""}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
