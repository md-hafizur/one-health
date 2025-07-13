"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Phone, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { selectSignup, setVerifiedStatus } from "@/lib/redux/signupSlice"
import { selectAuth, setPhoneVerified, setEmailVerified } from "@/lib/redux/authSlice"
import { getCookie } from "@/lib/utils/csrf";

export default function CollectorVerifyPage() {
  const dispatch = useDispatch()
  const signupData = useSelector(selectSignup)
  const authData = useSelector(selectAuth)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isClient, setIsClient] = useState(false);

  // Get applicationId from URL query params first, then Redux state
  
  const urlApplicationId = searchParams.get('applicationId') || '';
  const storedApplicationId = isClient ? localStorage.getItem("onehealth_application_id") || '' : '';
  const storedContact = isClient ? localStorage.getItem("onehealth_contact") || '' : '';
  const storedContactType = isClient ? localStorage.getItem("onehealth_contact_type") || '' : '';
  const storedFirstName = isClient ? localStorage.getItem("onehealth_first_name") || '' : '';
  const storedLastName = isClient ? localStorage.getItem("onehealth_last_name") || '' : '';

  // Determine which data source to use
  let currentData: {
    firstName: string | null;
    lastName: string | null;
    contact: string | null;
    contactType: string | null;
    applicationId: string | null;
    verified: boolean;
  };

  // Determine the primary source of data
  if (authData.isAuthenticated && authData.userRole === "collector") {
    // If authenticated, authData is the primary source
    currentData = {
      firstName: authData.firstName || storedFirstName,
      lastName: authData.lastName || storedLastName,
      contact: authData.contact || storedContact,
      contactType: authData.contactType || storedContactType,
      applicationId: authData.applicationId || storedApplicationId,
      verified: authData.phoneVerified || authData.emailVerified,
    };
  } else {
    // If not authenticated, signupData (from registration) is the primary source
    currentData = {
      firstName: signupData.firstName || storedFirstName,
      lastName: signupData.lastName || storedLastName,
      contact: signupData.contact || storedContact,
      contactType: signupData.contactType || storedContactType,
      applicationId: signupData.applicationId || storedApplicationId,
      verified: signupData.verified,
    };
  }

  // Override applicationId with localStorage, then URL param, then Redux
  // This ensures the most specific applicationId is used.
  currentData.applicationId = storedApplicationId || urlApplicationId || currentData.applicationId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Immediate check for applicationId
  if (!currentData.applicationId && isClient) {
    console.log("CollectorVerifyPage - Immediate Redirect - Missing applicationId. Displaying error.");
    // No redirect, just display an error message and disable functionality
  }

  useEffect(() => {
    if (!isClient) {
      console.log("CollectorVerifyPage - useEffect - Not client-side yet. Skipping redirect check.");
      return;
    }

    // This useEffect will only run if applicationId is present initially
    // If it becomes missing later, the immediate check above will handle it
    if (!currentData.applicationId) {
      console.log("CollectorVerifyPage - useEffect - applicationId became missing. Disabling functionality.");
      // No redirect, just disable functionality
    }
  }, [isClient, currentData.applicationId, router, urlApplicationId, authData.applicationId, signupData.applicationId]);

  if (!isClient) {
    console.log("CollectorVerifyPage - Render - Not client-side. Showing loading spinner.");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification page...</p>
        </div>
      </div>
    );
  }

  const isApplicationIdMissing = !currentData.applicationId;

  if (isApplicationIdMissing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-red-600">Verification Error</CardTitle>
            <CardDescription>Missing Application ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We are unable to proceed with your verification because your Application ID is missing.
              This usually happens if there was an issue during your registration or login.
            </p>
            <p className="text-gray-700 font-semibold">
              Please contact support for assistance.
            </p>
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Return to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPhoneVerification = currentData.contactType === "phone"
  const ContactIcon = isPhoneVerification ? Phone : Mail
  const verificationMethod = isPhoneVerification ? "Phone Number" : "Email Address"
  const expectedOtp = isPhoneVerification ? "123456" : "654321"

  const handleSendOtp = async () => {
    if (!currentData.applicationId) return

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/accounts/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken") || "",
      },
      body: JSON.stringify({
        user_id: Number(currentData.applicationId),  // or use result.data.user_id
        contact: currentData.contact,
        contact_type: currentData.contactType,
      }),
      credentials: "include",
    })

    const data = await response.json()

    if (response.ok && data.send_otp) {
      toast.success(data.message || "OTP sent successfully")
      setOtpSent(true)
      setResendCooldown(60)

      // Start countdown
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      toast.error(data.message || "Failed to send OTP")
    }
  } catch (error) {
    console.error("OTP send error:", error)
    toast.error("Something went wrong while sending OTP.")
  }
}



  const handleVerifyOtp = async () => {
    if (!currentData.applicationId) return

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits.")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/accounts/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: JSON.stringify({
          user_id: currentData.applicationId, // or use result.data.user_id
          otp: otp,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "OTP verified successfully")
        dispatch(setVerifiedStatus(true))
        if (currentData.contactType === "phone") {
          dispatch(setPhoneVerified(true));
        } else if (currentData.contactType === "email") {
          dispatch(setEmailVerified(true));
        }
      } else {
        if (data.otp && Array.isArray(data.otp) && data.otp.length > 0) {
          toast.error(data.otp.join(" "));
        } else {
          toast.error(data.message || "Invalid OTP. Please try again.")
        }
      }
    } catch (error) {
      console.error("OTP verify error:", error)
      toast.error("Something went wrong while verifying OTP.")
    }
  }

  const handleContinueToPayment = () => {
    console.log("Attempting to continue to payment.");
    console.log("signupData.verified:", signupData.verified);
    router.push(`/signup/collector/payment?application=${currentData.applicationId}`);
  };

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
                        {currentData.firstName} {currentData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{currentData.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Type:</span>
                      <span className="font-medium capitalize">{currentData.contactType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Application ID:</span>
                      <span className="font-mono font-medium">{currentData.applicationId}</span>
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
                  <h3 className="text-lg font-semibold text-gray-800">Verify {verificationMethod}</h3>
                  {!currentData.verified && (
                    <p className="text-gray-600 mb-4">
                      We'll send a 6-digit OTP to <strong>{currentData.contact}</strong>
                    </p>
                  )}
                </div>

                {!otpSent && !currentData.verified ? (
                  <Button onClick={handleSendOtp} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isApplicationIdMissing}>
                    <ContactIcon className="h-4 w-4 mr-2" />
                    Send OTP to {verificationMethod}
                  </Button>
                ) : currentData.verified ? null : (
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
                        disabled={currentData.verified || isApplicationIdMissing}
                      />
                      <p className="text-sm text-gray-500 mt-1 text-center">
                        Demo OTP: <code className="bg-gray-100 px-2 py-1 rounded">{expectedOtp}</code>
                      </p>
                    </div>

                    {currentData.verified ? null : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSendOtp}
                          variant="outline"
                          disabled={resendCooldown > 0 || isApplicationIdMissing}
                          className="flex-1"
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                        </Button>
                        <Button
                          onClick={handleVerifyOtp}
                          disabled={otp.length !== 6 || currentData.verified || isApplicationIdMissing}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {currentData.verified ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verified
                            </>
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Messages */}
                {currentData.verified && (
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
                    disabled={!currentData.verified || isApplicationIdMissing}
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

