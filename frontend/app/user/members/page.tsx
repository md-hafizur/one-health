"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { selectAuth } from "@/lib/redux/authSlice";
import { toast } from "sonner";
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js";
import { motion } from "framer-motion";
import { getCookie } from "@/lib/utils/csrf";
import { useSelector } from "react-redux";
  import Loader from "../loader";
import { FamilyMembersTable } from "@/components/FamilyMembersTable";

interface Profile {
  id: number;
  data_of_birth: string;
  address: { full_address: string } | null;
  photo: string | null;
  blood_group: string | null;
  relationship: string | null;
  name_bn?: string | null;
}

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  status: string | null;
  profile: Profile | null;
  name: string;
}

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  roleName: string;
  children: Child[];
  profile: Profile | null;
  status: string;
  name: string;
  name_bn?: string;
  name_en?: string;
}

export default function FamilyMembers() {
  const router = useRouter();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const authData = useSelector(selectAuth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorId || "",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: UserData = await response.json();
      console.log("Fetched user data:", data);
      setUserData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    if (!authData.isAuthenticated || authData.userRole !== "public") {
      router.push("/login");
    }

    const getFingerprint = async () => {
      const fp = await getCurrentBrowserFingerPrint();
      setVisitorId(fp);
    };
    getFingerprint();

    if (authData.isAuthenticated && visitorId) {
      fetchUserData();
    }
  }, [authData.isAuthenticated, authData.userRole, router, fetchUserData, visitorId]);



  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-1 gap-8">
          {/* Linked Family Members Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FamilyMembersTable children={userData?.children || []} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}