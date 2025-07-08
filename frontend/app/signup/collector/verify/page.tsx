"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Phone, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SignupData {
  firstName: string
  lastName: string
  contact: string
  contactType: string
  applicationId: string
  [key: string]: any
}

export default function CollectorVerifyPage() {
  const [signupData, setSignupData] = useState<SignupData | null>(null)
  const [otp, setOtp] = useState("")
  const [verified, setVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Get signup data from localStorage
    const storedData = localStorage.getItem("pendingCollectorSignup")
    if (storedData) {
      setSignupData(JSON.parse(storedData))
    } else {
      // Redirect back to signup if no data found
      router.push("/signup/collector")
    }
  }, [router])

  if (!signupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification page...</p>
        </div>
      </div>
    )
  }

  const isPhoneVerification = signupData.contactType === "phone"
  const ContactIcon = isPhoneVerification ? Phone : Mail
  const verificationMethod = isPhoneVerification ? "Phone Number" : "Email Address"
  const expectedOtp = isPhoneVerification ? "123456" : "654321"

  const handleSendOtp = () => {
    setOtpSent(true)
    setResendCooldown(60)
    toast.success(`OTP sent to ${signupData.contact}`)

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleVerifyOtp = () => {
    if (otp === expectedOtp) {
      setVerified(true)
      toast.success(`${verificationMethod} verified successfully!`)
    } else {
      toast.error("Invalid OTP. Please try again.")
    }
  }

  const handleContinueToPayment = () => {
    // Update signup data with verification status
    const updatedData = {
      ...signupData,
      verified: true,
      verifiedAt: new Date().toISOString(),
    }
    localStorage.setItem("pendingCollectorSignup", JSON.stringify(updatedData))
    router.push(`/signup/collector/payment?application=${signupData.applicationId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/signup/collector" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Registration
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Verify Contact Information</h1>
              <p className="text-gray-600">Verify your {verificationMethod.toLowerCase()} to continue</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                ✓
              </div>
              <span className="text-sm font-medium text-green-600">Registration</span>
            </div>
            <div className="flex-1 h-px bg-green-300 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-blue-600">Verification</span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ContactIcon className="h-6 w-6 text-blue-600" />
                Verify {verificationMethod}
              </CardTitle>
              <CardDescription>
                We need to verify your {verificationMethod.toLowerCase()} to ensure account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Application Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Application Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {signupData.firstName} {signupData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{signupData.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Type:</span>
                      <span className="font-medium capitalize">{signupData.contactType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Application ID:</span>
                      <span className="font-mono font-medium">{signupData.applicationId}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Section */}
                <div className="text-center">
                  <div
                    className={`w-16 h-16 ${isPhoneVerification ? "bg-blue-100" : "bg-green-100"} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <ContactIcon className={`h-8 w-8 ${isPhoneVerification ? "text-blue-600" : "text-green-600"}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Verify {verificationMethod}</h3>
                  <p className="text-gray-600 mb-4">
                    We'll send a 6-digit OTP to <strong>{signupData.contact}</strong>
                  </p>
                </div>

                {!otpSent ? (
                  <Button onClick={handleSendOtp} className="w-full bg-blue-600 hover:bg-blue-700">
                    <ContactIcon className="h-4 w-4 mr-2" />
                    Send OTP to {verificationMethod}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="text-center text-lg tracking-widest font-mono"
                        disabled={verified}
                      />
                      <p className="text-sm text-gray-500 mt-1 text-center">
                        Demo OTP: <code className="bg-gray-100 px-2 py-1 rounded">{expectedOtp}</code>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSendOtp}
                        variant="outline"
                        disabled={resendCooldown > 0}
                        className="flex-1"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                      </Button>
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || verified}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {verified ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verified
                          </>
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {verified && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-green-800 font-medium">{verificationMethod} verified successfully!</p>
                    </div>
                    <p className="text-green-700 text-sm mt-1">You can now proceed to the payment step.</p>
                  </div>
                )}

                {/* Continue Button */}
                <div className="pt-6 border-t">
                  <Button
                    onClick={handleContinueToPayment}
                    disabled={!verified}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
