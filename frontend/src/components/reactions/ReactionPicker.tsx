"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Heart, Laugh, Meh, Frown, Zap } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const reactions = [
  { type: "LIKE", icon: ThumbsUp, color: "text-blue-500", label: "Like" },
  { type: "LOVE", icon: Heart, color: "text-red-500", label: "Love" },
  { type: "HAHA", icon: Laugh, color: "text-yellow-500", label: "Haha" },
  { type: "WOW", icon: Zap, color: "text-purple-500", label: "Wow" },
  { type: "SAD", icon: Meh, color: "text-blue-400", label: "Sad" },
  { type: "ANGRY", icon: Frown, color: "text-orange-600", label: "Angry" },
];

interface ReactionPickerProps {
  onReact: (type: string) => void;
  currentReaction?: string;
  children: React.ReactNode;
}

export function ReactionPicker({ onReact, currentReaction, children }: ReactionPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-fit p-1" side="top" align="start">
        <div className="flex gap-1">
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.type}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 ${currentReaction === reaction.type ? "bg-accent" : ""}`}
                onClick={() => onReact(reaction.type)}
                title={reaction.label}
              >
                <reaction.icon className={`h-5 w-5 ${reaction.color}`} />
              </Button>
            </motion.div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
