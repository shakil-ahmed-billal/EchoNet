"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Video, Smile, Calendar, Loader2, Send, X, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/services/posts.service";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function CreatePost() {
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tempMedia, setTempMedia] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { content: string; mediaUrls?: string[] }) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setContent("");
      setMediaUrls([]);
      setIsOpen(false);
      toast.success("Post created successfully");
    },
    onError: () => {
      toast.error("Failed to create post");
    }
  });

  const handlePost = () => {
    if (!content.trim() && mediaUrls.length === 0) return;
    mutation.mutate({ content, mediaUrls });
  };

  const addMedia = () => {
    if (tempMedia.trim()) {
      setMediaUrls([...mediaUrls, tempMedia]);
      setTempMedia("");
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  return (
    <Card className="bg-card border-border/40 shadow-sm rounded-2xl overflow-hidden mb-8 transition-all hover:bg-card/60">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-11 w-11 border-2 border-primary/10 shadow-inner">
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {user?.name?.substring(0, 2).toUpperCase() || "UN"}
            </AvatarFallback>
          </Avatar>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div 
                role="button"
                tabIndex={0}
                className="flex-1 h-11 bg-muted/60 hover:bg-muted/80 text-muted-foreground/80 text-sm font-medium px-5 rounded-full text-left transition-all border border-border/20 shadow-inner cursor-pointer flex items-center"
              >
                What's on your mind, {user?.name?.split(' ')[0]}?
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-card border-border/40 p-0 rounded-3xl overflow-hidden shadow-2xl">
              <DialogHeader className="p-6 border-b border-border/20">
                <DialogTitle className="text-xl font-bold tracking-tight text-center">Create Post</DialogTitle>
              </DialogHeader>
              
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                   <Avatar className="h-10 w-10 border border-border/10">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="bg-muted font-bold text-xs">{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-bold text-sm tracking-tight">{user?.name}</p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-full w-fit">
                       <p className="text-[10px] font-bold text-muted-foreground opacity-80 uppercase tracking-wider">Public</p>
                    </div>
                  </div>
                </div>

                <Textarea
                  placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[160px] text-lg lg:text-xl border-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40 bg-transparent resize-none leading-relaxed"
                />

                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {mediaUrls.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-border/20 aspect-video bg-muted/20 shadow-sm">
                        <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                        <button 
                          onClick={() => removeMedia(i)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                   <div className="flex items-center gap-2">
                       <Input 
                        placeholder="Add media link..." 
                        value={tempMedia}
                        onChange={(e) => setTempMedia(e.target.value)}
                        className="bg-muted/40 border-border/40 focus:bg-muted/60 h-9 rounded-xl text-xs"
                       />
                       <Button size="icon" variant="outline" onClick={addMedia} className="h-9 w-9 shrink-0 rounded-xl border-border/40 hover:bg-primary/10 hover:text-primary">
                          <Plus className="h-4 w-4" />
                       </Button>
                   </div>
                   
                   <div className="p-3 border border-border/40 rounded-2xl flex items-center justify-between bg-muted/20 group hover:border-primary/20 transition-all">
                      <span className="text-xs font-bold text-foreground/80 pl-2">Add to your post</span>
                      <div className="flex items-center gap-1">
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-green-500 hover:bg-green-500/10">
                            <ImageIcon className="h-5 w-5" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-blue-500 hover:bg-blue-500/10">
                            <Video className="h-5 w-5" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-yellow-500 hover:bg-yellow-500/10">
                            <Smile className="h-5 w-5" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-red-500 hover:bg-red-500/10">
                            <Calendar className="h-5 w-5" />
                         </Button>
                      </div>
                   </div>
                </div>

                <Button 
                  onClick={handlePost}
                  disabled={mutation.isPending || (!content.trim() && mediaUrls.length === 0)}
                  className="w-full h-11 rounded-xl font-bold text-sm tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Share Post"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="h-px bg-border/20 w-full" />
        
        <div className="flex items-center justify-between px-2">
           <button className="flex items-center gap-2.5 py-2 px-3 hover:bg-muted/60 transition-all rounded-xl group">
             <div className="p-2 bg-red-500/10 rounded-full group-hover:bg-red-500/20 transition-colors">
                <Video className="h-4.5 w-4.5 text-red-500" />
             </div>
             <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Live video</span>
           </button>
           <button className="flex items-center gap-2.5 py-2 px-3 hover:bg-muted/60 transition-all rounded-xl group">
             <div className="p-2 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
                <ImageIcon className="h-4.5 w-4.5 text-green-500" />
             </div>
             <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Photo/video</span>
           </button>
           <button className="flex items-center gap-2.5 py-2 px-3 hover:bg-muted/60 transition-all rounded-xl group">
             <div className="p-2 bg-yellow-500/10 rounded-full group-hover:bg-yellow-500/20 transition-colors">
                <Smile className="h-4.5 w-4.5 text-yellow-500" />
             </div>
             <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Feeling/activity</span>
           </button>
        </div>
      </CardContent>
    </Card>
  );
}
