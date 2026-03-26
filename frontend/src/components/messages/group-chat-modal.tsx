"use client";

import { useState, useEffect } from "react";
import { X, Search, Users, Check, Loader2, Video, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessenger } from "./messenger-context";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/services/api-client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function GroupChatModal() {
  const { isGroupModalOpen, closeGroupModal, openGroupChat } = useMessenger();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [step, setStep] = useState<"select" | "name">("select");

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["users", "group-modal"],
    queryFn: async () => {
      const res = await apiClient.get("/users");
      return res.data.data.filter((u: any) => u.id !== currentUser?.id);
    },
    enabled: !!currentUser && isGroupModalOpen,
  });

  // Reset on close
  useEffect(() => {
    if (!isGroupModalOpen) {
      setSearch("");
      setSelectedUsers([]);
      setGroupName("");
      setStep("select");
    }
  }, [isGroupModalOpen]);

  const filtered = users?.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (u: any) => {
    setSelectedUsers((prev) =>
      prev.find((p) => p.id === u.id)
        ? prev.filter((p) => p.id !== u.id)
        : [...prev, u]
    );
  };

  const handleCreate = () => {
    if (selectedUsers.length < 2) {
      toast.error("Select at least 2 people for a group chat");
      return;
    }
    const name = groupName.trim() || selectedUsers.map((u) => u.name.split(" ")[0]).join(", ");
    openGroupChat({
      id: `group-${Date.now()}`,
      name,
      members: selectedUsers,
    });
    toast.success(`Group "${name}" created!`);
  };

  if (!isGroupModalOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={closeGroupModal}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border/30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">New Group Chat</h2>
              <p className="text-xs text-muted-foreground">
                {step === "select"
                  ? `${selectedUsers.length} selected`
                  : "Name your group"}
              </p>
            </div>
          </div>
          <button
            onClick={closeGroupModal}
            className="size-9 rounded-full flex items-center justify-center hover:bg-muted/60 text-muted-foreground transition-all"
          >
            <X className="size-4" />
          </button>
        </div>

        {step === "select" ? (
          <>
            {/* Selected chips */}
            {selectedUsers.length > 0 && (
              <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-border/20">
                {selectedUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => toggleUser(u)}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full px-3 py-1.5 hover:bg-destructive/10 hover:text-destructive transition-all group"
                  >
                    <Avatar className="size-4">
                      <AvatarImage src={u.avatarUrl || u.image} alt={u.name} />
                      <AvatarFallback className="text-[8px]">{u.name[0]}</AvatarFallback>
                    </Avatar>
                    {u.name.split(" ")[0]}
                    <X className="size-3 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  autoFocus
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search friends..."
                  className="pl-9 h-10 rounded-full bg-muted/60 border-0 shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
            </div>

            {/* User list */}
            <ScrollArea className="h-[280px]">
              <div className="px-2 pb-2 space-y-0.5">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-5 animate-spin text-muted-foreground/40" />
                  </div>
                ) : (
                  filtered?.map((u: any) => {
                    const isSelected = !!selectedUsers.find((p) => p.id === u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggleUser(u)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/60"
                        )}
                      >
                        <Avatar className="size-10 shrink-0">
                          <AvatarImage src={u.avatarUrl || u.image} alt={u.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {u.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground/60">@{u.name.toLowerCase().replace(/\s/g, "")}</p>
                        </div>
                        <div className={cn(
                          "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          isSelected ? "bg-primary border-primary" : "border-border"
                        )}>
                          {isSelected && <Check className="size-3 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-border/20">
              <Button
                className="w-full rounded-2xl h-11 font-bold"
                disabled={selectedUsers.length < 2}
                onClick={() => setStep("name")}
              >
                Next ({selectedUsers.length} selected)
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 p-5">
            {/* Group avatar preview */}
            <div className="flex justify-center">
              <div className="relative size-20">
                {selectedUsers.slice(0, 4).map((u, i) => (
                  <Avatar
                    key={u.id}
                    className={cn(
                      "absolute size-10 ring-2 ring-card",
                      i === 0 && "top-0 left-0",
                      i === 1 && "top-0 right-0",
                      i === 2 && "bottom-0 left-0",
                      i === 3 && "bottom-0 right-0",
                      selectedUsers.length === 2 && i === 0 && "top-0 left-1/2 -translate-x-1/2 -translate-y-1",
                      selectedUsers.length === 2 && i === 1 && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1",
                    )}
                  >
                    <AvatarImage src={u.avatarUrl || u.image} alt={u.name} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {u.name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>

            <Input
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={`${selectedUsers.map((u) => u.name.split(" ")[0]).join(", ")} (default)`}
              className="h-11 rounded-2xl bg-muted/60 border-border/30 text-sm font-semibold text-center placeholder:font-normal focus-visible:ring-primary/30"
            />

            <p className="text-xs text-muted-foreground text-center">
              {selectedUsers.length} members · You can add more people later
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl h-11" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button className="flex-1 rounded-2xl h-11 font-bold" onClick={handleCreate}>
                <Users className="mr-2 size-4" />
                Create Group
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
