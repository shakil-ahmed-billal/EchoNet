import { Metadata } from "next"
import dynamic from "next/dynamic"

const CreatePost = dynamic(() => import("@/components/feed/create-post").then(m => m.CreatePost), { 
  loading: () => <div className="h-32 bg-muted/20 animate-pulse rounded-2xl" /> 
})
const PostList = dynamic(() => import("@/components/feed/post-list").then(m => m.PostList), {
  loading: () => <div className="space-y-4"><div className="h-64 bg-muted/20 animate-pulse rounded-2xl" /></div>
})
const StoryBar = dynamic(() => import("@/components/stories/story-bar").then(m => m.StoryBar), {
  loading: () => <div className="h-24 bg-muted/20 animate-pulse rounded-2xl" />
})

export const metadata: Metadata = {
  title: "Feed | EchoNet",
  description: "Your EchoNet Feed",
}

export default function FeedPage() {
  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/20 shadow-sm">
        <StoryBar />
      </div>
      <CreatePost />
      <PostList discover={true} />
    </div>
  )
}
