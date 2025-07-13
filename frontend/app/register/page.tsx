"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Phone, MapPin, Upload, FileImage, PenTool, CreditCard, CheckCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: Form, 2: Verification, 3: Payment, 4: Success
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    email: "",
    phone: "",
    presentAddress: "",
    district: "",
    upazila: "",
    serviceCode: "", // Initialize as empty, will be set in useEffect
    photo: null as File | null,
    signature: null as File | null,
  })

  useEffect(() => {
    // Generate serviceCode only on the client side
    setFormData((prevData) => ({
      ...prevData,
      serviceCode: `SVC-${Date.now()}`,
    }))
  }, [])

  const router = useRouter()

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      toast.success("Photo uploaded successfully")
    }
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, signature: file })
      toast.success("Signature uploaded successfully")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if contact information is provided
    if (!formData.phone && !formData.email) {
      toast.error("Please provide either phone number or email address")
      return
    }

    // Store registration data and proceed to verification
    const registrationData = {
      ...formData,
      registrationId: `REG-${Date.now().toString().slice(-6)}`, // Generate on client side
      verificationType: formData.phone ? "phone" : "email",
    }

    localStorage.setItem("pendingUserRegistration", JSON.stringify(registrationData))
    setStep(2)
    toast.success("Registration data saved! Please verify your contact information.")
  }

  const handleVerificationComplete = () => {
    setStep(3)
    toast.success("Verification complete! Please proceed with payment.")
  }

  const handlePaymentSuccess = () => {
    setStep(4)
    toast.success("Payment successful! Digital card will be issued.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/collector/dashboard" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Public User Registration</h1>
              <p className="text-gray-600">Complete the form to register a new user</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 1 ? "bg-green-600" : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? "text-green-600" : "text-gray-500"}`}>
                Registration
              </span>
            </div>
            <div className={`flex-1 h-px ${step >= 2 ? "bg-green-300" : "bg-gray-300"} mx-4`}></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 2 ? (step > 2 ? "bg-green-600" : "bg-blue-600") : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 2 ? "✓" : "2"}
              </div>
              <span
                className={`text-sm font-medium ${step >= 2 ? (step > 2 ? "text-green-600" : "text-blue-600") : "text-gray-500"}`}
              >
                Verification
              </span>
            </div>
            <div className={`flex-1 h-px ${step >= 3 ? "bg-green-300" : "bg-gray-300"} mx-4`}></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 3 ? (step > 3 ? "bg-green-600" : "bg-blue-600") : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 3 ? "✓" : "3"}
              </div>
              <span
                className={`text-sm font-medium ${step >= 3 ? (step > 3 ? "text-green-600" : "text-blue-600") : "text-gray-500"}`}
              >
                Payment
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  User Information
                </CardTitle>
                <CardDescription>Fill in all required information to create a new health card account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name in English"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fatherName">Father's Name *</Label>
                      <Input
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="Enter father's name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="motherName">Mother's Name *</Label>
                      <Input
                        id="motherName"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        placeholder="Enter mother's name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="spouseName">Spouse Name</Label>
                      <Input
                        id="spouseName"
                        value={formData.spouseName}
                        onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                        placeholder="Enter spouse name (if applicable)"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <Label htmlFor="contact">Phone Number or Email Address *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="contact"
                        value={formData.phone || formData.email}
                        onChange={(e) => {
                          const value = e.target.value
                          // Auto-detect if it's email or phone
                          if (value.includes("@")) {
                            setFormData({ ...formData, email: value, phone: "" })
                          } else {
                            setFormData({ ...formData, phone: value, email: "" })
                          }
                        }}
                        placeholder="Enter phone number (+880 1234-567890) or email address"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      You can enter either phone number or email address for verification
                    </p>
                  </div>

                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p>
                      📝 <strong>Note:</strong> The contact information will be used for verification and sending login
                      credentials.
                    </p>
                  </div>

                  {/* Address Information */}
                  <div>
                    <Label htmlFor="presentAddress">Present Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="presentAddress"
                        value={formData.presentAddress}
                        onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                        placeholder="Enter complete present address"
                        className="pl-10 min-h-[100px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value) => setFormData({ ...formData, district: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dhaka">Dhaka</SelectItem>
                          <SelectItem value="chittagong">Chittagong</SelectItem>
                          <SelectItem value="sylhet">Sylhet</SelectItem>
                          <SelectItem value="rajshahi">Rajshahi</SelectItem>
                          <SelectItem value="khulna">Khulna</SelectItem>
                          <SelectItem value="barisal">Barisal</SelectItem>
                          <SelectItem value="rangpur">Rangpur</SelectItem>
                          <SelectItem value="mymensingh">Mymensingh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="upazila">Upazila *</Label>
                      <Input
                        id="upazila"
                        value={formData.upazila}
                        onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                        placeholder="Enter upazila"
                        required
                      />
                    </div>
                  </div>

                  {/* Service Code */}
                  <div>
                    <Label htmlFor="serviceCode">Service Code</Label>
                    <Input
                      id="serviceCode"
                      value={formData.serviceCode}
                      onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                      placeholder="Auto-generated service code"
                      readOnly
                    />
                  </div>

                  {/* File Uploads */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="photo">Public User Photo *</Label>
                      <div className="mt-2">
                        <label
                          htmlFor="photo"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileImage className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              {formData.photo ? formData.photo.name : "Click to upload photo"}
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                          </div>
                          <input
                            id="photo"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            required
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signature">Public User Signature *</Label>
                      <div className="mt-2">
                        <label
                          htmlFor="signature"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <PenTool className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              {formData.signature ? formData.signature.name : "Click to upload signature"}
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 1MB)</p>
                          </div>
                          <input
                            id="signature"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            required
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6 border-t">
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-5 w-5 mr-2" />
                      Continue to Verification
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Verification */}
        {step === 2 && (
          <UserVerificationStep onVerificationComplete={handleVerificationComplete} registrationData={formData} />
        )}

        {/* Step 3: Payment */}
        {step === 3 && <UserPaymentStep onPaymentSuccess={handlePaymentSuccess} registrationData={formData} />}

        {/* Step 4: Success */}
        {step === 4 && <UserSuccessStep registrationData={formData} />}
      </div>
    </div>
  )
}

// Verification Step Component
function UserVerificationStep({ onVerificationComplete, registrationData }: any) {
  const [otp, setOtp] = useState("")
  const [verified, setVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const isPhoneVerification = !!registrationData.phone
  const contactInfo = isPhoneVerification ? registrationData.phone : registrationData.email
  const ContactIcon = isPhoneVerification ? Phone : Mail
  const verificationMethod = isPhoneVerification ? "Phone Number" : "Email Address"
  const expectedOtp = isPhoneVerification ? "123456" : "654321"

  const handleSendOtp = () => {
    setOtpSent(true)
    setResendCooldown(60)
    toast.success(`OTP sent to ${contactInfo}`)

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

  return (
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
            <div className="text-center">
              <div
                className={`w-16 h-16 ${isPhoneVerification ? "bg-blue-100" : "bg-green-100"} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <ContactIcon className={`h-8 w-8 ${isPhoneVerification ? "text-blue-600" : "text-green-600"}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Verify {verificationMethod}</h3>
              <p className="text-gray-600 mb-4">
                We'll send a 6-digit OTP to <strong>{contactInfo}</strong>
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
                  <p className="text-sm text-gray-500 mt-1 text-center">Demo OTP: {expectedOtp}</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSendOtp} variant="outline" disabled={resendCooldown > 0} className="flex-1">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || verified}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {verified ? "Verified" : "Verify OTP"}
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-6 border-t">
              <Button
                onClick={onVerificationComplete}
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
  )
}

// Payment Step Component
function UserPaymentStep({ onPaymentSuccess, registrationData }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Payment
          </CardTitle>
          <CardDescription>Complete payment to activate the health card</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Amount to Pay</p>
              <p className="text-3xl font-bold text-gray-800">৳500</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Registration Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span>{registrationData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span>{registrationData.phone || registrationData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Code:</span>
                  <span>{registrationData.serviceCode}</span>
                </div>
              </div>
            </div>

            <Button onClick={onPaymentSuccess} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              <CreditCard className="h-5 w-5 mr-2" />
              Pay ৳500 Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Success Step Component
function UserSuccessStep({ registrationData }: any) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [id, setId] = useState("")

  useEffect(() => {
    setUsername(`user${Date.now().toString().slice(-4)}`)
    setPassword(`temp${Math.floor(Math.random() * 1000)}`)
    setId(`OH-2024-${Date.now().toString().slice(-3)}`)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            The user has been registered successfully. Login credentials have been sent via{" "}
            {registrationData.phone ? "SMS" : "email"}.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Login Credentials Sent:</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Username:</strong> {username}
              </p>
              <p>
                <strong>Password:</strong> {password}
              </p>
              <p>
                <strong>ID:</strong> {id}
              </p>
              <p>
                <strong>Sent to:</strong> {registrationData.phone || registrationData.email}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/collector/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Dashboard
              </Button>
            </Link>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Register Another User</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
