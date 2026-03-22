import { Metadata } from "next"
import { PostList } from "@/components/feed/post-list"

export const metadata: Metadata = {
  title: "Discover | EchoNet",
  description: "Discover posts from the EchoNet community",
}

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-1 border-b border-border/20 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
        <p className="text-sm text-muted-foreground">Explore posts from the entire EchoNet community</p>
      </div>
      <PostList discover={true} />
    </div>
  )
}
