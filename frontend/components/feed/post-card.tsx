"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Heart, Share2, MoreHorizontal } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Post } from "@/services/posts.service"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = React.useState(false)
  const [likes, setLikes] = React.useState(post.likesCount)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  return (
    <Card className="rounded-xl shadow-sm border overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
        <Avatar>
          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
          <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <p className="text-sm font-semibold leading-none">{post.author.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t mt-4 gap-2 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-1 gap-2 ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes > 0 ? likes : 'Like'}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span>{post.commentsCount > 0 ? post.commentsCount : 'Comment'}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-muted-foreground">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
