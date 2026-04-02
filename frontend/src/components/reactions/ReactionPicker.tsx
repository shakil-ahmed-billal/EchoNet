"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const reactions = [
  { type: "LIKE",  emoji: "👍", label: "Like",  color: "text-blue-500",   bg: "bg-blue-500/10 hover:bg-blue-500/20"   },
  { type: "LOVE",  emoji: "❤️", label: "Love",  color: "text-red-500",    bg: "bg-red-500/10 hover:bg-red-500/20"     },
  { type: "HAHA",  emoji: "😂", label: "Haha",  color: "text-yellow-500", bg: "bg-yellow-500/10 hover:bg-yellow-500/20"},
  { type: "WOW",   emoji: "😮", label: "Wow",   color: "text-purple-500", bg: "bg-purple-500/10 hover:bg-purple-500/20"},
  { type: "SAD",   emoji: "😢", label: "Sad",   color: "text-blue-400",   bg: "bg-blue-400/10 hover:bg-blue-400/20"   },
  { type: "ANGRY", emoji: "😡", label: "Angry", color: "text-orange-500", bg: "bg-orange-500/10 hover:bg-orange-500/20"},
];

interface ReactionPickerProps {
  onReact: (type: string) => void;
  currentReaction?: string;
  children: React.ReactNode;
}

export function ReactionPicker({ onReact, currentReaction, children }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const handleReact = (type: string) => {
    onReact(type);
    setOpen(false); // ✅ Auto-close after reaction
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-fit p-2 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div className="flex gap-1 items-end">
          {reactions.map((reaction, i) => (
            <motion.div
              key={reaction.type}
              initial={{ opacity: 0, y: 10, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 20 }}
              className="relative flex flex-col items-center"
              onHoverStart={() => setHoveredType(reaction.type)}
              onHoverEnd={() => setHoveredType(null)}
            >
              {/* Tooltip label */}
              <AnimatePresence>
                {hoveredType === reaction.type && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-foreground text-background px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg"
                  >
                    {reaction.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Emoji Button */}
              <motion.button
                whileHover={{ scale: 1.35, y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReact(reaction.type)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200
                  ${currentReaction === reaction.type
                    ? `${reaction.bg} ring-2 ring-current ${reaction.color} scale-110`
                    : "hover:bg-muted/50"
                  }
                `}
                title={reaction.label}
              >
                {reaction.emoji}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

