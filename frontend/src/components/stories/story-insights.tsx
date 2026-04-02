"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StoryInsightsList } from "./story-insights-list";

interface Props {
  storyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StoryInsights({ storyId, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[75vh] md:h-[70vh] rounded-t-3xl border-none bg-background p-0 overflow-hidden">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-center font-bold">Story Insights</SheetTitle>
        </SheetHeader>
        <StoryInsightsList storyId={storyId} />
      </SheetContent>
    </Sheet>
  );
}
