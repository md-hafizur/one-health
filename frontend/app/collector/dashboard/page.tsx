"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, CreditCard, Plus, LogOut, UserCheck } from "lucide-react"
import Link from "next/link"
import { CreateSubAccountModal } from "@/components/enhanced-sub-account-modal"
import { RegisteredUsersTable } from "@/components/registered-users-table"

export default function CollectorDashboard() {
  const [showSubAccountModal, setShowSubAccountModal] = useState(false)

  const stats = [
    {
      title: "Total Registered",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Pending Payments",
      value: "23",
      change: "-5%",
      icon: CreditCard,
      color: "text-orange-600",
    },
    {
      title: "Paid Users",
      value: "1,224",
      change: "+15%",
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
              <p className="text-gray-600">Welcome back, John Collector</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Collector ID: DC-001
              </Badge>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                      <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
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
            <Card
              className="h-full hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setShowSubAccountModal(true)}
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
              <div className="space-y-4">
                {[
                  { name: "Sarah Ahmed", id: "OH-2024-1247", status: "Paid", time: "2 hours ago" },
                  { name: "Mohammad Rahman", id: "OH-2024-1246", status: "Pending", time: "4 hours ago" },
                  { name: "Fatima Khan", id: "OH-2024-1245", status: "Paid", time: "6 hours ago" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.id}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={user.status === "Paid" ? "default" : "secondary"}
                        className={
                          user.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {user.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{user.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateSubAccountModal open={showSubAccountModal} onOpenChange={setShowSubAccountModal} />
    </div>
  )
}
