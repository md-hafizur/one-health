"use client"

import { useState, useEffect } from "react"
// import react from "react"
import React from "react"
import { toast } from "sonner"
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { selectAuth, setLogout } from "@/lib/redux/authSlice"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"






import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Shield, Users, CreditCard, Search, LogOut, Eye, MoreHorizontal, LucideIcon, FileText } from "lucide-react"


const iconMap: { [key: string]: LucideIcon } = {
  "Total Users": Users,
  "Data Collectors": Shield,
  "Total Revenue": CreditCard,
};

const colorMap: { [key: string]: string } = {
  "Total Users": "text-blue-600",
  "Data Collectors": "text-green-600",
  "Total Revenue": "text-purple-600",
};
import Link from "next/link"
// import { FamilyRelationshipView } from "@/components/family-relationship-view"
import { PaymentLogsTable } from "@/components/payment-logs-table"
import { PendingCollectorsTable } from "@/components/collectors-applications-table"
import { PaymentModal } from "@/components/payment-modal"
import { OtpVerificationModal } from "@/components/otp-verification-modal"
import { getCookie } from "@/lib/utils/csrf"
import { LoadingScreen } from "@/app/LoadingScreen"

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [verificationStatusFilter, setVerificationStatusFilter] = useState("all")
  const [viewMode] = useState<"table" | "relationships">("table")
  const [systemStats, setSystemStats] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [collectors, setCollectors] = useState<any[]>([])
  const [pendingApplications, setPendingApplications] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10); // You can adjust this value
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [verifyingUser, setVerifyingUser] = useState<any | null>(null)
  const [familyData, setFamilyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true) // Add loading state
  const [collectorsLoading, setCollectorsLoading] = useState(true) // Add loading state for collectors
  const [pendingApplicationsLoading, setPendingApplicationsLoading] = useState(true) // Add loading state for pending applications
  const router = useRouter()
  const authData = useSelector(selectAuth)
  const dispatch = useDispatch()

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await getCurrentBrowserFingerPrint()
      setVisitorId(fp)
    }
    getFingerprint()
  }, [])

  useEffect(() => {
    if (!authData.isAuthenticated || authData.userRole !== "admin") {
      router.push("/login");
    }
  }, [authData.isAuthenticated, authData.userRole, router]);

  useEffect(() => {
    const fetchSystemStats = async () => {
      if (!visitorId) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/data/system-statistics`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Visitor-ID": visitorId,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          setSystemStats(result.data);
        } else {
          console.warn("API response for system statistics did not contain expected 'data' array or was malformed:", result);
          setSystemStats([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch system statistics:", error);
        toast.error(`Failed to fetch system statistics: ${error.message}`);
      }
    };

    if (visitorId) {
        fetchSystemStats();
      }
    }, [visitorId]);
    
    useEffect(() => {
    const fetchUsers = async () => {
      if (!visitorId) return;
      setLoading(true); // Set loading to true
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        let url = `${apiUrl}/data/user-table?page=${currentPage}&page_size=${pageSize}`;

        if (searchTerm) {
          url += `&term=${searchTerm}`;
        }

        if (roleFilter !== "all") {
          let roleValue = '';
          if (roleFilter === "public") {
            roleValue = 'public';
          } else if (roleFilter === "collector") {
            roleValue = 'dataCollector';
          } else if (roleFilter === "subUser") {
            roleValue = 'subUser';
          }
          url += `&roleName=${roleValue}`;
        }

        if (paymentStatusFilter !== "all") {
          url += `&status=${paymentStatusFilter}`;
        }

        if (verificationStatusFilter !== "all") {
          url += `&status=${verificationStatusFilter}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Visitor-ID": visitorId,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.results && Array.isArray(result.results)) {
          setUsers(result.results);
          setTotalPages(Math.ceil(result.count / pageSize));
        } else {
          console.warn("API response for user table did not contain expected 'results' array or was malformed:", result);
          setUsers([]);
          setTotalPages(1);
        }
      } catch (error: any) {
        console.error("Failed to fetch user table:", error);
        toast.error(`Failed to fetch user table: ${error.message}`);
      } finally {
        setLoading(false); // Set loading to false in finally block
      }
    };

    if (visitorId) {
      fetchUsers();
    }
  }, [visitorId, currentPage, pageSize, searchTerm, roleFilter, paymentStatusFilter, verificationStatusFilter]);

  useEffect(() => {
    const fetchFamilyData = async () => {
      if (!visitorId) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/data/family-relationship`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Visitor-ID": visitorId,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const transformedData = result.map((item: any) => ({
          id: item.collector.id,
          name: item.collector.name,
          role: "Data Collector", // Assuming this is always "Data Collector"
          status: item.collector.is_active ? "Active" : "Inactive", // Map is_active to status
          phone: item.collector.phone,
          email: item.collector.email,
          registeredAt: new Date(item.collector.date_joined).toLocaleDateString(), // Format date
          totalRegistrations: item.collector.childCount, // Assuming childCount is totalRegistrations
          publicAccounts: item.public_users.map((pu: any) => ({
            id: pu.public_user.id,
            name: pu.public_user.name,
            role: "Parent", // Assuming this is always "Parent"
            status: pu.public_user.payment_status, // Use payment_status directly
            serviceCode: "N/A", // Assuming no service_code for public_user in API
            phone: pu.public_user.phone,
            email: pu.public_user.email,
            registeredAt: new Date(pu.public_user.date_joined).toLocaleDateString(), // Format date
            subAccounts: pu.sub_accounts.map((sa: any) => ({
              id: sa.id,
              name: sa.name,
              role: "Child", // Assuming this is always "Child"
              status: sa.payment_status, // Use payment_status directly
              serviceCode: "N/A", // Assuming no service_code for sub_account in API
              age: undefined, // No age in API response
              gender: undefined, // No gender in API response
              registeredAt: new Date(sa.date_joined).toLocaleDateString(), // Format date
            })),
          })),
        }));
        setFamilyData(transformedData);
      } catch (error: any) {
        console.error("Failed to fetch family relationship:", error);
        toast.error(`Failed to fetch family relationship: ${error.message}`);
      }
    };

    if (visitorId) {
      fetchFamilyData();
    }
  }, [visitorId]);

  useEffect(() => {
    const fetchCollectors = async () => {
      if (!visitorId) return;
      setCollectorsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/data/collector-table`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Visitor-ID": visitorId,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.results && Array.isArray(result.results)) {
          setCollectors(result.results);
        } else {
          console.warn("API response for collector table did not contain expected 'results' array or was malformed:", result);
          setCollectors([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch collector table:", error);
        toast.error(`Failed to fetch collector table: ${error.message}`);
      } finally {
        setCollectorsLoading(false);
      }
    };

    if (visitorId) {
      fetchCollectors();
    }
  }, [visitorId]);

  useEffect(() => {
    const fetchPendingApplications = async () => {
      if (!visitorId) return;
      setPendingApplicationsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/data/pending-application-table`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Visitor-ID": visitorId,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (Array.isArray(result)) {
          setPendingApplications(result);
        } else {
          console.warn("API response for pending applications did not contain expected array or was malformed:", result);
          setPendingApplications([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch pending applications:", error);
        toast.error(`Failed to fetch pending applications: ${error.message}`);
      } finally {
        setPendingApplicationsLoading(false);
      }
    };

    if (visitorId) {
      fetchPendingApplications();
    }
  }, [visitorId]);

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      dispatch(setLogout());
      router.push("/login");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  const handlePayNow = (user: any) => {
    setSelectedUser(user)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedUser(null)
    toast.success("Payment successful! Digital card will be issued.")
  }

  const handleVerifyClick = async (user: any) => {
    setVerifyingUser(user)

    let contact = user.email || user.phone
    let contactType = user.email ? "email" : "phone"
    const userIdForApi = user.id

    if (!contact) {
      toast.error("No contact information available for verification.")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const csrfToken = getCookie("csrftoken")
      const payload: any = {
        user_id: userIdForApi,
        contact: contact,
        contact_type: contactType,
      }

      const response = await fetch(`${apiUrl}/accounts/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      toast.success(data.detail || `OTP sent to ${contact}`)
      setShowOtpModal(true)
    } catch (e: any) {
      toast.error(`Failed to send OTP: ${e.message}`)
    }
  }

  const handleOtpVerify = async (otp: string) => {
    if (!verifyingUser) return

    let contact = verifyingUser.email || verifyingUser.phone
    let contactType = verifyingUser.email ? "email" : "phone"
    const userIdForApi = verifyingUser.id

    if (!contact) {
      toast.error("No contact information available for this user.")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const csrfToken = getCookie("csrftoken")
      const payload: any = {
        user_id: userIdForApi,
        contact: contact,
        contact_type: contactType,
        otp: otp,
      }

      const response = await fetch(`${apiUrl}/accounts/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      toast.success(data.detail || "User verified successfully!")

      // Update user state
      const newUsers = users.map((u) => {
        if (u.id === verifyingUser.id) {
          return { ...u, email_verified: true, phone_verified: true }
        }
        return u
      })
      setUsers(newUsers)

      setShowOtpModal(false)
      setVerifyingUser(null)
    } catch (e: any) {
      toast.error(`Verification failed: ${e.message}`)
    }
  }

  const handleOtpResend = async () => {
    if (!verifyingUser) return

    let contact = verifyingUser.email || verifyingUser.phone
    let contactType = verifyingUser.email ? "email" : "phone"
    const userIdForApi = verifyingUser.id

    if (!contact) {
      toast.error("No contact information available for this user.")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const csrfToken = getCookie("csrftoken")
      const payload: any = {
        user_id: userIdForApi,
        contact: contact,
        contact_type: contactType,
      }

      const response = await fetch(`${apiUrl}/accounts/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      toast.success(data.detail || `OTP resent to ${contact}`)
    } catch (e: any) {
      toast.error(`Failed to resend OTP: ${e.message}`)
    }
  };

  const stats = systemStats

  

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
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
              <Link href="#" onClick={handleLogout}>
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
                      {stat.change && typeof stat.change === 'string' && (
                        <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {stat.change} from last month
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 ${colorMap[stat.title]}`}>
                      {iconMap[stat.title] && React.createElement(iconMap[stat.title], { className: "h-6 w-6" })}
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
                  <TabsTrigger value="pending">Collector Applications</TabsTrigger>
                  <TabsTrigger value="payments">Payment Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                  

                  {viewMode === "table" ? (
                    <>
                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value)
                              setCurrentPage(1)
                            }}
                            className="pl-10"
                          />
                        </div>
                        <Select
                          value={roleFilter}
                          onValueChange={(value) => {
                            setRoleFilter(value)
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="public">Public User</SelectItem>
                            <SelectItem value="collector">Data Collector</SelectItem>
                            <SelectItem value="subUser">Sub User</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={paymentStatusFilter}
                          onValueChange={(value) => {
                            setPaymentStatusFilter(value)
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by Payment Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Payment Status</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={verificationStatusFilter}
                          onValueChange={(value) => {
                            setVerificationStatusFilter(value)
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by Verification Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Verification Status</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                          </SelectContent>
                        </Select>
                        </div>

                      {/* Users Table */}
                      {loading ? (
                        <LoadingScreen />
                      ) : (
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>AuthVerify</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Initiator</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUsers.map((user) => {
                                const isUserActive = user.roleName === 'dataCollector' 
                                    ? user.approved 
                                    : (user.email_verified || user.phone_verified) && user.payment_status === 'Paid';

                                return (
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
                                      user.roleName === "dataCollector"
                                        ? "bg-blue-50 text-blue-700"
                                        : user.roleName === "public"
                                        ? "bg-green-50 text-green-700"
                                        : user.roleName === "subUser"
                                        ? "bg-yellow-50 text-yellow-700"
                                        : "bg-purple-50 text-purple-700"
                                    }
                                  >
                                    {user.roleName}
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
                                      variant={isUserActive ? "default" : "secondary"}
                                      className={
                                        isUserActive
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {isUserActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={(user.email_verified || user.phone_verified) ? "default" : "secondary"}
                                      className={
                                        (user.email_verified || user.phone_verified)
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {(user.email_verified || user.phone_verified) ? 'Verified' : 'Unverified'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {user.payment_status !== "N/A" && (
                                      <Badge
                                        variant={user.payment_status === "Paid" ? "default" : "secondary"}
                                        className={
                                          user.payment_status === "Paid"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }
                                      >
                                        {user.payment_status}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-600">{user.addBy}</span>
                                  </TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                          <span className="sr-only">Open menu</span>
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => console.log("View user details")}>
                                          <Eye className="h-4 w-4 mr-2" /> View Details
                                        </DropdownMenuItem>
                                        {(!user.email_verified && !user.phone_verified) && user.payment_status === "Pending" && (
                                          <DropdownMenuItem
                                            onClick={() => handleVerifyClick(user)}
                                            disabled={!user.email && !user.phone}
                                          >
                                            <FileText className="h-4 w-4 mr-2" /> Verify {user.email ? "Email" : "Phone"}
                                          </DropdownMenuItem>
                                        )}
                                        {(user.email_verified || user.phone_verified) && user.payment_status === "Pending" && (
                                          <DropdownMenuItem onClick={() => handlePayNow(user)}>
                                            <CreditCard className="h-4 w-4 mr-2" /> Pay Now
                                          </DropdownMenuItem>
                                        )}
                                        {(user.email_verified || user.phone_verified) && user.payment_status === "Paid" && (
                                          <DropdownMenuItem>
                                            <FileText className="h-4 w-4 mr-2" /> Card Issued
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Pagination Controls */}
                      <div className="flex items-center justify-between space-x-2 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
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
                      {/* <FamilyRelationshipView collectors={familyData} /> */}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="collectors" className="space-y-4">
                  {collectorsLoading ? (
                    <LoadingScreen />
                  ) : (
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
                          {collectors.map((collector) => (
                              <TableRow key={collector.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-gray-800">{collector.name}</p>
                                    <p className="text-sm text-gray-600">{collector.id}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm text-gray-800">{collector.contact}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium">{collector.total_registration} users</span>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800">{collector.payment_status}</Badge>
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
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                  <PendingCollectorsTable />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <PaymentLogsTable />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
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
            serviceCode: selectedUser.service_code,
          }}
        />
      )}

      {/* OTP Verification Modal */}
      {verifyingUser && (
        <OtpVerificationModal
          open={showOtpModal}
          onOpenChange={setShowOtpModal}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          contact={verifyingUser.email || verifyingUser.phone || ""}
        />
      )}
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
            serviceCode: selectedUser.service_code,
          }}
        />
      )}

      {/* OTP Verification Modal */}
      {verifyingUser && (
        <OtpVerificationModal
          open={showOtpModal}
          onOpenChange={setShowOtpModal}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          contact={verifyingUser.email || verifyingUser.phone || ""}
        />
      )}
    </div>
  )
}
