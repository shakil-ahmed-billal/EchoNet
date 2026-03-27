"use client"

import { UserImage } from "./user-image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export function UserNav() {
  const { user, logout, isLoggingOut } = useAuth()

  if (!user) return null

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <UserImage user={user} className="h-9 w-9 border border-border" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/profile/${user.id}`} className="cursor-pointer font-medium hover:text-primary">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/store" className="cursor-pointer font-medium hover:text-primary">My Store</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-properties" className="cursor-pointer font-medium hover:text-primary">My Properties</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-bookings" className="cursor-pointer font-medium hover:text-primary">My Bookings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders" className="cursor-pointer font-medium hover:text-primary">My Orders</Link>
          </DropdownMenuItem>
          {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
            <DropdownMenuItem asChild>
              <Link href={user.role === 'ADMIN' ? `/admin/dashboard` : `/moderator/dashboard`} className="cursor-pointer font-medium hover:text-primary">
                {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Moderator Dashboard'}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} disabled={isLoggingOut} className="text-red-600 focus:text-red-600 cursor-pointer font-medium hover:bg-red-100">
          {isLoggingOut ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
