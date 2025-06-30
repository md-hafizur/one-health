"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Smartphone, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  onSuccess: () => void
  userInfo?: {
    name: string
    id: string
    serviceCode: string
  }
}

export function PaymentModal({ open, onOpenChange, amount, onSuccess, userInfo }: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [selectedMethod, setSelectedMethod] = useState<"bkash" | "nagad" | null>(null)

  const handlePayment = (method: "bkash" | "nagad") => {
    setSelectedMethod(method)
    setPaymentStatus("processing")

    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.2 // 80% success rate
      if (success) {
        setPaymentStatus("success")
        toast.success(`Payment successful via ${method.toUpperCase()}!`)
        setTimeout(() => {
          onSuccess()
          setPaymentStatus("pending")
          setSelectedMethod(null)
        }, 2000)
      } else {
        setPaymentStatus("failed")
        toast.error("Payment failed. Please try again.")
      }
    }, 3000)
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "processing":
        return <Clock className="h-8 w-8 text-yellow-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "failed":
        return <XCircle className="h-8 w-8 text-red-500" />
      default:
        return <CreditCard className="h-8 w-8 text-blue-500" />
    }
  }

  const getStatusText = () => {
    switch (paymentStatus) {
      case "processing":
        return `Processing ${selectedMethod?.toUpperCase()} payment...`
      case "success":
        return "Payment Successful!"
      case "failed":
        return "Payment Failed"
      default:
        return "Choose Payment Method"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Payment Gateway</DialogTitle>
          <DialogDescription className="text-center">
            Complete your payment to activate the health card
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Display */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Amount to Pay</p>
            <p className="text-3xl font-bold text-gray-800">৳{amount}</p>
          </div>

          {/* User Information */}
          {userInfo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Payment for:</p>
              <div className="space-y-1">
                <p className="font-medium text-gray-800">{userInfo.name}</p>
                <p className="text-sm text-gray-600">{userInfo.id}</p>
                <p className="text-sm text-blue-600">{userInfo.serviceCode}</p>
              </div>
            </div>
          )}

          {/* Status Display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4"
          >
            {getStatusIcon()}
            <p className="mt-2 font-medium text-gray-800">{getStatusText()}</p>
            {paymentStatus === "processing" && <p className="text-sm text-gray-600 mt-1">Please wait...</p>}
          </motion.div>

          {/* Payment Methods */}
          {paymentStatus === "pending" && (
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-pink-300"
                  onClick={() => handlePayment("bkash")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">bKash</h3>
                    <p className="text-sm text-gray-600">Mobile Payment</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-300"
                  onClick={() => handlePayment("nagad")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Nagad</h3>
                    <p className="text-sm text-gray-600">Mobile Payment</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Status Badge */}
          <div className="text-center">
            <Badge
              variant="outline"
              className={`
                ${paymentStatus === "success" ? "bg-green-100 text-green-800 border-green-300" : ""}
                ${paymentStatus === "failed" ? "bg-red-100 text-red-800 border-red-300" : ""}
                ${paymentStatus === "processing" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""}
                ${paymentStatus === "pending" ? "bg-blue-100 text-blue-800 border-blue-300" : ""}
              `}
            >
              {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </Badge>
          </div>

          {/* Retry Button */}
          {paymentStatus === "failed" && (
            <Button onClick={() => setPaymentStatus("pending")} className="w-full bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
