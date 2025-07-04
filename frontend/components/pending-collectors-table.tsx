"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Eye, Check, X, Clock, UserCheck } from "lucide-react"
import { toast } from "sonner"

interface PendingCollector {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  district: string
  upazila: string
  nidNumber: string
  experience: string
  appliedAt: string
  status: "Pending" | "Approved" | "Rejected"
  paymentStatus: "Paid" | "Pending" | "Failed"
  paidAmount?: number
  paidAt?: string
}

export function PendingCollectorsTable() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data for pending collectors
  const pendingCollectors: PendingCollector[] = [
    {
      id: "APP-001234",
      firstName: "Mohammad",
      lastName: "Hassan",
      email: "mohammad.hassan@example.com",
      phone: "+880 1234-567890",
      district: "Dhaka",
      upazila: "Dhanmondi",
      nidNumber: "1234567890123",
      experience: "5 years experience in healthcare data management and community outreach programs.",
      appliedAt: "2024-01-20",
      status: "Pending",
      paymentStatus: "Paid",
      paidAmount: 1000,
      paidAt: "2024-01-20",
    },
    {
      id: "APP-001235",
      firstName: "Fatima",
      lastName: "Rahman",
      email: "fatima.rahman@example.com",
      phone: "+880 1234-567891",
      district: "Chittagong",
      upazila: "Kotwali",
      nidNumber: "1234567890124",
      experience: "3 years experience in NGO work and data collection for health surveys.",
      appliedAt: "2024-01-19",
      status: "Pending",
      paymentStatus: "Paid",
      paidAmount: 1000,
      paidAt: "2024-01-19",
    },
    {
      id: "APP-001236",
      firstName: "Ahmed",
      lastName: "Ali",
      email: "ahmed.ali@example.com",
      phone: "+880 1234-567892",
      district: "Sylhet",
      upazila: "Sylhet Sadar",
      nidNumber: "1234567890125",
      experience: "Fresh graduate with internship experience in health data management.",
      appliedAt: "2024-01-18",
      status: "Approved",
      paymentStatus: "Paid",
      paidAmount: 1000,
      paidAt: "2024-01-18",
    },
  ]

  const handleApprove = (collector: PendingCollector) => {
    toast.success(`${collector.firstName} ${collector.lastName} has been approved as a data collector!`)
    // Here you would typically update the database
  }

  const handleReject = (collector: PendingCollector) => {
    toast.error(`${collector.firstName} ${collector.lastName}'s application has been rejected.`)
    // Here you would typically update the database
  }

  const filteredCollectors = pendingCollectors.filter(
    (collector) =>
      collector.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-blue-600" />
          Pending Collector Applications
        </CardTitle>
        <CardDescription>Review and approve data collector applications</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollectors.map((collector) => (
                <TableRow key={collector.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {getInitials(collector.firstName, collector.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-800">
                          {collector.firstName} {collector.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{collector.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-800">{collector.email}</p>
                      <p className="text-sm text-gray-600">{collector.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-800">{collector.district}</p>
                      <p className="text-sm text-gray-600">{collector.upazila}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={collector.experience}>
                        {collector.experience}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{collector.appliedAt}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(collector.status)}>
                      {collector.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                      {collector.status === "Approved" && <Check className="h-3 w-3 mr-1" />}
                      {collector.status === "Rejected" && <X className="h-3 w-3 mr-1" />}
                      {collector.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge
                        variant="outline"
                        className={
                          collector.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-800"
                            : collector.paymentStatus === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {collector.paymentStatus}
                      </Badge>
                      {collector.paidAmount && <p className="text-xs text-gray-500 mt-1">৳{collector.paidAmount}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {collector.status === "Pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(collector)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(collector)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCollectors.filter((c) => c.status === "Pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {pendingCollectors.filter((c) => c.status === "Approved").length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {pendingCollectors.filter((c) => c.status === "Rejected").length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
