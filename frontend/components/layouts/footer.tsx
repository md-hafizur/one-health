"use client"

import { Heart, Shield, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white sticky bottom-0 z-50">

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 OneHealth. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-400">Secure & Encrypted</span>
          </div>
        </div>
    </footer>
  )
}
