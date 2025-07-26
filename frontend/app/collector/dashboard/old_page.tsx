"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js"
import { useDispatch, useSelector } from "react-redux"
import { setLogout, selectAuth } from "@/lib/redux/authSlice";
import { resetSignup } from "@/lib/redux/signupSlice";
import { getCookie } from "@/lib/utils/csrf";
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, CreditCard, Plus, LogOut, UserCheck } from "lucide-react"
import Link from "next/link"
import { RegisteredUsersTable } from "@/components/registered-users-table"

export default function CollectorDashboard() {
  const [showSubAccountModal, setShowSubAccountModal] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()
  const authData = useSelector(selectAuth)
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [errorRecent, setErrorRecent] = useState<string | null>(null)
  const [statsData, setStatsData] = useState<any>({})
  const [loadingStats, setLoadingStats] = useState(true)
  const [errorStats, setErrorStats] = useState<string | null>(null)

  useEffect(() => {
    if (!authData.isInitializing) {
      if (!authData.isAuthenticated) {
        router.push("/login");
      } else if (authData.userRole === "collector" && !authData.phoneVerified && !authData.emailVerified) {
        // If authenticated as collector but neither phone nor email is verified, redirect to verification
        router.push("/signup/collector/verify");
      }
    }
  }, [authData.isAuthenticated, authData.isInitializing, authData.userRole, authData.phoneVerified, authData.emailVerified]);

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await getCurrentBrowserFingerPrint();
      setVisitorId(fp);
    };
    getFingerprint();

    const fetchRecentUsers = async () => {
      setLoadingRecent(true)
      setErrorRecent(null)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const csrfToken = getCookie("csrftoken")
        const response = await fetch(`${apiUrl}/accounts/last-user-details`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",
          },
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setRecentUsers(data)
      } catch (e: any) {
        setErrorRecent(e.message)
        toast.error(`Failed to fetch recent users: ${e.message}`)
      } finally {
        setLoadingRecent(false)
      }
    }

    fetchRecentUsers()

    const fetchStats = async () => {
      setLoadingStats(true)
      setErrorStats(null)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const csrfToken = getCookie("csrftoken")
        const response = await fetch(`${apiUrl}/accounts/user-statistics`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",
          },
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setStatsData(data)
      } catch (e: any) {
        setErrorStats(e.message)
        toast.error(`Failed to fetch stats: ${e.message}`)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, []);

const handleLogout = async () => {
  console.log("Logout button clicked.");

  const clearStateAndRedirect = () => {
    dispatch(setLogout());
    dispatch(resetSignup());
    localStorage.removeItem('authState');
    localStorage.removeItem('signupState');
    router.push("/login");
  };

  if (!visitorId) {
    toast.error("Visitor ID not generated. Please try again.");
    return;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Visitor-ID": visitorId,
        "X-CSRFToken": getCookie("csrftoken") || "",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const result = await response.json();
      toast.error(result.message || "Logout failed.");
    } else {
      const result = await response.json();
      toast.success(result.message || "Logged out successfully!");
    }
  } catch (error) {
    console.error("Logout Error:", error);
    toast.error("An unexpected error occurred during logout.");
  } finally {
    clearStateAndRedirect();
  }
};


  const stats = [
    {
      title: "Total Registered",
      value: loadingStats ? "-" : statsData.total_registered,
      change: "",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Pending Payments",
      value: loadingStats ? "-" : statsData.pending_payments,
      change: "",
      icon: CreditCard,
      color: "text-orange-600",
    },
    {
      title: "Paid Users",
      value: loadingStats ? "-" : statsData.paid_users,
      change: "",
      icon: UserCheck,
      color: "text-green-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Data Collector Dashboard</h1>
              <p className="text-gray-600">Welcome back, {authData.firstName} {authData.lastName}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Collector ID: {authData.applicationId}
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {loadingStats && <p>Loading...</p>}
                  {errorStats && <p className="text-red-500">{errorStats}</p>}
                  {!loadingStats && !errorStats && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Link href="/register">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Register Public User</CardTitle>
                  <CardDescription>Register a new user and collect their health information</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Registration
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/subAccount">
            <Card
              className="h-full hover:shadow-lg transition-shadow cursor-pointer"
              // onClick={() => setShowSubAccountModal(true)}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Create Sub-Account</CardTitle>
                <CardDescription>Create a family member account linked to existing user</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sub-Account
                </Button>
              </CardContent>
            </Card>
            </Link>
          </motion.div>
        </div>

        {/* Registered Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <RegisteredUsersTable />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
              <CardDescription>Latest user registrations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRecent && <p>Loading...</p>}
              {errorRecent && <p className="text-red-500">{errorRecent}</p>}
              {!loadingRecent && !errorRecent && recentUsers.length === 0 && <p>No recent registrations found.</p>}
              {!loadingRecent && !errorRecent && recentUsers.length > 0 && (
                <div className="space-y-4">
                  {recentUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-600">{user.service_code}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={user.email_verified || user.phone_verified ? "default" : "destructive"}
                          className={
                            user.email_verified || user.phone_verified
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {user.email_verified || user.phone_verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge
                          variant={user.payment_status === "Paid" ? "default" : "secondary"}
                          className={
                            user.payment_status === "Paid"
                              ? "bg-green-100 text-green-800 ml-2"
                              : "bg-yellow-100 text-yellow-800 ml-2"
                          }
                        >
                          {user.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
