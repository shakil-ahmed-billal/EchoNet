import { Metadata } from "next"
import { PostList } from "@/components/feed/post-list"

export const metadata: Metadata = {
  title: "Discover | EchoNet",
  description: "Discover posts from the EchoNet community",
}

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <PostList discover={true} />
    </div>
  )
}
