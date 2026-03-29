"use client";

import { PostList } from "@/components/feed/post-list";
import { SavedPostList } from "@/components/feed/saved-post-list";
import { MyOrdersList } from "@/components/marketplace/my-orders-list";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useStories } from "@/hooks/use-posts";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  LinkIcon,
  Loader2,
  MapPin,
  MessageSquare,
  UserCheck,
  UserPlus,
  Briefcase,
  GraduationCap,
  Globe,
  Shield,
  BadgeCheck
} from "lucide-react";
import { FollowButton } from "@/components/follow/FollowButton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserImage } from "@/components/user-image";

export default function ProfilePage() {
  const params = useParams();
  const id = (params.id || params.username) as string;
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: globalStories } = useStories();

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const endpoint =
        profile.isFollowing || profile.isFriend
          ? "/follow/unfollow"
          : "/follow/follow";
      return apiClient.post(endpoint, { followingId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading Profile...
        </p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 border border-dashed border-edge rounded-3xl bg-muted/5 max-w-2xl mx-auto">
        <div className="size-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
          <MapPin className="size-10 text-muted-foreground/20" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">User Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The profile you're looking for doesn't exist or has been moved.
        </p>
        <Button
          variant="outline"
          className="mt-8 rounded-xl px-8"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const isSelf = currentUser?.id === profile.id;
  const myStoriesGroup = globalStories?.find((group: any) => group.isOwn);
  const myStories = myStoriesGroup?.stories || [];

  // Safely extract string from JSON array fields
  const workplaceDisplay = Array.isArray(profile.workplaces) ? profile.workplaces[0] : profile.workplace;
  const educationDisplay = Array.isArray(profile.education) ? profile.education[0] : profile.education;

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      {/* Profile Header Section */}
      <div className="bg-card rounded-3xl border border-border/50 overflow-hidden flex flex-col shadow-sm">
        {/* Cover Area */}
        <div className="h-48 w-full bg-linear-to-br from-muted/50 via-muted/30 to-muted/50 relative">
          {profile.coverPhotoUrl && (
            <img 
              src={profile.coverPhotoUrl} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute -bottom-16 left-8 sm:left-12 rounded-full border-4 border-card bg-card shadow-sm z-10">
            <UserImage user={profile} className="h-32 w-32 sm:h-36 sm:w-36" />
          </div>
        </div>

        {/* Info Area */}
        <div className="pt-20 px-8 sm:px-12 pb-8 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {profile.name}
                </h1>
                {profile.role === "ADMIN" && (
                  <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                    Admin
                  </div>
                )}
                {profile.isFriend && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">
                    <BadgeCheck className="size-3" /> Friends
                  </div>
                )}
                {profile.isPrivate && (
                  <div className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold border border-border flex items-center gap-1">
                    <Shield className="size-3" /> Private
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground/60 font-bold">
                @{profile.name.toLowerCase().replace(/\s+/g, "")}
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {isSelf ? (
                <EditProfileDialog user={profile}>
                  <Button className="rounded-xl px-8 font-semibold text-sm shadow-sm flex-1 md:flex-none">
                    Edit Profile
                  </Button>
                </EditProfileDialog>
              ) : (
                <>
                  <FollowButton 
                    userId={profile.id} 
                    initialStatus={profile.followStatus || (profile.isFollowing ? "ACCEPTED" : "NONE")} 
                    onStatusChange={() => queryClient.invalidateQueries({ queryKey: ["profile", id] })}
                  />
                  <Link href={`/messages?userId=${profile.id}`} className="md:flex-none">
                    <Button
                      variant="outline"
                      className="rounded-xl h-10 w-10 p-0 hover:bg-muted/50 transition-all border-border/50"
                    >
                      <MessageSquare className="size-5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <p className="mt-6 text-sm max-w-2xl text-foreground/80 leading-relaxed font-normal">
            {profile.bio || "No bio yet."}
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-[10px] text-muted-foreground font-bold">
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 opacity-70" />
                <span>{profile.location}</span>
              </div>
            )}
            {workplaceDisplay && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="size-3.5 opacity-70" />
                <span>Works at {workplaceDisplay}</span>
              </div>
            )}
            {educationDisplay && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="size-3.5 opacity-70" />
                <span>Studied at {educationDisplay}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="size-3.5 opacity-70" />
                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline lowercase">
                  {profile.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 opacity-70" />
              <span>Joined {format(new Date(profile.createdAt), "MMMM yyyy")}</span>
            </div>
          </div>

          <div className="flex gap-8 mt-8">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">
                {profile._count.posts}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground/50">Posts</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">
                {profile._count.followers}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground/50">Followers</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">
                {profile._count.following}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground/50">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content Area */}
      {isSelf || !profile.isPrivate || profile.isFriend || profile.isFollowing ? (
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full h-12 bg-muted/40 p-1 rounded-2xl border border-border/50 mb-6 flex overflow-hidden">
            <TabsTrigger
              value="posts"
              className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2 text-sm font-semibold transition-all"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="replies"
              className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2 text-sm font-semibold transition-all"
            >
              Replies
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2 text-sm font-semibold transition-all"
            >
              Media
            </TabsTrigger>
            {isSelf && (
              <>
                <TabsTrigger
                  value="saved"
                  className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2 text-sm font-semibold transition-all"
                >
                  Saved
                </TabsTrigger>
                <TabsTrigger
                  value="stories"
                  className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2 text-sm font-semibold transition-all"
                >
                  Stories
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2 text-sm font-semibold transition-all"
                >
                  Orders
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="posts" className="focus-visible:outline-none">
            <PostList authorId={profile.id} />
          </TabsContent>
          <TabsContent value="replies">
            <div className="py-20 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/5">
              <p className="text-sm font-medium text-muted-foreground">No replies yet.</p>
            </div>
          </TabsContent>
          <TabsContent value="media">
            <div className="py-20 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/5">
              <p className="text-sm font-medium text-muted-foreground">No media shared yet.</p>
            </div>
          </TabsContent>
          {isSelf && (
            <>
              <TabsContent value="saved" className="focus-visible:outline-none">
                <SavedPostList />
              </TabsContent>
              <TabsContent value="stories" className="focus-visible:outline-none">
                {myStories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {myStories.map((story: any) => (
                      <div key={story.id} className="relative aspect-9/16 rounded-2xl overflow-hidden shadow-sm group">
                        <img src={story.mediaUrl} alt="Story" className="object-cover w-full h-full" />
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
                          <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-md">
                            {story.caption || format(new Date(story.createdAt), "PPp")}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-white/80 text-[10px] font-bold tracking-wider">
                            <span className="bg-primary/80 px-1.5 py-0.5 rounded text-white">{story.viewsCount} views</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/5">
                    <p className="text-sm font-medium text-muted-foreground">You have no active stories.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="orders" className="focus-visible:outline-none">
                <div className="pt-2">
                    <MyOrdersList />
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card/60 border border-border/50 rounded-3xl text-center px-6">
          <UserPlus className="size-12 text-muted/30 mb-4" />
          <h3 className="text-xl font-semibold">Private Profile</h3>
          <p className="text-muted-foreground mt-2 text-sm max-w-sm">
            Add them as a friend to view their posts and activity.
          </p>
          <Button
            className="mt-6 rounded-xl px-8 font-semibold"
            onClick={() => followMutation.mutate()}
            disabled={followMutation.isPending}
          >
            Add Friend
          </Button>
        </div>
      )}
    </div>
  );
}
