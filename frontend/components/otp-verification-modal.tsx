"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface OtpVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (otp: string) => void
  onResend: () => void
  contact: string // Email or phone number
}

export function OtpVerificationModal({
  open,
  onOpenChange,
  onVerify,
  onResend,
  contact,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (open) {
      setResendCooldown(60)
    }
  }, [open])

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.")
      return
    }
    setIsVerifying(true)
    try {
      await onVerify(otp)
      // On successful verification, the parent component will handle closing the modal
    } catch (error: any) {
      toast.error(`Verification failed: ${error.message}`)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = () => {
    onResend()
    setResendCooldown(60)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Your Identity</DialogTitle>
          <DialogDescription>
            An OTP has been sent to <strong>{contact}</strong>. Please enter it below to verify your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="otp"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="text-center text-lg tracking-[0.5em]"
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleResend} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </Button>
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}