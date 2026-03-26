"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStory } from "@/services/stories.service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
}

export function CreateStoryModal({ onClose }: Props) {
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) => createStory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story posted!");
      onClose();
    },
    onError: () => toast.error("Failed to post story"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("media", file);
    if (caption) fd.append("caption", caption);
    mutate(fd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-card rounded-3xl shadow-2xl overflow-hidden w-full max-w-md mx-4 border border-border/20">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {user?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-sm">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground">Your story · visible for 48h</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 hover:bg-muted"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview Area */}
        <div
          className="relative w-full bg-muted/30 flex items-center justify-center cursor-pointer"
          style={{ aspectRatio: "9/16", maxHeight: "55vh" }}
          onClick={() => !preview && fileInputRef.current?.click()}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Story preview"
                className="w-full h-full object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 rounded-full bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ImagePlus className="size-8 text-primary" />
              </div>
              <p className="text-sm font-medium">Click to select a photo or video</p>
              <p className="text-xs text-muted-foreground/60">Max 10MB · JPG, PNG, MP4</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Caption + Post */}
        <div className="p-4 space-y-3">
          {preview && (
            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={120}
              className="w-full bg-muted/50 rounded-full px-4 py-2.5 text-sm border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/60"
            />
          )}
          <Button
            className="w-full rounded-full h-11 font-bold shadow-sm"
            onClick={handleSubmit}
            disabled={!file || isPending}
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Posting...</>
            ) : (
              "Share to Story"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
