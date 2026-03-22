import { Metadata } from "next"
import { CreatePost } from "@/components/feed/create-post"
import { PostList } from "@/components/feed/post-list"

export const metadata: Metadata = {
  title: "Feed | EchoNet",
  description: "Your EchoNet Feed",
}

export default function FeedPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
      <div className="flex flex-col gap-6">
        <CreatePost />
        <PostList />
      </div>

      <aside className="hidden md:flex flex-col gap-6">
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-4 sticky top-20">
          <h3 className="font-semibold mb-4 text-lg">Trending</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center group cursor-pointer">
              <span className="font-medium text-primary group-hover:underline">#Nextjs16</span>
              <span className="text-xs text-muted-foreground">1.2k posts</span>
            </div>
            <div className="flex justify-between items-center group cursor-pointer">
              <span className="font-medium text-primary group-hover:underline">#Tailwindv4</span>
              <span className="text-xs text-muted-foreground">856 posts</span>
            </div>
            <div className="flex justify-between items-center group cursor-pointer">
              <span className="font-medium text-primary group-hover:underline">#ShadcnUI</span>
              <span className="text-xs text-muted-foreground">500 posts</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
