"use client"

import * as React from "react"
import { ImageIcon, Send } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCreatePost } from "@/hooks/use-posts"

export function CreatePost() {
  const [content, setContent] = React.useState("")
  const { mutate, isPending } = useCreatePost()

  const handleSubmit = () => {
    if (!content.trim()) return
    
    mutate(content, {
      onSuccess: () => {
        setContent("")
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Card className="p-4 rounded-xl border shadow-sm">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea 
            placeholder="What's on your mind?" 
            className="min-h-[80px] resize-none border-none shadow-none focus-visible:ring-0 p-2 text-base px-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
          />
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground rounded-full" disabled={isPending}>
              <ImageIcon className="h-4 w-4 text-emerald-500" />
              <span>Photo</span>
            </Button>
            
            <Button 
              size="sm" 
              className="gap-2 rounded-full px-4" 
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
            >
              <Send className="h-4 w-4" />
              <span>{isPending ? "Posting..." : "Post"}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
