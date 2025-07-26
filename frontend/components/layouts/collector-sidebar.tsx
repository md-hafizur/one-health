"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, UserPlus, Users, CreditCard, BarChart3, FileText, Settings, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function CollectorSidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/collector/dashboard",
      badge: null,
    },
    {
      title: "Register User",
      icon: UserPlus,
      href: "/register",
      badge: null,
    },
    {
      title: "My Registrations",
      icon: Users,
      href: "/collector/registrations",
      badge: "247",
    },
    {
      title: "Pending Payments",
      icon: Clock,
      href: "/collector/pending",
      badge: "23",
    },
    {
      title: "Payment History",
      icon: CreditCard,
      href: "/collector/payments",
      badge: null,
    },
    {
      title: "Performance",
      icon: BarChart3,
      href: "/collector/performance",
      badge: null,
    },
    {
      title: "Reports",
      icon: FileText,
      href: "/collector/reports",
      badge: null,
    },
    {
      title: "Profile Settings",
      icon: Settings,
      href: "/collector/settings",
      badge: null,
    },
  ]

  return (
    <div className="p-4 h-full">
      <div className="space-y-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link key={index} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${isActive ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
