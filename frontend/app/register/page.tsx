"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Phone, MapPin, Upload, FileImage, PenTool, CreditCard, CheckCircle } from "lucide-react"
import Link from "next/link"
import { PaymentModal } from "@/components/payment-modal"
import { toast } from "sonner"

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: Form, 2: Success, 3: Payment Complete
  const [showPayment, setShowPayment] = useState(false)
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
    serviceCode: `SVC-${Date.now()}`,
    photo: null as File | null,
    signature: null as File | null,
  })

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
    // Simulate saving to database
    setTimeout(() => {
      setStep(2)
      toast.success("Registration data saved successfully!")
    }, 1000)
  }

  const handlePayNow = () => {
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    setStep(3)
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
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+880 1234-567890"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
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
                      Save Registration Data
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Success & Payment */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your registration data has been saved successfully. Complete the payment to activate your digital
                  health card.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 mb-2">
                    Payment Required
                  </Badge>
                  <p className="text-sm text-gray-700">
                    Please complete the payment of <strong>৳500</strong> to activate your account and receive your
                    digital health card.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-3">Registration Summary:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Code:</span>
                      <span className="font-mono font-medium">{formData.serviceCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Fee:</span>
                      <span className="font-bold text-green-600">৳500</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handlePayNow} size="lg" className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay Now - ৳500
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Payment Complete */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your digital health card has been activated. Login credentials have been sent via SMS and email.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4">📱 SMS Format:</h3>
                  <div className="bg-white rounded-lg p-4 text-left border">
                    <p className="text-sm text-gray-700">
                      <strong>OneHealth Digital Card</strong>
                      <br />
                      Welcome {formData.name}!
                      <br />
                      Your account is now active.
                      <br />
                      <br />
                      <strong>Login Details:</strong>
                      <br />
                      Username: user{Date.now().toString().slice(-4)}
                      <br />
                      Password: temp{Math.floor(Math.random() * 1000)}
                      <br />
                      ID: OH-2024-{Date.now().toString().slice(-3)}
                      <br />
                      <br />
                      Login at: onehealth.com/login
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4">📧 Email Format:</h3>
                  <div className="bg-white rounded-lg p-4 text-left border">
                    <p className="text-sm text-gray-700">
                      <strong>Subject:</strong> OneHealth Digital Card - Account Activated
                      <br />
                      <br />
                      Dear {formData.name},
                      <br />
                      <br />
                      Congratulations! Your OneHealth digital card account has been successfully activated.
                      <br />
                      <br />
                      <strong>Your Login Credentials:</strong>
                      <br />
                      Username: user{Date.now().toString().slice(-4)}
                      <br />
                      Password: temp{Math.floor(Math.random() * 1000)}
                      <br />
                      Member ID: OH-2024-{Date.now().toString().slice(-3)}
                      <br />
                      Service Code: {formData.serviceCode}
                      <br />
                      <br />
                      You can now access your digital health card and manage your account at onehealth.com/login
                      <br />
                      <br />
                      Thank you for choosing OneHealth!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href="/collector/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setStep(1)
                      setFormData({
                        name: "",
                        fatherName: "",
                        motherName: "",
                        spouseName: "",
                        email: "",
                        phone: "",
                        presentAddress: "",
                        district: "",
                        upazila: "",
                        serviceCode: `SVC-${Date.now()}`,
                        photo: null,
                        signature: null,
                      })
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Register Another User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        amount={500}
        onSuccess={handlePaymentSuccess}
        userInfo={{
          name: formData.name,
          id: `OH-2024-${Date.now().toString().slice(-3)}`,
          serviceCode: formData.serviceCode,
        }}
      />
    </div>
  )
}
