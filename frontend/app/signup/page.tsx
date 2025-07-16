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
import { ArrowLeft, UserCheck, Phone, MapPin, Upload, FileImage, CheckCircle, User } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CollectorSignUpPage() {
  const [step, setStep] = useState(1) // 1: Form, 2: Success
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    district: "",
    upazila: "",
    nidNumber: "",
    experience: "",
    photo: null as File | null,
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      toast.success("Photo uploaded successfully")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    // Simulate registration process
    setTimeout(() => {
      setStep(2)
      toast.success("Registration submitted successfully!")
    }, 1000)
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
              <h1 className="text-2xl font-bold text-gray-800">Data Collector Registration</h1>
              <p className="text-gray-600">Join our team of data collectors</p>
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
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  Data Collector Application
                </CardTitle>
                <CardDescription>Fill in all required information to apply as a data collector</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="Enter first name"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Enter last name"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>

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
                          You can enter either your phone number or email address for verification
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="nidNumber">National ID Number *</Label>
                        <Input
                          id="nidNumber"
                          value={formData.nidNumber}
                          onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                          placeholder="Enter NID number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Address Information</h3>

                    <div>
                      <Label htmlFor="address">Present Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  </div>

                  {/* Account Security */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Security</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter password (min 6 characters)"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Confirm your password"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Information</h3>

                    <div>
                      <Label htmlFor="experience">Relevant Experience</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        placeholder="Describe your relevant experience in data collection, healthcare, or community work..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Profile Photo</h3>

                    <div>
                      <Label htmlFor="photo">Profile Photo *</Label>
                      <div className="mt-2">
                        <label
                          htmlFor="photo"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileImage className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              {formData.photo ? formData.photo.name : "Click to upload profile photo"}
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
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Application Process</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Your application will be reviewed by our admin team</li>
                      <li>• You will receive an email notification about the approval status</li>
                      <li>• Approved collectors will receive login credentials and training materials</li>
                      <li>• All information provided must be accurate and verifiable</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6 border-t">
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-5 w-5 mr-2" />
                      Submit Application
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Success */}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Submitted Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for applying to become a data collector. Your application has been submitted and is now
                  under review.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4">What happens next?</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-600 text-white mt-1">1</Badge>
                      <div>
                        <p className="font-medium text-gray-800">Application Review</p>
                        <p className="text-sm text-gray-600">
                          Our admin team will review your application within 2-3 business days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-600 text-white mt-1">2</Badge>
                      <div>
                        <p className="font-medium text-gray-800">Email Notification</p>
                        <p className="text-sm text-gray-600">
                          You'll receive an email with the approval status and next steps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-600 text-white mt-1">3</Badge>
                      <div>
                        <p className="font-medium text-gray-800">Account Activation</p>
                        <p className="text-sm text-gray-600">
                          If approved, you'll receive login credentials and training materials
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-3">Application Summary:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{formData.phone || formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Type:</span>
                      <span className="font-medium">{formData.phone ? "Phone" : "Email"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">District:</span>
                      <span className="font-medium">{formData.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Application ID:</span>
                      <span className="font-mono font-medium">APP-{Date.now().toString().slice(-6)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Back to Login
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Homepage</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
