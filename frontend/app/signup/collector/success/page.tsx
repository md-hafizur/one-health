"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Clock, Search, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function CollectorSuccessPage() {
  const [applicationId, setApplicationId] = useState("")
  const [applicationStatus, setApplicationStatus] = useState<"not-found" | "pending" | "approved" | "rejected" | null>(
    null,
  )

  // Mock application data
  const mockApplications = {
    "APP-001234": {
      id: "APP-001234",
      name: "John Collector",
      email: "john.collector@example.com",
      phone: "+880 1234-567890",
      status: "pending" as const,
      submittedAt: "2024-01-25",
      paidAt: "2024-01-25",
      amount: "৳1000",
      reviewedAt: null,
    },
    "APP-001235": {
      id: "APP-001235",
      name: "Sarah Data Collector",
      email: "sarah.dc@example.com",
      phone: "+880 1234-567891",
      status: "approved" as const,
      submittedAt: "2024-01-20",
      paidAt: "2024-01-20",
      amount: "৳1000",
      reviewedAt: "2024-01-22",
      credentials: {
        username: "sarah_dc_001",
        password: "temp123456",
        collectorId: "DC-001235",
      },
    },
    "APP-001236": {
      id: "APP-001236",
      name: "Ahmed Rejected",
      email: "ahmed.rejected@example.com",
      phone: "+880 1234-567892",
      status: "rejected" as const,
      submittedAt: "2024-01-18",
      paidAt: "2024-01-18",
      amount: "৳1000",
      reviewedAt: "2024-01-21",
      rejectionReason: "Incomplete documentation provided",
      refundStatus: "processed",
    },
  }

  const handleCheckStatus = () => {
    const app = mockApplications[applicationId as keyof typeof mockApplications]
    if (app) {
      setApplicationStatus(app.status)
    } else {
      setApplicationStatus("not-found")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const currentApp = applicationId ? mockApplications[applicationId as keyof typeof mockApplications] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/login" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Login
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Application Status</h1>
              <p className="text-gray-600">Check your data collector application status</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Status Check Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-6 w-6 text-blue-600" />
                  Check Application Status
                </CardTitle>
                <CardDescription>
                  Enter your application ID to check the current status of your data collector application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="applicationId">Application ID</Label>
                    <Input
                      id="applicationId"
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                      placeholder="Enter your application ID (e.g., APP-001234)"
                      className="font-mono"
                    />
                  </div>
                  <Button onClick={handleCheckStatus} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>

                {/* Demo IDs */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Demo Application IDs:</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <code className="bg-white px-2 py-1 rounded">APP-001234</code> - Pending Review
                    </p>
                    <p>
                      <code className="bg-white px-2 py-1 rounded">APP-001235</code> - Approved
                    </p>
                    <p>
                      <code className="bg-white px-2 py-1 rounded">APP-001236</code> - Rejected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Results */}
          {applicationStatus === "not-found" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Application Not Found</h3>
                  <p className="text-gray-600">
                    No application found with the provided ID. Please check your application ID and try again.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {applicationStatus === "pending" && currentApp && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Application Under Review</h3>
                    <Badge variant="outline" className={getStatusColor(currentApp.status)}>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Application Details</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Application ID</p>
                        <p className="font-mono font-medium">{currentApp.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Applicant Name</p>
                        <p className="font-medium">{currentApp.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Submitted Date</p>
                        <p className="font-medium">{currentApp.submittedAt}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Payment Status</p>
                        <p className="font-medium text-green-600">Paid {currentApp.amount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Next Steps</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Your application is currently under admin review</li>
                      <li>• Review process typically takes 2-3 business days</li>
                      <li>• You will receive an email notification once reviewed</li>
                      <li>• Check back here for status updates</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {applicationStatus === "approved" && currentApp && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Application Approved!</h3>
                    <Badge variant="outline" className={getStatusColor(currentApp.status)}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-green-800 mb-4">🎉 Congratulations!</h4>
                    <p className="text-green-700 mb-4">
                      Your data collector application has been approved. You can now login and start registering users.
                    </p>

                    {currentApp.credentials && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h5 className="font-semibold text-gray-800 mb-3">Your Login Credentials:</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Username:</span>
                            <span className="font-mono font-medium">{currentApp.credentials.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Password:</span>
                            <span className="font-mono font-medium">{currentApp.credentials.password}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Collector ID:</span>
                            <span className="font-mono font-medium">{currentApp.credentials.collectorId}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">📧 Email Notification Sent</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Login credentials sent to: {currentApp.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        SMS confirmation sent to: {currentApp.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link href="/login" className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">Login Now</Button>
                    </Link>
                    <Link href="/collector/training" className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        View Training Materials
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {applicationStatus === "rejected" && currentApp && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Application Rejected</h3>
                    <Badge variant="outline" className={getStatusColor(currentApp.status)}>
                      Rejected
                    </Badge>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-red-800 mb-2">Rejection Reason</h4>
                    <p className="text-red-700">{currentApp.rejectionReason}</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">💰 Refund Processed</h4>
                    <p className="text-green-700 text-sm">
                      Your registration fee of {currentApp.amount} has been refunded to your original payment method.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Link href="/signup/collector" className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Apply Again</Button>
                    </Link>
                    <Link href="/contact" className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
