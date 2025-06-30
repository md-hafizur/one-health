"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Phone, CheckCircle, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface CreateSubAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSubAccountModal({ open, onOpenChange }: CreateSubAccountModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    parentPhone: "",
    otp: "",
    name: "",
    age: "",
    gender: "",
  })

  const handleSendOTP = () => {
    if (!formData.parentPhone) {
      toast.error("Please enter parent phone number")
      return
    }
    setStep(2)
    toast.success("OTP sent to " + formData.parentPhone)
  }

  const handleVerifyOTP = () => {
    if (formData.otp !== "123456") {
      toast.error("Invalid OTP. Please try again.")
      return
    }
    setStep(3)
    toast.success("OTP verified successfully!")
  }

  const handleCreateAccount = () => {
    if (!formData.name || !formData.age || !formData.gender) {
      toast.error("Please fill all required fields")
      return
    }
    setStep(4)
    toast.success("Sub-account created successfully!")
  }

  const resetForm = () => {
    setStep(1)
    setFormData({
      parentPhone: "",
      otp: "",
      name: "",
      age: "",
      gender: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Create Sub-Account
          </DialogTitle>
          <DialogDescription>Step {step} of 4: Create a family member account</DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <motion.div
            className="bg-green-600 h-2 rounded-full"
            initial={{ width: "25%" }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step 1: Parent Phone */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <Label htmlFor="parentPhone">Parent Account Phone/ID</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+880 1234-567890 or OH-2024-XXXX"
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSendOTP} className="w-full bg-green-600 hover:bg-green-700">
              Send OTP
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                OTP sent to {formData.parentPhone}
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
              <p className="text-sm text-gray-500 mt-1">Demo OTP: 123456</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleVerifyOTP} className="flex-1 bg-green-600 hover:bg-green-700">
                Verify OTP
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Sub-Account Details */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter age"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
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
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleCreateAccount} className="flex-1 bg-green-600 hover:bg-green-700">
                Create Account
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800">Account Created Successfully!</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Login Credentials:</p>
              <p className="font-mono text-sm">
                <strong>Username:</strong> sub1248
              </p>
              <p className="font-mono text-sm">
                <strong>Password:</strong> temp456
              </p>
              <p className="font-mono text-sm">
                <strong>ID:</strong> OH-2024-1248
              </p>
            </div>
            <Button onClick={resetForm} className="w-full bg-green-600 hover:bg-green-700">
              Create Another Account
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
