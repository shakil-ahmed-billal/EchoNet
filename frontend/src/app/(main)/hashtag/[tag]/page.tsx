"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PostCard } from "@/components/feed/post-card";
import { Loader2, Hash } from "lucide-react";

export default function HashtagPage() {
  const params = useParams();
  const tag = params.tag as string;

  const { data: posts, isLoading } = useQuery({
    queryKey: ["hashtag", tag],
    queryFn: async () => {
      // In a real app, this might be a dedicated hashtag endpoint 
      // but for now we'll use search with type=posts
      const response = await apiClient.get(`/search?q=%23${tag}&type=posts`);
      return response.data.data;
    },
    enabled: !!tag,
  });

  return (
    <div className="flex flex-col gap-6 w-full pb-20 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Hash className="size-6 text-primary" />
        </div>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">#{tag}</h1>
            <p className="text-sm text-muted-foreground">Explore posts matching this hashtag</p>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : posts?.length > 0 ? (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-20 bg-muted/5 border-2 border-dashed border-muted rounded-3xl">
            <p className="text-muted-foreground">No posts found with this hashtag yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
