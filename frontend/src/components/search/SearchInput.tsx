"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect } from "react";
import axios from "axios";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const router = useRouter();

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      search();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const search = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/search?q=${debouncedQuery}&type=users`);
      setResults(response.data.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="pl-8 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              router.push(`/search?q=${query}`);
            }
          }}
        />
        {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />}
      </div>
      
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-md shadow-lg z-50 overflow-hidden">
          {results.map((user) => (
            <div 
              key={user.id} 
              className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2"
              onClick={() => {
                router.push(`/profile/${user.id}`);
                setResults([]);
                setQuery("");
              }}
            >
              <img src={user.avatarUrl || "/default-avatar.png"} className="h-8 w-8 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
