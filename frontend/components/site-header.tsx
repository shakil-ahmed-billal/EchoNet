"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, Mail, Plus } from "lucide-react"
import { SITE_INFO } from "@/config/site"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "./ui/button"
import { UserNav } from "./user-nav"
import { Input } from "./ui/input"
import { useQuery } from "@tanstack/react-query"
import { getUsers, UserSuggestion } from "@/services/users.service"
import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Loader2 } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const { isAuthenticated, user: currentUser } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedTerm, setDebouncedTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["users", "search", debouncedTerm],
    queryFn: () => getUsers({ searchTerm: debouncedTerm }),
    enabled: debouncedTerm.length > 0,
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl h-14 md:h-16 flex items-center shadow-sm">
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 sm:gap-10">
          <Link href="/" className="flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
               <span className="text-primary-foreground font-black text-xl">E</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden lg:block text-foreground/90">{SITE_INFO.name}</span>
          </Link>
          
          {/* Search Bar - Premium Modern Look */}
          <div ref={searchRef} className="hidden md:flex items-center relative group min-w-[200px] lg:min-w-[320px]">
             <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
             <Input 
              type="text" 
              placeholder="Search EchoNet..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="h-10 pl-10 bg-muted/40 border-border/20 focus:bg-card focus:border-primary/40 rounded-full transition-all text-sm placeholder:text-muted-foreground/60 w-full shadow-inner"
             />

             {/* Search Results Dropdown */}
             {showSearch && searchTerm.length > 0 && (
               <div className="absolute top-12 left-0 w-full max-w-sm bg-card border border-border/40 shadow-xl shadow-black/5 rounded-2xl overflow-hidden flex flex-col z-50 py-2 animate-in fade-in slide-in-from-top-2">
                 {isSearching ? (
                   <div className="p-6 flex justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
                 ) : searchResults && searchResults.length > 0 ? (
                   searchResults.map((u: UserSuggestion) => (
                     <Link 
                       key={u.id} 
                       href={`/profile/${u.id}`}
                       onClick={() => setShowSearch(false)}
                       className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors"
                     >
                        <Avatar className="h-9 w-9 ring-1 ring-border/10">
                          <AvatarImage src={u.avatarUrl || u.image || ""} alt={u.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {u.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate text-foreground/90 leading-tight">
                            {u.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {u.id === currentUser?.id ? "You" : u.isFriend ? "Friend" : "User"}
                          </span>
                        </div>
                     </Link>
                   ))
                 ) : (
                   <div className="p-6 text-center text-sm font-medium text-muted-foreground">
                     No results for "{searchTerm}"
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-4">
                <div className="flex items-center gap-1">
                   {/* Mobile Icons */}
                   <Link href="/search" className="md:hidden">
                      <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                         <Search className="size-5" />
                      </Button>
                   </Link>
                   <Link href="/messages" className="md:hidden">
                      <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                         <Mail className="size-5" />
                      </Button>
                   </Link>

                   <div className="hidden sm:flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                         <Plus className="size-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                         <Bell className="size-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                         <Mail className="size-5" />
                      </Button>
                   </div>
                </div>
                <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />
                <UserNav />
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-bold rounded-xl px-5 h-9">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-xs font-bold rounded-xl px-6 h-9 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">Get Started</Button>
                </Link>
              </div>
            )}
            
            <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />
            <ThemeToggle />
            <div className="md:hidden">
               {/* Mobile Search Button could go here or in BottomNav */}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
