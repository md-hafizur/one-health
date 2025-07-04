"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { PaymentModal } from "@/components/payment-modal"
import { toast } from "sonner"

export default function CollectorPaymentPage() {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const applicationId = searchParams.get("application") || "APP-000000"

  // Mock application data - in real app, fetch from API
  const applicationData = {
    id: applicationId,
    name: "John Collector",
    email: "john.collector@example.com",
    phone: "+880 1234-567890",
    registrationFee: 1000, // ৳1000 for data collector account
    submittedAt: "2024-01-25",
  }

  const handlePayNow = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setPaymentStatus("success")
    toast.success("Payment successful! Your application is now under review.")

    // Redirect to success page after 3 seconds
    setTimeout(() => {
      router.push("/signup/collector/success")
    }, 3000)
  }

  const handlePaymentFailed = () => {
    setPaymentStatus("failed")
    toast.error("Payment failed. Please try again.")
  }

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
              <h1 className="text-2xl font-bold text-gray-800">Complete Payment</h1>
              <p className="text-gray-600">Pay registration fee to activate your data collector account</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {paymentStatus === "pending" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    Registration Fee Payment
                  </CardTitle>
                  <CardDescription>
                    Complete your payment to proceed with the data collector application review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Application Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Application Summary</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Application ID</p>
                          <p className="font-mono font-medium">{applicationData.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Applicant Name</p>
                          <p className="font-medium">{applicationData.name}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="font-medium">
                            {applicationData.phone ? applicationData.phone : applicationData.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Submitted</p>
                          <p className="font-medium">{applicationData.submittedAt}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Fee Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Data Collector Registration Fee</span>
                        <span className="font-medium">৳{applicationData.registrationFee}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Processing Fee</span>
                        <span className="font-medium">৳0</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="font-semibold text-gray-800">Total Amount</span>
                        <span className="text-2xl font-bold text-blue-600">৳{applicationData.registrationFee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Process Info */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">Important Information</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Payment is required to proceed with application review</li>
                          <li>• Your application will be reviewed within 2-3 business days after payment</li>
                          <li>• Refunds are available if application is rejected by admin</li>
                          <li>• You will receive login credentials via email once approved</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <div className="text-center">
                    <Button onClick={handlePayNow} size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pay ৳{applicationData.registrationFee} Now
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">Secure payment via bKash or Nagad</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {paymentStatus === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card>
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your registration fee has been paid successfully. Your application is now under admin review.
                  </p>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">What happens next?</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-600 text-white mt-1">1</Badge>
                        <div>
                          <p className="font-medium text-gray-800">Payment Confirmation</p>
                          <p className="text-sm text-gray-600">Payment receipt sent to your email</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-600 text-white mt-1">2</Badge>
                        <div>
                          <p className="font-medium text-gray-800">Admin Review</p>
                          <p className="text-sm text-gray-600">
                            Your application will be reviewed within 2-3 business days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-600 text-white mt-1">3</Badge>
                        <div>
                          <p className="font-medium text-gray-800">Account Activation</p>
                          <p className="text-sm text-gray-600">
                            If approved, you'll receive login credentials via email
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">Redirecting to success page in 3 seconds...</p>

                  <div className="flex gap-4">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        Back to Login
                      </Button>
                    </Link>
                    <Link href="/signup/collector/success" className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">View Status</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {paymentStatus === "failed" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card>
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h2>
                  <p className="text-gray-600 mb-6">
                    Your payment could not be processed. Please try again or contact support.
                  </p>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setPaymentStatus("pending")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Try Again
                    </Button>
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

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={applicationData.registrationFee}
        onSuccess={handlePaymentSuccess}
        userInfo={{
          name: applicationData.name,
          id: applicationData.id,
          serviceCode: `DC-REG-${applicationData.id}`,
        }}
      />
    </div>
  )
}
