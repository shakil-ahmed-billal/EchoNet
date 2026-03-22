import { Metadata } from "next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostList } from "@/components/feed/post-list"
import { MapPin, Calendar, LinkIcon } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} | EchoNet`,
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  // In a real app, you'd fetch user data based on the username
  
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Cover Profile & Basic Info */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
        {/* Cover Photo Placeholder */}
        <div className="h-48 w-full bg-gradient-to-r from-primary/10 to-primary/40 relative">
          <div className="absolute -bottom-16 left-6 rounded-full border-4 border-card">
            <Avatar className="h-32 w-32">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt={username} />
              <AvatarFallback className="text-4xl">{username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Profile Details Container */}
        <div className="pt-20 px-6 pb-6 flex flex-col">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight">{username}</h1>
              <p className="text-muted-foreground">@{username.toLowerCase()}</p>
            </div>
            <div className="flex gap-2">
              <Button>Follow</Button>
              <Button variant="outline">Message</Button>
            </div>
          </div>
          
          <p className="mt-4 text-sm max-w-2xl">
            Software Developer navigating the tech world. Building EchoNet.
          </p>
          
          <div className="flex gap-4 mt-4 text-sm text-muted-foreground items-center">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> San Francisco</span>
            <span className="flex items-center gap-1"><LinkIcon className="h-4 w-4" /> echonet.app</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined March 2026</span>
          </div>
          
          <div className="flex gap-6 mt-6">
            <div className="flex flex-col">
              <span className="font-bold text-lg">145</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Following</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">1.2k</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Taba */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent border-b rounded-none mb-6">
          <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-2">
            Posts
          </TabsTrigger>
          <TabsTrigger value="replies" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-2">
            Replies
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-2">
            Media
          </TabsTrigger>
          <TabsTrigger value="likes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-2">
            Likes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-0">
          <PostList />
        </TabsContent>
        <TabsContent value="replies" className="mt-0 text-center py-8 text-muted-foreground border rounded-xl bg-card">
          No replies yet.
        </TabsContent>
        <TabsContent value="media" className="mt-0 text-center py-8 text-muted-foreground border rounded-xl bg-card">
          No media yet.
        </TabsContent>
        <TabsContent value="likes" className="mt-0 text-center py-8 text-muted-foreground border rounded-xl bg-card">
          No likes yet.
        </TabsContent>
      </Tabs>
    </div>
  )
}
