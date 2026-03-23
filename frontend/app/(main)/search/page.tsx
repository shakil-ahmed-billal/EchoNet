"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsers, UserSuggestion } from "@/services/users.service";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function SearchPage() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["users", "search", debouncedTerm],
    queryFn: () => getUsers({ searchTerm: debouncedTerm }),
    enabled: debouncedTerm.length > 0,
  });

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full px-4 pt-4">
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
        <Input 
          type="text" 
          placeholder="Search for people..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
          className="h-12 pl-12 bg-muted/40 border-border/20 focus:bg-card focus:border-primary/40 rounded-2xl transition-all text-base placeholder:text-muted-foreground/60 w-full shadow-inner"
        />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {isLoading ? (
          <div className="p-12 flex justify-center text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : results.length > 0 ? (
          results.map((u: UserSuggestion) => (
            <Link 
              key={u.id} 
              href={`/profile/${u.id}`}
              className="flex items-center justify-between p-4 bg-card/40 border border-border/20 rounded-2xl hover:bg-card/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarImage src={u.avatarUrl || u.image || ""} alt={u.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {u.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground leading-tight">{u.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {u.id === currentUser?.id ? "You" : u.isFriend ? "Friend" : "User"}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : searchTerm.length > 0 ? (
          <div className="p-12 text-center text-muted-foreground italic">
            No users found matching "{searchTerm}"
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground italic">
            Start typing to search for friends...
          </div>
        )}
      </div>
    </div>
  );
}
