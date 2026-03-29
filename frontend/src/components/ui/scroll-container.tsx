"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  scrollAmount?: number;
}

export function ScrollContainer({ children, className, scrollAmount = 400 }: ScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 20);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -scrollAmount : scrollAmount;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("group relative w-full", className)}>
      {/* Left Button */}
      {showLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-12 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-linear-to-r from-background via-background/40 to-transparent pointer-events-none">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg border border-border/40 pointer-events-auto hover:scale-110 active:scale-95 transition-all ml-4"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Scrollable Area */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto no-scrollbar scroll-smooth"
      >
        {children}
      </div>

      {/* Right Button */}
      {showRight && (
        <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-12 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-linear-to-l from-background via-background/40 to-transparent pointer-events-none text-right">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg border border-border/40 pointer-events-auto hover:scale-110 active:scale-95 transition-all mr-4 ml-auto"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
