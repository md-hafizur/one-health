"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCookie } from "@/lib/utils/csrf";
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, ArrowRight,ArrowLeft, Search, User, CreditCard, AlertCircle, FileImage, PenTool, Phone, Mail } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"
import { toast } from "sonner"
import Link from "next/link"

interface ParentUser {
  id: number
  first_name: string
  last_name: string
  phone: string | null
  email: string
  child_count: number
}

export default function SubAccountRegistrationPage() {
  const [step, setStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null)
  const [formData, setFormData] = useState({
    first_name_en: '',
    last_name_en: '',
    name_bn: '',
    data_of_birth: '',
    gender: '',
    blood_group: '',
    guardian_nid: '',
    relationship: '',
    photo: null as File | null,
    signature: null as File | null,
  })

  const [searchResults, setSearchResults] = useState<ParentUser[]>([])

  const handleSearch = async (term: string) => {
    if (term.length < 3) {
      setSearchResults([])
      return
    }
    try {ArrowLeft
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const csrfToken =  getCookie("csrftoken")
        const response = await fetch(`${apiUrl}/accounts/public-user?param=${term}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",
          },
          credentials: "include",
        })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.detail || "Failed to fetch search results. Please try again.");
        setSearchResults([])
        return
      }
      const data = await response.json()
      const results = Array.isArray(data) ? data : [data]
      setSearchResults(results.map((item: any) => ({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        phone: item.phone,
        email: item.email,
        child_count: item.child_count,
      })))
    } catch (error) {
      console.error("Error fetching search results:", error)
      toast.error("Failed to fetch search results. Please try again.")
      setSearchResults([])
    }
  }

  const handleSelectParent = (parent: ParentUser) => {
    setSelectedParent({
      ...parent,
      name: `${parent.first_name} ${parent.last_name}`,
    })
    setStep(2)
  }

  const handleNext = () => {
    if (!selectedParent) return
    setStep(3)
  }

  

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name_en || !formData.last_name_en || !formData.name_bn || !formData.data_of_birth || !formData.gender || !formData.blood_group || !formData.photo || !formData.signature || !formData.guardian_nid || !formData.relationship) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!selectedParent) {
      toast.error("No parent account selected. Please go back and select a parent.");
      return;
    }

    const form = new FormData();
    form.append('account_type', 'sub-account');

    const userData = {
      parent: selectedParent.id,
      first_name: formData.first_name_en,
      last_name: formData.last_name_en,
      sub_account_status: "Draft",
    };
    form.append('user_data', JSON.stringify(userData));

    const userProfileData = {
      name_en: `${formData.first_name_en} ${formData.last_name_en}`,
      name_bn: formData.name_bn,
      guardian_nid: formData.guardian_nid,
      blood_group: formData.blood_group,
      data_of_birth: formData.data_of_birth,
      relationship: formData.relationship,
      gender: formData.gender,
    };
    form.append('user_profile', JSON.stringify(userProfileData));

    if (formData.photo) {
      form.append('user_profile.photo', formData.photo);
    }
    if (formData.signature) {
      form.append('user_profile.signature', formData.signature);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`${apiUrl}/accounts/register?identity=DataCollector&for_account=sub_account`, {
        method: 'POST',
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
        body: form,
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        const subAccountData = {
          ...formData,
          ...responseData,
          application_id: responseData.application_id || `SUB-${Date.now()}`,
        };
        setStep(4);
        toast.success("Sub-account data submitted! Please verify OTP.");
      } else {
        let errorMsg = "Sub-account creation failed.";
        if (responseData.errors) {
          const errorKey = Object.keys(responseData.errors)[0];
          if (errorKey && Array.isArray(responseData.errors[errorKey]) && responseData.errors[errorKey].length > 0) {
            errorMsg = `${errorKey.replace("_", " ")}: ${responseData.errors[errorKey][0]}`;
          } else {
            errorMsg = responseData.context || "An unknown error occurred.";
          }
        } else if (responseData.detail) {
          errorMsg = responseData.detail;
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("An error occurred while creating the sub-account.");
      console.error("Sub-account creation error:", error);
    }
  }

  const handleVerificationComplete = () => {
    setStep(5)
    toast.success("OTP verified successfully! Proceeding to payment.")
  }

  const handlePaymentSuccess = () => {
    setStep(6)
    toast.success("Payment successful! Sub-account created.")
  }

  const resetForm = () => {
    setStep(1)
    setSearchTerm("")
    setSelectedParent(null)
    setFormData({
      first_name_en: '',
      last_name_en: '',
      name_bn: '',
      data_of_birth: '',
      gender: '',
      blood_group: '',
      guardian_nid: '',
      relationship: '',
      photo: null,
      signature: null,
    })
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
              <h1 className="text-2xl font-bold text-gray-800">Create Sub-Account</h1>
              <p className="text-gray-600">Register a new family member account</p>
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
                Select Parent
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
                Confirm Selection
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
                Sub-Account Details
              </span>
            </div>
            
            <div className={`flex-1 h-px ${step >= 4 ? "bg-green-300" : "bg-gray-300"} mx-4`}></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 4 ? (step > 4 ? "bg-green-600" : "bg-blue-600") : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 4 ? "✓" : "4"}
              </div>
              <span
                className={`text-sm font-medium ${step >= 4 ? (step > 4 ? "text-green-600" : "text-blue-600") : "text-gray-500"}`}
              >
                OTP Verification
              </span>
            </div>
            <div className={`flex-1 h-px ${step >= 5 ? "bg-green-300" : "bg-gray-300"} mx-4`}></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 5 ? (step > 5 ? "bg-green-600" : "bg-blue-600") : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 5 ? "✓" : "5"}
              </div>
              <span
                className={`text-sm font-medium ${step >= 5 ? (step > 5 ? "text-green-600" : "text-blue-600") : "text-gray-500"}`}
              >
                Payment
              </span>
            </div>
            <div className={`flex-1 h-px ${step >= 6 ? "bg-green-300" : "bg-gray-300"} mx-4`}></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 6 ? (step > 6 ? "bg-green-600" : "bg-blue-600") : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 6 ? "✓" : "6"}
              </div>
              <span
                className={`text-sm font-medium ${step >= 6 ? (step > 6 ? "text-green-600" : "text-blue-600") : "text-gray-500"}`}
              >
                Success
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Parent Account */}
        {step === 1 && (
          <SelectParentStep
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredParents={searchResults}
            handleSelectParent={handleSelectParent}
            handleSearch={handleSearch}
          />
        )}

        {/* Step 2: Confirm Selection */}
        {step === 2 && selectedParent && (
          <ConfirmSelectionStep
            selectedParent={selectedParent}
            setStep={setStep}
            handleNext={handleNext}
          />
        )}

        {/* Step 3: Sub-Account Details */}
        {step === 3 && (
          <SubAccountDetailsStep
            formData={formData}
            setFormData={setFormData}
            handleCreateAccount={handleCreateAccount}
            setStep={setStep}
          />
        )}

        {/* Step 4: OTP Verification */}
        {step === 4 && selectedParent && (
          <OTPVerificationStep
            selectedParent={selectedParent}
            formData={formData}
            setFormData={setFormData}
            onVerificationComplete={handleVerificationComplete}
            setStep={setStep}
          />
        )}

        {/* Step 5: Payment */}
        {step === 5 && selectedParent && (
          <PaymentStep
            selectedParent={selectedParent}
            onPaymentSuccess={handlePaymentSuccess}
            setStep={setStep}
          />
        )}

        {/* Step 6: Success */}
        {step === 6 && selectedParent && (
          <SubAccountSuccessStep
            formData={formData}
            selectedParent={selectedParent}
            onRegisterAnotherUser={resetForm}
          />
        )}
      </div>
    </div>
  )
}

// Select Parent Step Component
function SelectParentStep({ searchTerm, setSearchTerm, filteredParents, handleSelectParent, handleSearch }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div>
        <Label htmlFor="search">Search Parent Account</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              handleSearch(e.target.value)
            }}
            placeholder="Search by name, phone, or ID..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredParents.length > 0 ? (
          filteredParents.map((parent: ParentUser) => (
            <Card
              key={parent.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200"
              onClick={() => handleSelectParent(parent)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{parent.first_name} {parent.last_name}</p>
                      <p className="text-sm text-gray-600">{parent.phone}</p>
                      <p className="text-sm text-blue-600">ID: {parent.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {parent.child_count} children
                    </Badge>
                    {parent.email && <p className="text-xs text-gray-500 mt-1">{parent.email}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No parent accounts found</p>
            <p className="text-sm">Try searching with different terms</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Confirm Selection Step Component
function ConfirmSelectionStep({ selectedParent, setStep, handleNext }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Parent Account</h3>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">{selectedParent.first_name} {selectedParent.last_name}</p>
                      <p className="text-sm text-gray-600">{selectedParent.phone}</p>
                      <p className="text-sm text-blue-600">ID: {selectedParent.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Change Selection
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1 bg-green-600 hover:bg-green-700">
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}



// OTP Verification Step Component
function OTPVerificationStep({ selectedParent, formData, setFormData, onVerificationComplete, setStep, subAccountApplicationId }: any) {
  const [otp, setOtp] = useState("")
  const [verified, setVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const isPhoneVerification = selectedParent.phone !== null
  const contactInfo = isPhoneVerification ? selectedParent.phone : selectedParent.email
  const ContactIcon = isPhoneVerification ? Phone : Mail
  const verificationMethod = isPhoneVerification ? "Phone Number" : "Email Address"

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const handleSendOtp = async () => {
    if (!selectedParent?.id) {
      toast.error("User ID not found. Cannot send OTP.");
      return;
    }

    const payload = {
      user_id: selectedParent.id,
      contact: contactInfo,
      contact_type: isPhoneVerification ? "phone" : "email",
    };

    try {
      const response = await fetch(`${apiUrl}/accounts/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setOtpSent(true);
        setResendCooldown(60);
        toast.success(`OTP sent to ${contactInfo}`);

        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send OTP: ${errorData.detail || 'An unknown error occurred'}`);
      }
    } catch (error) {
      toast.error('An error occurred while sending the OTP.');
      console.error('Send OTP error:', error);
    }
  };

  const handleVerifyOtp = async () => {
    if (!selectedParent?.id) {
      toast.error("User ID not found. Cannot verify OTP.");
      return;
    }

    const payload = {
      user_id: selectedParent.id,
      otp: otp,
    };

    try {
      const response = await fetch(`${apiUrl}/accounts/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        setVerified(true);
        toast.success(`${verificationMethod} verified successfully!`);
        onVerificationComplete()
      } else {
        toast.error(`OTP verification failed: ${responseData?.detail || JSON.stringify(responseData)}`);
      }
    } catch (error) {
      toast.error('An error occurred while verifying the OTP.');
      console.error('Verify OTP error:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="text-center">
        <Badge variant="outline" className="bg-green-100 text-green-800 mb-4">
          OTP sent to {contactInfo}
        </Badge>
      </div>
      <div>
        <Label htmlFor="otp">Enter OTP</Label>
        <Input
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          className="text-center text-lg tracking-widest"
          disabled={verified}
        />
      </div>
      <div className="flex gap-2">
        {!otpSent ? (
          <Button onClick={handleSendOtp} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <ContactIcon className="h-4 w-4 mr-2" />
            Send OTP to {verificationMethod}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleSendOtp} disabled={resendCooldown > 0} className="flex-1">
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </Button>
            <Button onClick={handleVerifyOtp} disabled={otp.length !== 6 || verified} className="flex-1 bg-green-600 hover:bg-green-700">
              {verified ? "Verified" : "Verify OTP"}
            </Button>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
          Back
        </Button>
        <Button onClick={onVerificationComplete} disabled={!verified} className="flex-1 bg-blue-600 hover:bg-blue-700">
          Continue to Payment
        </Button>
      </div>
    </motion.div>
  )
}

// Sub-Account Details Step Component
function SubAccountDetailsStep({ formData, setFormData, handleCreateAccount, setStep }: any) {
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
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="first_name_en">First Name (English) *</Label>
          <Input
            id="first_name_en"
            value={formData.first_name_en}
            onChange={(e) => setFormData({ ...formData, first_name_en: e.target.value })}
            placeholder="Enter first name in English"
            required
          />
        </div>

        <div>
          <Label htmlFor="last_name_en">Last Name (English) *</Label>
          <Input
            id="last_name_en"
            value={formData.last_name_en}
            onChange={(e) => setFormData({ ...formData, last_name_en: e.target.value })}
            placeholder="Enter last name in English"
            required
          />
        </div>

        <div>
          <Label htmlFor="name_bn">Name (Bangla) *</Label>
          <Input
            id="name_bn"
            value={formData.name_bn}
            onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
            placeholder="বাংলায় নাম লিখুন"
            required
          />
        </div>

        <div>
          <Label htmlFor="data_of_birth">Date of Birth</Label>
          <Input
            id="data_of_birth"
            type="date"
            value={formData.data_of_birth}
            onChange={(e) => setFormData({ ...formData, data_of_birth: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="blood_group">Blood Group</Label>
          <Select value={formData.blood_group} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>

        

        <div>
          <Label htmlFor="guardian_nid">Guardian NID</Label>
          <Input
            id="guardian_nid"
            value={formData.guardian_nid}
            onChange={(e) => setFormData({ ...formData, guardian_nid: e.target.value })}
            placeholder="Enter parent account NID number"
            maxLength={17}
          />
        </div>

        

        <div>
          <Label htmlFor="relationship">Relationship to Guardian *</Label>
          <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Son">Son</SelectItem>
              <SelectItem value="Daughter">Daughter</SelectItem>
              <SelectItem value="Brother">Brother</SelectItem>
              <SelectItem value="Sister">Sister</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
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
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
          Back
        </Button>
        <Button onClick={handleCreateAccount} className="flex-1 bg-green-600 hover:bg-green-700">
          Create Account and Verify
        </Button>
      </div>
    </motion.div>
  )
}



// Payment Step Component
function PaymentStep({ selectedParent, onPaymentSuccess, setStep }: any) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handlePayNow = () => {
    setShowPaymentModal(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Sub-Account Registration Fee Payment
          </CardTitle>
          <CardDescription>
            Complete your payment to activate {selectedParent.first_name}'s sub-account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Fee Breakdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Fee Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sub-Account Registration Fee</span>
                <span className="font-medium">৳500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verification Fee</span>
                <span className="font-medium">৳0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium">৳0</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">৳500</span>
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
                  <li>• Payment is required to activate the sub-account</li>
                  <li>• Refunds are available if the sub-account is rejected by admin</li>
                  <li>• You will receive login credentials via verified contact method once approved</li>
                  <li>• Your verified contact information will be used for all communications</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="text-center">
            <Button onClick={handlePayNow} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="h-5 w-5 mr-2" />
              Pay ৳500 Now
            </Button>
            <p className="text-sm text-gray-500 mt-2">Secure payment via bKash or Nagad</p>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
          Back to OTP Verification
        </Button>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={500}
        onSuccess={onPaymentSuccess}
        userInfo={{
          name: selectedParent.first_name,
          id: selectedParent.id,
          serviceCode: `SUB-ACC-REG-${selectedParent.id}`,
        }}
      />
    </motion.div>
  )
}

// Success Step Component
function SubAccountSuccessStep({ formData, selectedParent, onRegisterAnotherUser }: any) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [id, setId] = useState("")

  useEffect(() => {
    setUsername(`child${Date.now().toString().slice(-4)}`)
    setPassword(`temp${Math.floor(Math.random() * 1000)}`)
    if (selectedParent) {
      setId(selectedParent.id.toString())
    }
  }, [selectedParent])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h3 className="text-lg font-semibold text-gray-800">Sub-Account Created Successfully!</h3>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-3">Child Account Details:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{formData.first_name_en} {formData.last_name_en}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Parent:</span>
            <span className="font-medium">{selectedParent.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ID:</span>
            <span className="font-mono font-medium">OH-2024-{id}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Login Credentials:</p>
        <div className="space-y-1 text-sm">
          <p className="font-mono">
            <strong>Username:</strong> {username}
          </p>
          <p className="font-mono">
            <strong>Password:</strong> {password}
          </p>
        </div>
      </div>

      <Button onClick={onRegisterAnotherUser} className="w-full bg-green-600 hover:bg-green-700">
        Create Another Sub-Account
      </Button>
    </motion.div>
  )
}