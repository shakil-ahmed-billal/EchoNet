"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Loader2, Send } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await apiClient.get(`/comments/post/${postId}`);
      return response.data.data;
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (payload: { content: string; parentId?: string }) => {
      return apiClient.post(`/comments/post/${postId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setCommentInput("");
      setReplyingTo(null);
    },
  });

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    createCommentMutation.mutate({ 
      content: commentInput,
      parentId: replyingTo || undefined
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto no-scrollbar py-2">
        {comments?.map((comment: any) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onReply={() => setReplyingTo(comment.id)} 
          />
        ))}
        {comments?.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4 uppercase tracking-widest font-medium opacity-50">
            No comments yet
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-edge">
        {replyingTo && (
          <div className="flex items-center justify-between px-2 py-1 bg-muted/50 rounded-md">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
              Replying to comment...
            </span>
            <button 
              onClick={() => setReplyingTo(null)}
              className="text-[10px] text-primary hover:underline font-bold"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input 
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            className="h-9 bg-background border-edge text-sm"
          />
          <Button 
            size="icon-sm" 
            className="rounded-md h-9 w-9" 
            onClick={handleSendComment}
            disabled={createCommentMutation.isPending || !commentInput.trim()}
          >
            {createCommentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply }: { comment: any; onReply: () => void }) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="flex gap-3 px-1">
      <Avatar className="h-8 w-8 border border-edge shrink-0 mt-0.5">
        <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
        <AvatarFallback className="text-[10px]">{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 flex flex-col gap-1">
        <div className="bg-muted/30 rounded-2xl px-3 py-2 border border-edge/50">
          <span className="font-semibold text-xs text-foreground block">{comment.author.name}</span>
          <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 px-1">
          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">
            {formatDistanceToNow(new Date(comment.createdAt))}
          </span>
          <button className="text-[9px] font-bold text-muted-foreground hover:text-primary uppercase tracking-tight">
            Like
          </button>
          <button 
            onClick={onReply}
            className="text-[9px] font-bold text-muted-foreground hover:text-primary uppercase tracking-tight"
          >
            Reply
          </button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-1 ml-1 pl-4 border-l-2 border-edge/40 flex flex-col gap-3">
             <button 
                onClick={() => setShowReplies(!showReplies)}
                className="text-[10px] font-bold text-primary hover:underline text-left"
             >
                {showReplies ? "Hide Replies" : `View ${comment.replies.length} Replies`}
             </button>
             {showReplies && comment.replies.map((reply: any) => (
                <div key={reply.id} className="flex gap-2">
                   <Avatar className="h-6 w-6 border border-edge shrink-0">
                      <AvatarFallback className="text-[8px]">{reply.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                      <div className="bg-muted/20 rounded-xl px-2.5 py-1.5 border border-edge/30">
                         <span className="font-semibold text-[11px] text-foreground block">{reply.author.name}</span>
                         <p className="text-xs text-foreground/90 mt-0.5">{reply.content}</p>
                      </div>
                      <div className="flex items-center gap-3 px-1 mt-0.5">
                         <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight">
                            {formatDistanceToNow(new Date(reply.createdAt))}
                         </span>
                         <button className="text-[8px] font-bold text-muted-foreground hover:text-primary uppercase tracking-tight">
                            Like
                         </button>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
