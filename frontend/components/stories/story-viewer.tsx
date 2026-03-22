"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { viewStory, deleteStory, StoryGroup } from "@/services/stories.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, ChevronRight, Pause, Play, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryViewer({ groups, initialGroupIndex, onClose }: Props) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const group = groups[groupIdx];
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

  // Mark story as viewed when shown
  useEffect(() => {
    if (story && !story.isSeen) markViewed(story.id);
  }, [story?.id]);

  // Progress timer
  useEffect(() => {
    setProgress(0);
    if (paused) return;
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) goNext();
    }, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [storyIdx, groupIdx, paused]);

  const goNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(s => s + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(g => g + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (storyIdx > 0) {
      setStoryIdx(s => s - 1);
    } else if (groupIdx > 0) {
      setGroupIdx(g => g - 1);
      setStoryIdx(0);
    }
  };

  if (!group || !story) return null;

  const isOwnStory = group.author.id === currentUser?.id;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Close */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white/80 hover:bg-white/10 rounded-full"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Story container */}
      <div className="relative w-full max-w-[500px] md:max-w-[550px] mx-auto h-full max-h-dvh flex flex-col">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3">
          {group.stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Author header */}
        <div className="absolute top-7 left-0 right-0 z-10 flex items-center justify-between px-4 pt-2">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group/author"
            onClick={() => {
              onClose();
              router.push(`/profile/${group.author.id}`);
            }}
          >
            <Avatar className="h-10 w-10 ring-2 ring-white/60 group-hover/author:ring-primary/80 transition-colors">
              <AvatarImage src={group.author.image || group.author.avatarUrl} alt={group.author.name} />
              <AvatarFallback className="bg-primary font-bold text-sm text-white">
                {group.author.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-bold text-sm drop-shadow group-hover/author:text-white/80 transition-colors">{group.author.name}</p>
              <p className="text-white/70 text-[11px]">
                {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/10 rounded-full h-8 w-8"
              onClick={() => setPaused(p => !p)}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            {isOwnStory && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:bg-white/10 rounded-full h-8 w-8"
                onClick={() => doDeleteStory(story.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Story image */}
        <div className="flex-1 relative">
          <img
            src={story.mediaUrl}
            alt="story"
            className="w-full h-full object-cover"
          />

          {/* Click zones */}
          <div className="absolute inset-0 flex">
            <div className="flex-1" onClick={goPrev} />
            <div className="flex-1" onClick={goNext} />
          </div>
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-8 left-0 right-0 px-6">
            <p className="text-white text-base font-medium text-center drop-shadow-lg bg-black/30 rounded-2xl py-2 px-4">
              {story.caption}
            </p>
          </div>
        )}

        {/* Nav arrows (desktop) */}
        {groupIdx > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-16 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full h-12 w-12 hidden md:flex"
            onClick={goPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        {groupIdx < groups.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-16 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full h-12 w-12 hidden md:flex"
            onClick={goNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
