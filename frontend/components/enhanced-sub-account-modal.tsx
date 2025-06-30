"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CheckCircle, ArrowRight, Search, User } from "lucide-react"
import { toast } from "sonner"

interface CreateSubAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ParentUser {
  id: string
  name: string
  phone: string
  email?: string
  childCount: number
}

export function CreateSubAccountModal({ open, onOpenChange }: CreateSubAccountModalProps) {
  const [step, setStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null)
  const [formData, setFormData] = useState({
    otp: "",
    name: "",
    age: "",
    gender: "",
  })

  // Mock parent users data
  const parentUsers: ParentUser[] = [
    {
      id: "OH-2024-001",
      name: "Ahmed Rahman",
      phone: "+880 1234-567890",
      email: "ahmed@example.com",
      childCount: 2,
    },
    {
      id: "OH-2024-003",
      name: "Mohammad Ali",
      phone: "+880 1234-567892",
      email: "mohammad@example.com",
      childCount: 0,
    },
    {
      id: "OH-2024-005",
      name: "Fatima Khan",
      phone: "+880 1234-567894",
      childCount: 1,
    },
  ]

  const filteredParents = parentUsers.filter(
    (parent) =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm) ||
      parent.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectParent = (parent: ParentUser) => {
    setSelectedParent(parent)
    setStep(2)
  }

  const handleSendOTP = () => {
    if (!selectedParent) return
    setStep(3)
    toast.success(`OTP sent to ${selectedParent.phone}`)
  }

  const handleVerifyOTP = () => {
    if (formData.otp !== "123456") {
      toast.error("Invalid OTP. Please try again.")
      return
    }
    setStep(4)
    toast.success("OTP verified successfully!")
  }

  const handleCreateAccount = () => {
    if (!formData.name || !formData.age || !formData.gender) {
      toast.error("Please fill all required fields")
      return
    }
    setStep(5)
    toast.success("Sub-account created successfully!")
  }

  const resetForm = () => {
    setStep(1)
    setSearchTerm("")
    setSelectedParent(null)
    setFormData({
      otp: "",
      name: "",
      age: "",
      gender: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Create Sub-Account
          </DialogTitle>
          <DialogDescription>Step {step} of 5: Create a family member account</DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <motion.div
            className="bg-green-600 h-2 rounded-full"
            initial={{ width: "20%" }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step 1: Select Parent Account */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <Label htmlFor="search">Search Parent Account</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, or ID..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
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
                            <p className="font-medium text-gray-800">{parent.name}</p>
                            <p className="text-sm text-gray-600">{parent.phone}</p>
                            <p className="text-sm text-blue-600">{parent.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {parent.childCount} children
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
        )}

        {/* Step 2: Confirm Selection */}
        {step === 2 && selectedParent && (
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
                      <p className="font-medium text-gray-800">{selectedParent.name}</p>
                      <p className="text-sm text-gray-600">{selectedParent.phone}</p>
                      <p className="text-sm text-blue-600">{selectedParent.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Change Selection
              </Button>
              <Button onClick={handleSendOTP} className="flex-1 bg-green-600 hover:bg-green-700">
                Send OTP
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && selectedParent && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="bg-green-100 text-green-800 mb-4">
                OTP sent to {selectedParent.phone}
              </Badge>
            </div>
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-sm text-gray-500 mt-1 text-center">Demo OTP: 123456</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleVerifyOTP} className="flex-1 bg-green-600 hover:bg-green-700">
                Verify OTP
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Sub-Account Details */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter child's full name"
              />
            </div>
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter age"
                min="0"
                max="100"
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleCreateAccount} className="flex-1 bg-green-600 hover:bg-green-700">
                Create Account
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Success */}
        {step === 5 && selectedParent && (
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
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parent:</span>
                  <span className="font-medium">{selectedParent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono font-medium">OH-2024-{Date.now().toString().slice(-3)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Login Credentials:</p>
              <div className="space-y-1 text-sm">
                <p className="font-mono">
                  <strong>Username:</strong> child{Date.now().toString().slice(-4)}
                </p>
                <p className="font-mono">
                  <strong>Password:</strong> temp{Math.floor(Math.random() * 1000)}
                </p>
              </div>
            </div>

            <Button onClick={resetForm} className="w-full bg-green-600 hover:bg-green-700">
              Create Another Sub-Account
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
