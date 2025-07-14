"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { selectAuth } from "@/lib/redux/authSlice"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, CreditCard, Search, LogOut, Download, Eye, MoreHorizontal, TreePine } from "lucide-react"
import Link from "next/link"
import { FamilyRelationshipView } from "@/components/family-relationship-view"
import { PendingCollectorsTable } from "@/components/pending-collectors-table"

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "relationships">("table")
  const router = useRouter()
  const authData = useSelector(selectAuth)

  useEffect(() => {
    if (!authData.isAuthenticated || authData.userRole !== "admin") {
      router.push("/login");
    }
  }, [authData.isAuthenticated, authData.userRole]);

  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Data Collectors",
      value: "45",
      change: "+3%",
      icon: Shield,
      color: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: "৳1,423,500",
      change: "+18%",
      icon: CreditCard,
      color: "text-purple-600",
    },
  ]

  const users = [
    {
      id: "OH-2024-001",
      name: "John Doe",
      role: "Public User",
      email: "john@example.com",
      phone: "+880 1234-567890",
      status: "Active",
      paymentStatus: "Paid",
      registeredBy: "DC-001",
      createdAt: "2024-01-15",
    },
    {
      id: "DC-001",
      name: "Sarah Collector",
      role: "Data Collector",
      email: "sarah@example.com",
      phone: "+880 1234-567891",
      status: "Active",
      paymentStatus: "N/A",
      registeredBy: "Admin",
      createdAt: "2024-01-10",
    },
    {
      id: "OH-2024-002",
      name: "Ahmed Rahman",
      role: "Public User",
      email: "ahmed@example.com",
      phone: "+880 1234-567892",
      status: "Pending",
      paymentStatus: "Pending",
      registeredBy: "DC-001",
      createdAt: "2024-01-16",
    },
  ]

  const payments = [
    {
      id: "PAY-001",
      userId: "OH-2024-001",
      userName: "John Doe",
      amount: "৳500",
      method: "bKash",
      status: "Success",
      date: "2024-01-15",
      transactionId: "TXN123456789",
    },
    {
      id: "PAY-002",
      userId: "OH-2024-002",
      userName: "Ahmed Rahman",
      amount: "৳500",
      method: "Nagad",
      status: "Pending",
      date: "2024-01-16",
      transactionId: "TXN123456790",
    },
  ]

  const collectorData =
    [
      {
        id: "DC-001",
        name: "Sarah Collector",
        role: "Data Collector" as const,
        status: "Active" as const,
        phone: "+880 1234-567891",
        email: "sarah@example.com",
        registeredAt: "Jan 2024",
        totalRegistrations: 247,
        publicAccounts: [
          {
            id: "OH-2024-001",
            name: "Ahmed Rahman",
            role: "Parent" as const,
            status: "Paid" as const,
            serviceCode: "SVC-001",
            phone: "+880 1234-567890",
            email: "ahmed@example.com",
            registeredAt: "Jan 15, 2024",
            subAccounts: [
              {
                id: "OH-2024-001-C1",
                name: "Fatima Rahman",
                role: "Child" as const,
                status: "Paid" as const,
                serviceCode: "SVC-001-C1",
                age: 12,
                gender: "Female",
                registeredAt: "Jan 16, 2024",
              },
              {
                id: "OH-2024-001-C2",
                name: "Hassan Rahman",
                role: "Child" as const,
                status: "Waiting" as const,
                serviceCode: "SVC-001-C2",
                age: 8,
                gender: "Male",
                registeredAt: "Jan 17, 2024",
              },
            ],
          },
          {
            id: "OH-2024-003",
            name: "Mohammad Ali",
            role: "Parent" as const,
            status: "Paid" as const,
            serviceCode: "SVC-003",
            phone: "+880 1234-567892",
            email: "mohammad@example.com",
            registeredAt: "Jan 18, 2024",
            subAccounts: [],
          },
        ],
      },
      {
        id: "DC-002",
        name: "John Data Collector",
        role: "Data Collector" as const,
        status: "Active" as const,
        phone: "+880 1234-567893",
        email: "john.dc@example.com",
        registeredAt: "Dec 2023",
        totalRegistrations: 189,
        publicAccounts: [
          {
            id: "OH-2024-002",
            name: "Sarah Khan",
            role: "Parent" as const,
            status: "Waiting" as const,
            serviceCode: "SVC-002",
            phone: "+880 1234-567894",
            registeredAt: "Jan 20, 2024",
            subAccounts: [
              {
                id: "OH-2024-002-C1",
                name: "Ali Khan",
                role: "Child" as const,
                status: "Waiting" as const,
                serviceCode: "SVC-002-C1",
                age: 15,
                gender: "Male",
                registeredAt: "Jan 21, 2024",
              },
            ],
          },
          {
            id: "OH-2024-004",
            name: "Fatima Begum",
            role: "Parent" as const,
            status: "Paid" as const,
            serviceCode: "SVC-004",
            phone: "+880 1234-567895",
            email: "fatima@example.com",
            registeredAt: "Jan 22, 2024",
            subAccounts: [
              {
                id: "OH-2024-004-C1",
                name: "Rashid Begum",
                role: "Child" as const,
                status: "Paid" as const,
                serviceCode: "SVC-004-C1",
                age: 10,
                gender: "Male",
                registeredAt: "Jan 23, 2024",
              },
              {
                id: "OH-2024-004-C2",
                name: "Amina Begum",
                role: "Child" as const,
                status: "Paid" as const,
                serviceCode: "SVC-004-C2",
                age: 7,
                gender: "Female",
                registeredAt: "Jan 24, 2024",
              },
            ],
          },
        ],
      },
    ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role.toLowerCase().includes(roleFilter.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Super Admin
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

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>System Management</CardTitle>
              <CardDescription>Manage users, collectors, and payment records</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="users">All Users</TabsTrigger>
                  <TabsTrigger value="collectors">Collectors</TabsTrigger>
                  <TabsTrigger value="pending">Pending Applications</TabsTrigger>
                  <TabsTrigger value="payments">Payment Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                      >
                        Table View
                      </Button>
                      <Button
                        variant={viewMode === "relationships" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("relationships")}
                      >
                        <TreePine className="h-4 w-4 mr-2" />
                        Family Relationships
                      </Button>
                    </div>
                  </div>

                  {viewMode === "table" ? (
                    <>
                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="public">Public User</SelectItem>
                            <SelectItem value="collector">Data Collector</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Users Table */}
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Payment</TableHead>
                              <TableHead>Registered By</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-gray-800">{user.name}</p>
                                    <p className="text-sm text-gray-600">{user.id}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      user.role === "Data Collector"
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-green-50 text-green-700"
                                    }
                                  >
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm text-gray-800">{user.email}</p>
                                    <p className="text-sm text-gray-600">{user.phone}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={user.status === "Active" ? "default" : "secondary"}
                                    className={
                                      user.status === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }
                                  >
                                    {user.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {user.paymentStatus !== "N/A" && (
                                    <Badge
                                      variant={user.paymentStatus === "Paid" ? "default" : "secondary"}
                                      className={
                                        user.paymentStatus === "Paid"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {user.paymentStatus}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600">{user.registeredBy}</span>
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    /* Family Relationships View */
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Family Relationships</h3>
                        <p className="text-gray-600">
                          View complete hierarchy: Data Collector → Public Account → Sub-Account relationships
                        </p>
                      </div>
                      <FamilyRelationshipView collectors={collectorData} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="collectors" className="space-y-4">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Collector</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Registrations</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users
                          .filter((user) => user.role === "Data Collector")
                          .map((collector) => (
                            <TableRow key={collector.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-gray-800">{collector.name}</p>
                                  <p className="text-sm text-gray-600">{collector.id}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-gray-800">{collector.email}</p>
                                  <p className="text-sm text-gray-600">{collector.phone}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-medium">247 users</span>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">{collector.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                  <PendingCollectorsTable />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-800">{payment.id}</p>
                                <p className="text-sm text-gray-600">{payment.transactionId}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-800">{payment.userName}</p>
                                <p className="text-sm text-gray-600">{payment.userId}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{payment.amount}</span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  payment.method === "bKash"
                                    ? "bg-pink-50 text-pink-700"
                                    : "bg-orange-50 text-orange-700"
                                }
                              >
                                {payment.method}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={payment.status === "Success" ? "default" : "secondary"}
                                className={
                                  payment.status === "Success"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{payment.date}</span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
