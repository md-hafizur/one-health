"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Shield, Users, Heart, FileText, Settings, CreditCard, Calendar, Phone } from "lucide-react"
import { usePathname, useRouter } from "next/navigation" // Import useRouter

export function UserSidebar() {
  const pathname = usePathname()
  const router = useRouter() // Initialize useRouter

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/user/dashboard",
      badge: null,
    },
    {
      title: "My Health Card",
      icon: Shield,
      href: "/user/card",
      badge: null,
    },
    {
      title: "Family Members",
      icon: Users,
      href: "/user/members",
      badge: "2",
    },
    {
      title: "Health Records",
      icon: FileText,
      href: "/user/records",
      badge: null,
    },
    {
      title: "Benefits",
      icon: Heart,
      href: "/user/benefits",
      badge: "Active",
    },
    {
      title: "Appointments",
      icon: Calendar,
      href: "/user/appointments",
      badge: null,
    },
    {
      title: "Payment History",
      icon: CreditCard,
      href: "/user/payments",
      badge: null,
    },
    {
      title: "Emergency Contact",
      icon: Phone,
      href: "/user/emergency",
      badge: null,
    },
    {
      title: "Account Settings",
      icon: Settings,
      href: "/user/settings",
      badge: null,
    },
  ]

  return (
    <div className="p-4 h-full">
      <div className="space-y-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            // Remove Link component and use onClick on Button
            <Button
              key={index} // Move key to Button
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive ? "bg-green-600 text-white hover:bg-green-700" : "hover:bg-gray-100"
              }`}
              onClick={() => router.push(item.href)} // Use router.push for navigation
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={`ml-2 ${
                    isActive
                      ? "bg-green-700 text-white"
                      : item.badge === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
