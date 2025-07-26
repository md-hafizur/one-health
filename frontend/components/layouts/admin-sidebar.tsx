"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, CreditCard, BarChart3, Settings, FileText, AlertTriangle, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/admin/dashboard",
      badge: null,
    },
    {
      title: "All Users",
      icon: Users,
      href: "/admin/users",
      badge: "2,847",
    },
    {
      title: "Data Collectors",
      icon: Shield,
      href: "/admin/collectors",
      badge: "45",
    },
    {
      title: "Pending Applications",
      icon: AlertTriangle,
      href: "/admin/pending",
      badge: "12",
    },
    {
      title: "Payment Logs",
      icon: CreditCard,
      href: "/admin/payments",
      badge: null,
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      badge: null,
    },
    {
      title: "Reports",
      icon: FileText,
      href: "/admin/reports",
      badge: null,
    },
    {
      title: "System Settings",
      icon: Settings,
      href: "/admin/settings",
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
                  isActive ? "bg-red-600 text-white hover:bg-red-700" : "hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${isActive ? "bg-red-700 text-white" : "bg-gray-200 text-gray-700"}`}
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
