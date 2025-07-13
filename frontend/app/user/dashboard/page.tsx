"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { selectAuth } from "@/lib/redux/authSlice"
import { toast } from "sonner"
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  QrCode,
  Users,
  Settings,
  LogOut,
  Download,
  Eye,
  ChevronRight,
  Heart,
  Activity,
  FileText,
} from "lucide-react"
import Link from "next/link"

export default function UserDashboard() {
  const [showQR, setShowQR] = useState(false)
  const router = useRouter()
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const authData = useSelector(selectAuth)

  useEffect(() => {
    if (!authData.isAuthenticated || authData.userRole !== "user") {
      router.push("/login");
    }

    const getFingerprint = async () => {
      const fp = await getCurrentBrowserFingerPrint();
      setVisitorId(fp);
    };
    getFingerprint();
  }, [authData.isAuthenticated, authData.userRole, router]);

  const handleLogout = async () => {
    console.log("Logout button clicked.")
    if (!visitorId) {
      console.log("Visitor ID not available.", visitorId)
      toast.error("Visitor ID not generated. Please try again.")
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    console.log("API URL for logout:", apiUrl)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorId,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.message || "Logout failed.")
        return
      }

      toast.success(result.message || "Logged out successfully!")
      router.push("/login")
    } catch (error) {
      console.error("Logout Error:", error)
      toast.error("An unexpected error occurred during logout.")
    }
  }

  const subAccounts = [
    { name: "Sarah Ahmed", id: "OH-2024-1248", relation: "Daughter", age: 12 },
    { name: "Ahmed Ali", id: "OH-2024-1249", relation: "Son", age: 8 },
  ]

  const benefits = [
    {
      title: "Free Health Checkups",
      description: "Annual health checkups at partner hospitals",
      icon: Heart,
      status: "Active",
    },
    {
      title: "Emergency Services",
      description: "24/7 emergency medical assistance",
      icon: Activity,
      status: "Active",
    },
    {
      title: "Digital Records",
      description: "Secure cloud storage of medical records",
      icon: FileText,
      status: "Active",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Health Dashboard</h1>
              <p className="text-gray-600">Welcome back, John Doe</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active Member
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Digital Card Section */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-8 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-green-500 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">Digital Health Card</h2>
                      <p className="text-blue-100">OneHealth Member</p>
                    </div>
                    <Shield className="h-12 w-12 text-white/80" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div>
                      <p className="text-blue-100 text-sm">Full Name</p>
                      <p className="text-xl font-semibold">John Doe</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Member ID</p>
                      <p className="text-xl font-semibold">OH-2024-001</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Valid Until</p>
                      <p className="text-lg font-semibold">December 2025</p>
                    </div>
                    <div className="flex justify-end">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center cursor-pointer"
                        onClick={() => setShowQR(!showQR)}
                      >
                        <QrCode className="h-10 w-10 text-white" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download Card
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sub-Accounts */}
            {subAccounts.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Linked Family Members
                    </CardTitle>
                    <CardDescription>Manage your family members' health cards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subAccounts.map((account, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{account.name}</p>
                            <p className="text-sm text-gray-600">
                              {account.relation} • Age {account.age}
                            </p>
                            <p className="text-sm text-blue-600">{account.id}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Member Benefits</CardTitle>
                  <CardDescription>Your active benefits and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{benefit.title}</p>
                          <p className="text-xs text-gray-600">{benefit.description}</p>
                          <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200">
                            {benefit.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Medical Records
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
