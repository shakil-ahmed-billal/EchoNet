import { Home, Compass, MessageSquare, Bell, User } from "lucide-react"

export const SITE_INFO = {
  name: "EchoNet",
  description: "A dynamic social network platform",
  url: "https://echonet.app",
}

export const MAIN_NAV = [
  { title: "Home", href: "/", icon: Home },
  { title: "Discover", href: "/discover", icon: Compass },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Profile", href: "/profile", icon: User },
]
