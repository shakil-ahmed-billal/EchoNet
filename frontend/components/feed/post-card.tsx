"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, Trash2, Edit2, Loader2, Send, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost, updatePost, type Post } from "@/services/posts.service";
import { CommentSection } from "./comment-section";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { apiClient } from "@/services/api-client";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAuthor = user?.id === post.author.id;

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post("/likes/toggle", { postId: post.id });
    },
    onMutate: () => {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    },
    onError: () => {
      setIsLiked(post.isLiked);
      setLikesCount(post._count.likes);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete post");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { content: string; mediaUrls?: string[] }) => updatePost({ id: post.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setIsEditing(false);
      toast.success("Post updated successfully");
    },
    onError: () => {
      toast.error("Failed to update post");
    }
  });

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ content: editContent });
  };

  return (
    <div className="bg-card/40 border-y sm:border border-border/40 sm:rounded-3xl shadow-sm flex flex-col group transition-all duration-500 hover:bg-card/60 hover:border-border/60 mb-4 sm:mb-6 overflow-hidden">
      {/* Post Header */}
      <div className="p-3 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5 group/author">
          <Link href={`/profile/${post.author.id}`}>
            <Avatar className="h-11 w-11 border-2 border-primary/10 shadow-inner group-hover/author:border-primary/30 transition-colors cursor-pointer">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {post.author.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col min-w-0">
            <Link href={`/profile/${post.author.id}`}>
              <h4 className="font-bold text-sm tracking-tight text-foreground/90 truncate group-hover/author:text-primary transition-colors cursor-pointer leading-none">
                {post.author.name}
              </h4>
            </Link>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span className="opacity-50">•</span>
              <span className="opacity-80">Global</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                  <MoreHorizontal className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-border/40 p-1.5 shadow-2xl bg-card">
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-all">
                  <Edit2 className="h-4 w-4" /> Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this post?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-all"
                >
                  <Trash2 className="h-4 w-4" /> Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
             <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-3 sm:px-5 pb-3 sm:pb-5">
        {isEditing ? (
          <div className="space-y-4 p-1">
            <Textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[140px] text-base rounded-2xl border-border/40 bg-muted/20 focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 leading-relaxed"
              placeholder="Edit your post..."
            />
            <div className="flex justify-end gap-2.5">
               <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="rounded-xl h-9 text-xs font-bold hover:bg-muted/80">
                  Cancel
               </Button>
               <Button 
                size="sm" 
                onClick={handleUpdate} 
                disabled={updateMutation.isPending || !editContent.trim()}
                className="rounded-xl h-9 text-xs font-bold px-6 shadow-sm"
               >
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Post"}
               </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {post.content}
            </p>
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-border/20 bg-muted/10 shadow-sm transition-transform hover:scale-[1.005] duration-500">
                <div className={cn(
                  "w-full",
                  post.mediaUrls.length > 1 && "grid grid-cols-2 gap-0.5"
                )}>
                  {post.mediaUrls.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt="Post media" 
                      className="w-full h-auto object-cover max-h-[600px] hover:brightness-110 transition-all duration-700" 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interaction Stats */}
      {(likesCount > 0 || post._count.comments > 0) && (
        <div className="px-5 py-3 border-t border-border/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
           <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer group/stat">
              <div className="size-5 rounded-full bg-red-500 flex items-center justify-center -space-x-1 ring-2 ring-card group-hover/stat:ring-red-500/20 shadow-sm transition-all">
                 <Heart className="h-2.5 w-2.5 fill-white text-white" />
              </div>
              <span className="text-muted-foreground/80 lowercase"> {likesCount}</span>
           </div>
           <div className="flex gap-4">
              <span className="hover:text-primary transition-colors cursor-pointer capitalize">{post._count.comments} comments</span>
              <span className="hover:text-primary transition-colors cursor-pointer capitalize">42 shares</span>
           </div>
        </div>
      )}

      {/* Interaction Bar */}
      <div className="px-5 py-1.5 border-t border-border/10 flex items-center justify-between bg-muted/5">
        <div className="flex gap-1 flex-1">
          <button 
            onClick={() => toggleLikeMutation.mutate()}
            className={cn(
               "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all group/like",
               isLiked ? "bg-red-500/5 text-red-500" : "hover:bg-muted/80 text-muted-foreground hover:text-red-500"
            )}
          >
             <Heart className={cn("h-4.5 w-4.5 transition-transform group-hover/like:scale-125 duration-300", isLiked && "fill-current")} />
            <span className="text-xs font-bold">Like</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className={cn(
               "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all group/comment text-muted-foreground",
               showComments ? "bg-primary/5 text-primary" : "hover:bg-muted/80 hover:text-primary"
            )}
          >
            <MessageSquare className={cn("h-4.5 w-4.5 transition-transform group-hover/comment:scale-125 duration-300")} />
            <span className="text-xs font-bold">Comment</span>
          </button>
          
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-primary transition-all group/share">
            <Share2 className="h-4.5 w-4.5 transition-transform group-hover/share:scale-125 duration-300" />
            <span className="text-xs font-bold">Share</span>
          </button>
        </div>
      </div>

      {/* Comment Section - Input always visible, list toggleable */}
      <div className="border-t border-border/10 bg-muted/5 p-5 animate-in slide-in-from-top-4 duration-300">
        <CommentSection postId={post.id} showAll={showComments} />
      </div>
    </div>
  );
}
