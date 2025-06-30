"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Phone, MapPin, CreditCard } from "lucide-react"
import { PaymentModal } from "./payment-modal"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RegisterUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegisterUserModal({ open, onOpenChange }: RegisterUserModalProps) {
  const [step, setStep] = useState(1)
  const [showPayment, setShowPayment] = useState(false)
  const [formData, setFormData] = useState({
    nameEn: "",
    nameBn: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    email: "",
    phone: "",
    presentAddress: "",
    district: "",
    upazila: "",
    serviceCode: `SVC-${Date.now()}`, // Auto-generated
    parentId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    onOpenChange(false)
    setStep(1)
    setFormData({
      nameEn: "",
      nameBn: "",
      fatherName: "",
      motherName: "",
      spouseName: "",
      email: "",
      phone: "",
      presentAddress: "",
      district: "",
      upazila: "",
      serviceCode: `SVC-${Date.now()}`, // Auto-generated
      parentId: "",
    })

    // Show success message with credentials
    toast.success("Registration Successful!", {
      description: "SMS sent with login credentials: Username: user1247, Password: temp123",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Register New User
            </DialogTitle>
            <DialogDescription>Fill in the user details to create a new health card account</DialogDescription>
          </DialogHeader>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[60vh] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameEn">Name (English) *</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Enter name in English"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nameBn">Name (Bengali)</Label>
                <Input
                  id="nameBn"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  placeholder="বাংলায় নাম লিখুন"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <Label htmlFor="spouseName">Spouse Name (Optional)</Label>
              <Input
                id="spouseName"
                value={formData.spouseName}
                onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                placeholder="Enter spouse name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1234-567890"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="presentAddress">Present Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="presentAddress"
                  value={formData.presentAddress}
                  onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                  placeholder="Enter complete present address"
                  className="pl-10 min-h-[80px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceCode">Service Code</Label>
                <Input
                  id="serviceCode"
                  value={formData.serviceCode}
                  onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                  placeholder="Auto-generated or scanned"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="parentId">Parent ID (for sub-account)</Label>
                <Input
                  id="parentId"
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  placeholder="OH-2024-XXXX (optional)"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Badge variant="outline" className="text-lg font-semibold">
                Registration Fee: ৳500
              </Badge>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Save & Continue to Payment
              </Button>
            </div>
          </motion.form>
        </DialogContent>
      </Dialog>

      <PaymentModal open={showPayment} onOpenChange={setShowPayment} amount={500} onSuccess={handlePaymentSuccess} />
    </>
  )
}
