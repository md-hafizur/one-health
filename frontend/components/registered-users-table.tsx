"use client"

import React from "react"
import { useState, useEffect } from "react"
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
  name: string // Derived from first_name and last_name
  role: "Parent" | "Child"
  verificationStatus: "verified" | "unverified"
  paymentStatus: "Paid" | "Waiting"
  active: boolean // Derived: if verificationStatus is 'verified' and paymentStatus is 'Paid'
  parentAccount?: string // Corresponds to parent_id
  childCount?: number // Corresponds to children_count
  serviceCode: string // Corresponds to service_code
  phone?: string
  email?: string
  // Raw fields from API
  first_name?: string
  last_name?: string
  is_parent?: boolean // This might be redundant if parent_id is used for role derivation
  parent_id?: string
  children_count?: number
  is_email_verified?: boolean // Assuming API provides this
  is_phone_verified?: boolean // Assuming API provides this
  children?: User[] // Added for nested children
}

export function RegisteredUsersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [verificationStatusFilter, setVerificationStatusFilter] = useState("all")
  
  const [sortBy, setSortBy] = useState("first_name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(5)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async (page: number, pageSize: number, search: string, paymentStatus: string, verificationStatus: string, sort: string, order: "asc" | "desc") => {
      setLoading(true)
      setError(null)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        let url = `${apiUrl}/accounts/user-details?page=${page}&page_size=${pageSize}`

        if (search) {
          url += `&search=${search}`
        }
        if (paymentStatus !== "all") {
          url += `&payment_status=${paymentStatus}`
        }
        if (verificationStatus !== "all") {
          url += `&verification_status=${verificationStatus}`
        }
        
        if (sort) {
          url += `&ordering=${order === "desc" ? "-" : ""}${sort}`
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const rawData = await response.json()
        const transformedData: User[] = rawData.results.map((item: any) => {
          const isEmailVerified = item.email_verified || false;
          const isPhoneVerified = item.phone_verified || false;
          const verificationStatus = (isEmailVerified || isPhoneVerified) ? "verified" : "unverified";
          const paymentStatus = item.payment_status === "Paid" ? "Paid" : "Waiting";
          const active = verificationStatus === "verified" && paymentStatus === "Paid";

          const user: User = {
            id: String(item.id),
            name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
            role: item.parent !== null ? "Child" : "Parent",
            verificationStatus: verificationStatus,
            paymentStatus: paymentStatus,
            active: active,
            parentAccount: item.parent !== null ? String(item.parent) : undefined,
            childCount: item.childCount,
            serviceCode: item.service_code || "N/A", // Assuming service_code from API, default to N/A
            phone: item.phone,
            email: item.email,
            first_name: item.first_name,
            last_name: item.last_name,
            is_parent: item.parent === null,
            parent_id: item.parent !== null ? String(item.parent) : undefined,
            children_count: item.childCount,
            is_email_verified: isEmailVerified,
            is_phone_verified: isPhoneVerified,
          };

          if (item.children && item.children.length > 0) {
            user.children = item.children.map((childItem: any) => {
              const childIsEmailVerified = childItem.email_verified || false;
              const childIsPhoneVerified = childItem.phone_verified || false;
              const childVerificationStatus = (childIsEmailVerified || childIsPhoneVerified) ? "verified" : "unverified";
              const childPaymentStatus = childItem.payment_status === "Paid" ? "Paid" : "Waiting";
              const childActive = childVerificationStatus === "verified" && childPaymentStatus === "Paid";

              return {
                id: String(childItem.id),
                name: `${childItem.first_name || ''} ${childItem.last_name || ''}`.trim(),
                role: "Child",
                verificationStatus: childVerificationStatus,
                paymentStatus: childPaymentStatus,
                active: childActive,
                parentAccount: childItem.parent !== null ? String(childItem.parent) : undefined,
                childCount: childItem.childCount,
                serviceCode: childItem.service_code || "N/A",
                phone: childItem.phone,
                email: childItem.email,
                first_name: childItem.first_name,
                last_name: childItem.last_name,
                is_parent: childItem.parent === null,
                parent_id: childItem.parent !== null ? String(childItem.parent) : undefined,
                children_count: childItem.childCount,
                is_email_verified: childIsEmailVerified,
                is_phone_verified: childIsPhoneVerified,
              };
            });
          }
          return user;
        });
        setUsers(transformedData)
        setTotalUsers(rawData.count)
        setNextPageUrl(rawData.next)
        setPreviousPageUrl(rawData.previous)
      } catch (e: any) {
        setError(e.message)
        toast.error(`Failed to fetch users: ${e.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers(currentPage, recordsPerPage, searchTerm, paymentStatusFilter, verificationStatusFilter, sortBy, sortOrder)
  }, [currentPage, recordsPerPage, searchTerm, paymentStatusFilter, verificationStatusFilter, sortBy, sortOrder])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
    setCurrentPage(1); // Reset to first page on sort change
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

  const totalPages = Math.ceil(totalUsers / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage

  return (
    <>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
              />
            </div>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationStatusFilter} onValueChange={setVerificationStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={recordsPerPage.toString()} onValueChange={(value) => setRecordsPerPage(Number(value))}>
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading && <p className="text-center py-8">Loading users...</p>}
          {error && <p className="text-center py-8 text-red-500">Error: {error}</p>}
          {!loading && !error && users.length === 0 && (
            <p className="text-center py-8">No registered users found.</p>
          )}
          {!loading && !error && users.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("first_name")}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("payment_status")}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Payment Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("verification_status")}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Verification Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parent Account</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Child Count</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Code</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <React.Fragment key={user.id}>
                      {/* Parent Row */}
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          {user.is_parent && user.children && user.children.length > 0 && (
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
                            <p className="font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-gray-600">{user.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.is_parent ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                            }
                          >
                            {user.is_parent ? "Parent" : "Child"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.paymentStatus === "Paid" ? "default" : "secondary"}
                            className={
                              user.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {user.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.verificationStatus === "verified" ? "default" : "destructive"}
                            className={
                              user.verificationStatus === "verified" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {user.verificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.parent_id ? (
                            <span className="text-sm text-gray-600">{user.parent_id}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_parent ? (
                            <Badge variant="outline" className="bg-gray-50">
                              {user.children?.length || 0}
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
                            {user.verificationStatus === "unverified" && user.paymentStatus === "Waiting" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!user.email && !user.phone}
                                  onClick={() => toast.info(`Verification link sent to ${user.email || user.phone}`)}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Verify {user.email ? "Email" : "Phone"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePayNow(user)}
                                  disabled={true} // Disabled until verification is complete
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay Now
                                </Button>
                              </>
                            )}
                            {user.verificationStatus === "verified" && user.paymentStatus === "Waiting" && (
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
                            {user.verificationStatus === "verified" && user.paymentStatus === "Paid" && (
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
                      {user.is_parent &&
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
                                variant={child.paymentStatus === "Paid" ? "default" : "secondary"}
                                className={
                                  child.paymentStatus === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {child.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={child.verificationStatus === "verified" ? "default" : "destructive"}
                                className={
                                  child.verificationStatus === "verified"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {child.verificationStatus}
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
                                {child.verificationStatus === "unverified" && child.paymentStatus === "Waiting" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={!child.email && !child.phone}
                                      onClick={() => toast.info(`Verification link sent to ${child.email || child.phone}`)}
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      Verify {child.email ? "Email" : "Phone"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePayNow(child)}
                                      disabled={true} // Disabled until verification is complete
                                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                    >
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Pay Now
                                    </Button>
                                  </>
                                )}
                                {child.verificationStatus === "verified" && child.paymentStatus === "Waiting" && (
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
                                {child.verificationStatus === "verified" && child.paymentStatus === "Paid" && (
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
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, totalUsers)} of{" "}
              {totalUsers} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!previousPageUrl}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!nextPageUrl}
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
            name: `${selectedUser.first_name} ${selectedUser.last_name}`.trim(),
            id: selectedUser.id,
            serviceCode: selectedUser.serviceCode,
          }}
        />
      )}
    </>
  )
}
