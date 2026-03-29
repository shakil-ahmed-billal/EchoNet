"use client";

import { PostCard } from "@/components/feed/post-card";
import { CommentSection } from "@/components/feed/comment-section";
import { apiClient } from "@/services/api-client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await apiClient.get(`/posts/${postId}`);
      return response.data.data;
    },
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading Post...
        </p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 border border-dashed border-border rounded-3xl bg-muted/5 max-w-2xl mx-auto">
        <div className="size-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
          <AlertCircle className="size-10 text-muted-foreground/20" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Post Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          This post may have been deleted, or you don't have permission to view it.
        </p>
        <Link href="/feed">
          <Button variant="outline" className="mt-8 rounded-xl px-8">
            Back to Feed
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-4 pb-20">
      {/* Back Button */}
      <Link href="/feed" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold pt-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </Link>

      {/* Post Card */}
      <PostCard post={post} />

      {/* Expanded Comments Section */}
      <div className="bg-card/40 border border-border/40 rounded-3xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-muted-foreground/60 mb-4">
          All Comments
        </h3>
        <CommentSection postId={post.id} showAll={true} />
      </div>
    </div>
  );
}
