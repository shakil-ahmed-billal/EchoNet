import { Metadata } from "next"
import { CreatePost } from "@/components/feed/create-post"
import { PostList } from "@/components/feed/post-list"

export const metadata: Metadata = {
  title: "Feed | EchoNet",
  description: "Your EchoNet Feed",
}

export default function FeedPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <CreatePost />
      <PostList discover={true} />
    </div>
  )
}
