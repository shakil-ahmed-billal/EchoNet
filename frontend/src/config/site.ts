import { 
  Home, 
  Compass, 
  MessageSquare, 
  Bell, 
  User, 
  Users, 
  ShoppingBag, 
  Store, 
  Building2, 
  MapPin, 
  Package
} from "lucide-react"

export const SITE_INFO = {
  name: "EchoNet",
  description: "A dynamic social network platform",
  url: "https://echonet.app",
}

export const MAIN_NAV = [
  { title: "Home", href: "/", icon: Home },
  { title: "Discover", href: "/discover", icon: Compass },
  { title: "Friends", href: "/friends", icon: Users },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { title: "Properties", href: "/properties", icon: MapPin },
  { title: "My Store", href: "/store", icon: Store },
  { title: "My Properties", href: "/my-properties", icon: Building2 },
  { title: "My Orders", href: "/orders", icon: Package },
  { title: "Profile", href: "/profile", icon: User },
]
