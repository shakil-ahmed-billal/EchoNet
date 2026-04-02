"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserProfile } from "@/services/users.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EditProfileDialogProps {
  user: {
    id: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
    coverPhotoUrl?: string;
    website?: string;
    location?: string;
    workplace?: string;
    education?: string;
    isPrivate?: boolean;
  };
  children: React.ReactNode;
}

export function EditProfileDialog({ user, children }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(user.coverPhotoUrl || "");
  const [website, setWebsite] = useState(user.website || "");
  const [workplace, setWorkplace] = useState(user.workplace || "");
  const [education, setEducation] = useState(user.education || "");
  const [isPrivate, setIsPrivate] = useState(user.isPrivate || false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      // Small delay just to ensure the UI doesn't visually glitch and show 1 frame loading
      await new Promise((resolve) => setTimeout(resolve, 300));
      return updateUserProfile(user.id, { 
        name, 
        bio, 
        avatarUrl, 
        coverPhotoUrl, 
        website, 
        workplace, 
        education, 
        isPrivate 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user.name] }); // Handle name slugs if routed that way
      toast.success("Profile updated successfully!");
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[480px] rounded-3xl border border-border/50 bg-card p-0 overflow-hidden shadow-lg">
        <DialogHeader className="p-8 border-b border-border/10">
          <DialogTitle className="text-xl font-bold tracking-tight">Edit Profile</DialogTitle>
          <DialogDescription className="text-[11px] leading-relaxed text-muted-foreground/60 mt-2">
            Update your profile information and how others see you on EchoNet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 ml-1">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-11 px-4 rounded-xl bg-muted/30 border-border/20 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/40"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="avatarUrl" className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 ml-1">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-11 px-4 rounded-xl bg-muted/30 border-border/20 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/40"
              />
            </div>
 
            <div className="grid gap-2">
              <Label htmlFor="coverPhotoUrl" className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 ml-1">Cover Photo URL</Label>
              <Input
                id="coverPhotoUrl"
                value={coverPhotoUrl}
                onChange={(e) => setCoverPhotoUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="h-11 px-4 rounded-xl bg-muted/30 border-border/20 focus-visible:ring-primary/20 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="website" className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 ml-1">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="yourwebsite.com"
                  className="h-11 px-3 rounded-xl bg-muted/30 border-border/20 focus-visible:ring-primary/20 text-sm font-medium"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isPrivate} 
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold tracking-wider text-muted-foreground/60">Private Profile</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="workplace" className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 ml-1">Workplace</Label>
                <Input
                  id="workplace"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder="Google, Inc."
                  className="h-11 px-3 rounded-xl bg-muted/30 border-border/20 focus-visible:ring-primary/20 text-sm font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="education" className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 ml-1">Education</Label>
                <Input
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="Stanford University"
                  className="h-11 px-3 rounded-xl bg-muted/30 border-border/20 focus-visible:ring-primary/20 text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 ml-1">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[100px] px-4 py-3 rounded-xl bg-muted/30 border-border/20 focus-visible:ring-primary/20 text-sm font-medium resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full h-11 rounded-xl font-semibold shadow-sm transition-all"
            >
              {mutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
