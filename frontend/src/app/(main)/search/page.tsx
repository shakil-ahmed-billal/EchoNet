"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PostCard } from "@/components/feed/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search as SearchIcon, User } from "lucide-react";
import Link from "next/link";
import { FollowButton } from "@/components/follow/FollowButton";
import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: userResults, isLoading: usersLoading } = useQuery({
    queryKey: ["search", "users", query],
    queryFn: async () => {
      const response = await apiClient.get(`/search?q=${query}&type=users`);
      return response.data.data;
    },
    enabled: !!query,
  });

  const { data: postResults, isLoading: postsLoading } = useQuery({
    queryKey: ["search", "posts", query],
    queryFn: async () => {
      const response = await apiClient.get(`/search?q=${query}&type=posts`);
      return response.data.data;
    },
    enabled: !!query,
  });

  return (
    <div className="flex flex-col gap-6 w-full pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">Showing results for "{query}"</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12 bg-muted/40 p-1 border border-border/50">
          <TabsTrigger value="users" className="rounded-xl font-bold">Users</TabsTrigger>
          <TabsTrigger value="posts" className="rounded-xl font-bold">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6 space-y-4">
          {usersLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : userResults?.length > 0 ? (
            userResults.map((user: any) => (
              <div key={user.id} className="bg-card p-4 rounded-3xl border border-border/50 flex items-center justify-between shadow-sm">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-4 group">
                  <Avatar className="h-12 w-12 border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold group-hover:text-primary transition-colors">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </Link>
                <FollowButton 
                    userId={user.id} 
                    initialStatus={user.followStatus || (user.isFollowing ? "ACCEPTED" : "NONE")} 
                />
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/5 border-2 border-dashed border-muted rounded-3xl">
              <User className="h-12 w-12 mx-auto text-muted/30 mb-4" />
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="mt-6 space-y-4">
          {postsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : postResults?.length > 0 ? (
            postResults.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-20 bg-muted/5 border-2 border-dashed border-muted rounded-3xl">
              <SearchIcon className="h-12 w-12 mx-auto text-muted/30 mb-4" />
              <p className="text-muted-foreground">No posts found matching your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Searching...</p>
        </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
