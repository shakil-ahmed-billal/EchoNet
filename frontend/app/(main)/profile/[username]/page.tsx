"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostList } from "@/components/feed/post-list";
import { MapPin, Calendar, LinkIcon, Loader2, MessageSquare, UserPlus, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "@/services/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";

export default function ProfilePage() {
  const params = useParams();
  const id = (params.id || params.username) as string;
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
       const endpoint = (profile.isFollowing || profile.isFriend) ? '/follow/unfollow' : '/follow/follow';
       return apiClient.post(endpoint, { followingId: id });
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["profile", id] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest animate-pulse">
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
        <Button variant="outline" className="mt-8 rounded-xl px-8" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isSelf = currentUser?.id === profile.id;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      {/* Profile Header Card */}
      <div className="bg-card rounded-3xl border border-edge shadow-none overflow-hidden flex flex-col group">
        {/* Cover Graphic */}
        <div className="h-48 w-full bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary-rgb),0.1),transparent)]" />
           <div className="absolute -bottom-16 left-8 rounded-full border-[6px] border-card shadow-2xl transition-transform duration-500 group-hover:scale-105">
            <Avatar className="h-32 w-32 ring-1 ring-edge">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="text-4xl font-bold bg-muted text-muted-foreground">
                {profile.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Profile Info Details */}
        <div className="pt-20 px-8 pb-8 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                 <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.name}</h1>
                 {profile.role === 'ADMIN' && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20">
                       Admin
                    </span>
                 )}
              </div>
              <p className="text-muted-foreground font-medium">@{profile.name.toLowerCase().replace(/\s+/g, '')}</p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              {isSelf ? (
                <EditProfileDialog user={profile}>
                  <Button className="rounded-xl px-8 h-12 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex-1 sm:flex-none">
                    Edit Profile
                  </Button>
                </EditProfileDialog>
              ) : (
                <>
                  <Button 
                    variant={(profile.isFollowing || profile.isFriend) ? "outline" : "default"}
                    className={cn(
                      "rounded-xl px-8 h-12 font-semibold text-sm transition-all flex-1 sm:flex-none",
                      (!profile.isFollowing && !profile.isFriend) && "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                      (profile.isFollowing || profile.isFriend) && "bg-muted/50 border-edge hover:bg-muted/80"
                    )}
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                  >
                    {followMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : profile.isFriend ? (
                      <><UserCheck className="h-4 w-4 mr-2" /> Friends</>
                    ) : profile.isFollowing ? (
                      <><UserCheck className="h-4 w-4 mr-2" /> Request Sent</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-2" /> Add Friend</>
                    )}
                  </Button>
                  <Link href={`/messages?userId=${profile.id}`}>
                    <Button variant="outline" className="rounded-xl h-12 w-12 p-0 border-edge hover:bg-muted/50">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <p className="mt-6 text-base max-w-2xl leading-relaxed text-foreground/80">
            {profile.bio || "No bio yet. This user prefers to let their posts speak for them."}
          </p>
          
          <div className="flex flex-wrap gap-y-3 gap-x-6 mt-6 text-xs text-muted-foreground font-medium uppercase tracking-widest">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-edge/50">
               <MapPin className="h-3.5 w-3.5 text-primary" />
               <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-edge/50">
               <LinkIcon className="h-3.5 w-3.5 text-primary" />
               <span className="lowercase hover:text-primary transition-colors cursor-pointer">echonet.app</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-edge/50">
               <Calendar className="h-3.5 w-3.5 text-primary" />
               <span>Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}</span>
            </div>
          </div>
          
          <div className="flex gap-10 mt-10 p-6 bg-muted/20 rounded-2xl border border-edge/50 w-fit">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-3xl tracking-tight text-foreground">{profile._count.following}</span>
              <span className="text-[10px] text-muted-foreground font-medium">Following</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-3xl tracking-tight text-foreground">{profile._count.followers}</span>
              <span className="text-[10px] text-muted-foreground font-medium">Followers</span>
            </div>
            <div className="flex items-baseline gap-2">
               <span className="font-bold text-3xl tracking-tight text-foreground">{profile._count.posts}</span>
               <span className="text-[10px] text-muted-foreground font-medium">Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      {isSelf || profile.isFriend ? (
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-fit flex gap-2 p-1 bg-muted/30 rounded-xl border border-edge mb-8">
            <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-8 py-2.5 text-xs font-semibold transition-all">
              Posts
            </TabsTrigger>
            <TabsTrigger value="replies" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-8 py-2.5 text-xs font-semibold transition-all">
              Replies
            </TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-8 py-2.5 text-xs font-semibold transition-all">
              Media
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="max-w-2xl">
               <PostList authorId={profile.id} />
            </div>
          </TabsContent>
          <TabsContent value="replies">
            <div className="flex flex-col items-center justify-center p-20 border border-dashed border-edge rounded-3xl bg-muted/5 text-center">
               <MessageSquare className="size-12 text-muted-foreground/20 mb-4" />
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No replies available</p>
            </div>
          </TabsContent>
          <TabsContent value="media">
            <div className="grid grid-cols-3 gap-2">
               <div className="aspect-square bg-muted/30 rounded-xl border border-edge flex items-center justify-center">
                  <LinkIcon className="h-6 w-6 text-muted-foreground/20" />
               </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-edge rounded-3xl mt-4 text-center max-w-2xl mx-auto w-full">
           <UserPlus className="size-16 text-muted-foreground/30 mb-6" />
           <h3 className="text-2xl font-bold text-foreground">This Profile is Locked</h3>
           <p className="text-muted-foreground mt-3 font-medium text-sm">Add them as a friend to view their posts, replies, and media.</p>
        </div>
      )}
    </div>
  );
}
