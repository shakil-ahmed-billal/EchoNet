"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PostCard } from "@/components/feed/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Search as SearchIcon, User, X } from "lucide-react";
import Link from "next/link";
import { FollowButton } from "@/components/follow/FollowButton";
import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);

  // Sync input when URL changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const handleClear = () => {
    setInputValue("");
    router.push("/search");
  };

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
    <div className="flex flex-col gap-4 md:gap-6 w-full pb-20 max-w-4xl mx-auto">
      {/* Search Input Card */}
      <div className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 group">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search people, posts..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-xl bg-background/50 border-border/20 text-sm"
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="h-11 px-5 rounded-xl font-bold shrink-0">
            Search
          </Button>
        </form>
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="size-20 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-4">
            <SearchIcon className="size-9 text-primary/30" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">Search EchoNet</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-xs">
            Find people, posts, and more. Type something above to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="px-1">
            <p className="text-sm text-muted-foreground font-medium">
              Showing results for <span className="font-black text-foreground">"{query}"</span>
            </p>
          </div>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12 bg-muted/40 p-1 border border-border/50">
              <TabsTrigger value="users" className="rounded-xl font-bold">People</TabsTrigger>
              <TabsTrigger value="posts" className="rounded-xl font-bold">Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4 space-y-3">
              {usersLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
              ) : userResults?.length > 0 ? (
                userResults.map((user: any) => (
                  <div key={user.id} className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 p-4 flex items-center justify-between shadow-sm">
                    <Link href={`/profile/${user.id}`} className="flex items-center gap-3 group min-w-0">
                      <Avatar className="h-11 w-11 shrink-0 border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-sm group-hover:text-primary transition-colors truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </Link>
                    <div className="shrink-0 ml-2">
                      <FollowButton userId={user.id} initialStatus={user.followStatus || (user.isFollowing ? "ACCEPTED" : "NONE")} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/5 border-2 border-dashed border-muted rounded-3xl">
                  <User className="h-12 w-12 mx-auto text-muted/30 mb-4" />
                  <p className="text-muted-foreground font-medium">No users found for "{query}"</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-4 space-y-3">
              {postsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
              ) : postResults?.length > 0 ? (
                postResults.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-20 bg-muted/5 border-2 border-dashed border-muted rounded-3xl">
                  <SearchIcon className="h-12 w-12 mx-auto text-muted/30 mb-4" />
                  <p className="text-muted-foreground font-medium">No posts found for "{query}"</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
