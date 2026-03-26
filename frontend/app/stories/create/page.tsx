"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStory } from "@/services/stories.service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { ImagePlus, Loader2, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateStoryPage() {
  const { user } = useAuth();
  const router = useRouter();
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
      router.push("/");
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Header bar */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border/10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-base">Create Story</h1>
        <div className="w-9" />
      </div>

      <div className="w-full max-w-sm mx-auto pt-20 pb-8 px-4 flex flex-col gap-4">
        {/* Author info */}
        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={user?.image} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {user?.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-sm">{user?.name}</p>
            <p className="text-[11px] text-muted-foreground">Visible for 48 hours</p>
          </div>
        </div>

        {/* Preview Area */}
        <div
          className="relative w-full bg-muted/30 rounded-3xl overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-border/20 hover:border-primary/30 transition-colors"
          style={{ aspectRatio: "9/16" }}
          onClick={() => !preview && fileInputRef.current?.click()}
        >
          {preview ? (
            <>
              <img src={preview} alt="preview" className="w-full h-full object-cover rounded-3xl" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 rounded-full bg-black/50 hover:bg-black/70 text-white h-9 w-9"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setFile(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-muted-foreground py-16">
              <div
                className="size-20 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="size-10 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Add a photo or video</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Max 10MB · JPG, PNG, MP4</p>
              </div>
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

        {/* Caption */}
        {preview && (
          <input
            type="text"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={120}
            className="w-full bg-muted/50 rounded-full px-5 py-3 text-sm border border-border/20 outline-none focus:border-primary/40 focus:ring-0 placeholder:text-muted-foreground/50 transition-colors"
          />
        )}

        {/* Share button */}
        <Button
          className="w-full rounded-full h-12 font-bold text-base shadow-sm"
          onClick={handleSubmit}
          disabled={!file || isPending}
        >
          {isPending ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Sharing...</>
          ) : (
            "Share to Story"
          )}
        </Button>
      </div>
    </div>
  );
}
