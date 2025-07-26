"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Bell, User, Download } from "lucide-react"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { setLogout } from "@/lib/redux/authSlice"
import { toast } from "sonner"
import { getCookie } from "@/lib/utils/csrf"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react";


import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js";

export function UserHeader() {
  const [visitorId, setVisitorId] = useState< | null>(null);

  useEffect(() => {
    const visitorId = getCurrentBrowserFingerPrint();
    if (visitorId) {
      setVisitorId(visitorId);
    } else {
      toast.error("Failed to generate Visitor ID. Please try again.");
    }
  }, []);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    console.log("Logout button clicked.");
    if (!visitorId) {
      console.log("Visitor ID not available.", visitorId);
      toast.error("Visitor ID not generated. Please try again.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("API URL for logout:", apiUrl);

    try {
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorId,
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Logout failed.");
        return;
      }

      toast.success(result.message || "Logged out successfully!");

      dispatch(setLogout());
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("An unexpected error occurred during logout.");
    }
  }, [visitorId, dispatch, router]);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/user/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OH</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">OneHealth Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, John Doe</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active Member
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={!visitorId}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
