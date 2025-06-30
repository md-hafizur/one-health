"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight, Search, Eye, CreditCard, FileText, Users, ArrowUpDown } from "lucide-react"
import { PaymentModal } from "./payment-modal"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  role: "Parent" | "Child"
  status: "Paid" | "Waiting"
  parentAccount?: string
  childCount?: number
  serviceCode: string
  phone?: string
  email?: string
  children?: User[]
}

export function RegisteredUsersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Mock data with parent-child relationships
  const users: User[] = [
    {
      id: "OH-2024-001",
      name: "Ahmed Rahman",
      role: "Parent",
      status: "Paid",
      childCount: 2,
      serviceCode: "SVC-001",
      phone: "+880 1234-567890",
      email: "ahmed@example.com",
      children: [
        {
          id: "OH-2024-001-C1",
          name: "Fatima Rahman",
          role: "Child",
          status: "Paid",
          parentAccount: "OH-2024-001",
          serviceCode: "SVC-001-C1",
        },
        {
          id: "OH-2024-001-C2",
          name: "Hassan Rahman",
          role: "Child",
          status: "Waiting",
          parentAccount: "OH-2024-001",
          serviceCode: "SVC-001-C2",
        },
      ],
    },
    {
      id: "OH-2024-002",
      name: "Sarah Khan",
      role: "Parent",
      status: "Waiting",
      childCount: 1,
      serviceCode: "SVC-002",
      phone: "+880 1234-567891",
      children: [
        {
          id: "OH-2024-002-C1",
          name: "Ali Khan",
          role: "Child",
          status: "Waiting",
          parentAccount: "OH-2024-002",
          serviceCode: "SVC-002-C1",
        },
      ],
    },
    {
      id: "OH-2024-003",
      name: "Mohammad Ali",
      role: "Parent",
      status: "Paid",
      childCount: 0,
      serviceCode: "SVC-003",
      phone: "+880 1234-567892",
      email: "mohammad@example.com",
      children: [],
    },
  ]

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const toggleRowExpansion = (userId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedRows(newExpanded)
  }

  const handlePayNow = (user: User) => {
    setSelectedUser(user)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedUser(null)
    toast.success("Payment successful! Digital card will be issued.")
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.serviceCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesRole
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy as keyof User] as string
    let bValue = b[sortBy as keyof User] as string

    if (sortBy === "childCount") {
      aValue = (a.childCount || 0).toString()
      bValue = (b.childCount || 0).toString()
    }

    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  const totalPages = Math.ceil(sortedUsers.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + recordsPerPage)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Registered Users
          </CardTitle>
          <CardDescription>Manage registered users and their payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, or service code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
              </SelectContent>
            </Select>
            <Select value={recordsPerPage.toString()} onValueChange={(value) => setRecordsPerPage(Number(value))}>
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("role")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Role
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("status")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Parent Account</TableHead>
                  <TableHead>Child Count</TableHead>
                  <TableHead>Service Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    {/* Parent Row */}
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        {user.role === "Parent" && user.childCount! > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(user.id)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows.has(user.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
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
                            user.role === "Parent" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "Paid" ? "default" : "secondary"}
                          className={
                            user.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.parentAccount ? (
                          <span className="text-sm text-gray-600">{user.parentAccount}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role === "Parent" ? (
                          <Badge variant="outline" className="bg-gray-50">
                            {user.childCount}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{user.serviceCode}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.status === "Waiting" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayNow(user)}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                          {user.status === "Paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Card Issued
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Child Rows (Expandable) */}
                    {user.role === "Parent" &&
                      expandedRows.has(user.id) &&
                      user.children?.map((child) => (
                        <TableRow key={child.id} className="bg-blue-50/30 border-l-4 border-l-blue-200">
                          <TableCell></TableCell>
                          <TableCell className="pl-8">
                            <div>
                              <p className="font-medium text-gray-800">{child.name}</p>
                              <p className="text-sm text-gray-600">{child.id}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              {child.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={child.status === "Paid" ? "default" : "secondary"}
                              className={
                                child.status === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {child.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{child.parentAccount}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-400">-</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{child.serviceCode}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {child.status === "Waiting" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePayNow(child)}
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay Now
                                </Button>
                              )}
                              {child.status === "Paid" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Card Issued
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, sortedUsers.length)} of{" "}
              {sortedUsers.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedUser && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          amount={500}
          onSuccess={handlePaymentSuccess}
          userInfo={{
            name: selectedUser.name,
            id: selectedUser.id,
            serviceCode: selectedUser.serviceCode,
          }}
        />
      )}
    </>
  )
}
