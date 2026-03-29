"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useLikeReview, useReplyToReview } from "@/hooks/use-marketplace"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageSquare, Heart, Reply } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface ProductReviewsSectionProps {
  product: any
  onSubmitReview: (rating: number, comment: string) => void
  isSubmitting: boolean
}

export function ProductReviewsSection({ product, onSubmitReview, isSubmitting }: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");

  const likeMutation = useLikeReview(product.id);
  const replyMutation = useReplyToReview(product.id);

  const reviews = product.reviews || [];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmitReview(rating, comment);
    setComment("");
    setRating(5);
  };

  const handleLike = (reviewId: string) => {
    if (!user) {
      toast.error("Please login to like reviews");
      return;
    }
    likeMutation.mutate(reviewId);
  };

  const handleReply = (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to reply");
      return;
    }
    if (!replyComment.trim()) return;
    
    replyMutation.mutate({
      reviewId,
      data: { comment: replyComment }
    }, {
      onSuccess: () => {
        setReplyingTo(null);
        setReplyComment("");
      }
    });
  };

  return (
    <div className="flex flex-col gap-10">


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Post Review Form */}
        <div className="lg:col-span-1">
           <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
             Customer Reviews
          </h2>
          <p className="text-sm font-medium text-muted-foreground opacity-60">Read what others are saying about this product</p>
      </div>
          <div className="space-y-6">
             <div className="flex items-center gap-1.5 p-4 rounded-xl bg-muted/20 border border-border/10 w-fit">
                {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                      key={star} 
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-all hover:scale-110 focus:outline-none"
                   >
                      <Star className={cn("size-5", star <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30")} />
                   </button>
                ))}
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea 
                   placeholder="Write your review here..."
                   className="rounded-xl border-border/40 bg-card min-h-[120px] p-4 text-sm font-medium focus-visible:ring-primary/20 shadow-sm transition-all h-auto resize-none"
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                />
                <Button 
                   type="submit"
                   disabled={isSubmitting || !comment.trim()}
                   className="w-full rounded-xl h-12 font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                   {isSubmitting ? "Posting..." : <><MessageSquare className="size-4" /> Post Review</>}
                </Button>
             </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {reviews.length > 0 ? (
            reviews.map((review: any) => {
              const hasLiked = review.likes?.some((l: any) => l.userId === user?.id);
              return (
                <div key={review.id} className="flex flex-col gap-4">
                  <Card className="rounded-2xl border-border/20 bg-card/60 shadow-sm overflow-hidden border-none sm:border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10 rounded-xl border border-border/10">
                                <AvatarImage src={review.user?.avatarUrl || review.user?.image} />
                                <AvatarFallback className="rounded-xl font-bold bg-muted text-muted-foreground text-xs">
                                  {review.user?.name?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <h4 className="font-bold text-sm truncate text-foreground">{review.user?.name}</h4>
                                <p className="text-[10px] font-semibold text-muted-foreground opacity-60">
                                  {formatDistanceToNow(new Date(review.createdAt))} ago
                                </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={cn("size-3", s <= review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/20")} />
                            ))}
                          </div>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed pl-[52px] mb-6">
                          {review.comment}
                      </p>

                      <div className="flex items-center gap-4 pl-[52px]">
                        <button 
                           onClick={() => handleLike(review.id)}
                           className={cn(
                              "flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105 active:scale-95",
                              hasLiked ? "text-rose-500" : "text-muted-foreground/60 hover:text-rose-500"
                           )}
                        >
                           <Heart className={cn("size-4", hasLiked && "fill-current")} />
                           <span>{review.likes?.length || 0}</span>
                        </button>
                        <button 
                           onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                           className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60 hover:text-primary transition-all hover:scale-105 active:scale-95"
                        >
                           <Reply className="size-4" />
                           <span>Reply</span>
                        </button>
                      </div>

                      {/* Reply Form */}
                      {replyingTo === review.id && (
                        <form onSubmit={(e) => handleReply(e, review.id)} className="mt-6 pl-[52px] space-y-3 animate-in slide-in-from-top-2 duration-200">
                          <Textarea 
                            placeholder="Write a reply..."
                            className="text-xs min-h-[80px] rounded-xl border-border/40 bg-muted/20 focus-visible:ring-primary/20 p-3 h-auto resize-none"
                            value={replyComment}
                            onChange={(e) => setReplyComment(e.target.value)}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="text-[10px] font-bold h-8 rounded-lg"
                              onClick={() => setReplyingTo(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              size="sm" 
                              className="text-[10px] font-bold h-8 rounded-lg px-4"
                              disabled={replyMutation.isPending || !replyComment.trim()}
                            >
                              {replyMutation.isPending ? "Posting..." : "Post Reply"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>

                  {/* Replies List */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="flex flex-col gap-3 pl-10 border-l-2 border-border/10 ml-[26px]">
                      {review.replies.map((reply: any) => (
                        <div key={reply.id} className="bg-muted/10 rounded-2xl p-4 border border-border/10">
                          <div className="flex items-center gap-3 mb-2">
                             <Avatar className="size-8 rounded-lg border border-border/10">
                                <AvatarImage src={reply.user?.avatarUrl || reply.user?.image} />
                                <AvatarFallback className="rounded-lg font-bold bg-muted text-muted-foreground text-[10px]">
                                   {reply.user?.name?.[0] || "U"}
                                </AvatarFallback>
                             </Avatar>
                             <div className="flex flex-col min-w-0">
                                <h5 className="font-bold text-xs truncate text-foreground">{reply.user?.name}</h5>
                                <p className="text-[9px] font-semibold text-muted-foreground opacity-50">
                                   {formatDistanceToNow(new Date(reply.createdAt))} ago
                                </p>
                             </div>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground/90 leading-relaxed pl-11">
                             {reply.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/40">
               <div className="size-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                  <MessageSquare className="size-6 text-muted-foreground/30" />
               </div>
               <p className="text-sm font-bold text-muted-foreground/40">No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
