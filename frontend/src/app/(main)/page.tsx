import { Metadata } from "next"
import { CreatePost } from "@/components/feed/create-post"
import { PostList } from "@/components/feed/post-list"
import { StoryBar } from "@/components/stories/story-bar"

export const metadata: Metadata = {
  title: "Feed | EchoNet",
  description: "Your EchoNet Feed",
}

export default function FeedPage() {
  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/20 shadow-sm">
        <StoryBar />
      </div>
      <CreatePost />
      <PostList discover={true} />
    </div>
  )
}
