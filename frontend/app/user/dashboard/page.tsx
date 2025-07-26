"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { selectAuth, setLogout } from "@/lib/redux/authSlice";
import { toast } from "sonner";
import Loader from "@/app/user/loader";
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCookie } from "@/lib/utils/csrf";
import { useDispatch, useSelector } from "react-redux";


import {
  Shield,
  QrCode,
  Users,
  Settings,
  LogOut,
  Download,
  Eye,
  ChevronRight,
  Heart,
  Activity,
  FileText,
  Cake,
  Droplets,
  MapPin,
  Camera,
} from "lucide-react";

interface Profile {
  id: number;
  data_of_birth: string;
  address: { full_address: string } | null;
  photo: string | null;
  blood_group: string | null;
  relationship: string | null;
  name_bn?: string | null;
}

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  roleName: string;
  profile: Profile | null;
  status: string;
  name: string;
  name_bn?: string;
  name_en?: string;
}

export default function UserDashboard() {
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const authData = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [nameBn, setNameBn] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const visitorIdRef = useRef<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log(file);
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorIdRef.current || "",
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
  }, []);

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await getCurrentBrowserFingerPrint();
      setVisitorId(fp);
      visitorIdRef.current = fp;
    };
    getFingerprint();

    if (authData.isAuthenticated) {
      fetchUserData();
    }
  }, [authData.isAuthenticated, fetchUserData]);

  useEffect(() => {
    if (userData) {
      setBloodGroup(userData.profile?.blood_group || null);
      setNameBn(userData.profile?.name_bn || "");
      setFirstName(userData.first_name || "");
      setLastName(userData.last_name || "");
    }
  }, [userData]);

  const handleUpdateProfile = useCallback(async () => {
    if (!userData) return;

    setIsUpdating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/users-update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorId || "",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          name_bn: nameBn,
          blood_group: bloodGroup,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = `Failed to update profile: HTTP error! status: ${response.status}`;

        if (errorData && errorData.message) {
          if (typeof errorData.message === "string") {
            errorMessage = errorData.message;
          } else if (
            typeof errorData.message === "object" &&
            errorData.message !== null
          ) {
            errorMessage = Object.entries(errorData.message)
              .map(([field, errors]) => {
                const fieldName = field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase());

                if (Array.isArray(errors)) {
                  return `${fieldName}: ${errors.join(", ")}`;
                } else {
                  return `${fieldName}: ${String(errors)}`;
                }
              })
              .join("; ");
          }
        }

        toast.error(errorMessage);
        setLoading(false);
        return; // Stop execution if there's an error
      }

      toast.success("Profile updated successfully!");
      fetchUserData(); // Re-fetch full user data after successful update
      setIsSettingsDialogOpen(false); // Close dialog only on success
    } catch (e: any) {
      toast.error(`An unexpected error occurred: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [userData, firstName, lastName, nameBn, bloodGroup, visitorId]);

  const handleLogout = async () => {
    console.log("Logout button clicked.");
    if (!visitorId) {
      console.log("Visitor ID not available.", visitorId);
      toast.error("Visitor ID not generated. Please try again.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("API URL for logout:", apiUrl);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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
      setUserData(null); // Clear user data immediately on logout
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("An unexpected error occurred during logout.");
    }
  };

  const handleChangePassword = useCallback(async () => {
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError("Current password is required.");
      hasError = true;
    }
    if (!newPassword) {
      setNewPasswordError("New password is required.");
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm password is required.");
      hasError = true;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setNewPasswordError("New password and confirm password do not match.");
      setConfirmPasswordError(
        "New password and confirm password do not match."
      );
      hasError = true;
    }

    if (
      newPassword &&
      (newPassword.length < 8 ||
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[^A-Za-z0-9]/.test(newPassword))
    ) {
      setNewPasswordError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsUpdating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/user-change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorId || "",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = `Failed to change password: HTTP error! status: ${response.status}`;
        if (errorData && errorData.message) {
          if (typeof errorData.message === "string") {
            errorMessage = errorData.message;
          } else if (
            typeof errorData.message === "object" &&
            errorData.message !== null
          ) {
            errorMessage = Object.entries(errorData.message)
              .map(([field, errors]) => {
                const fieldName = field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase());

                if (Array.isArray(errors)) {
                  return `${fieldName}: ${errors.join(", ")}`;
                } else {
                  return `${fieldName}: ${String(errors)}`;
                }
              })
              .join("; ");
          }
        }
        toast.error(errorMessage);
        return;
      }

      toast.success("Password changed successfully!");
      setIsPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPasswordError(null);
      setNewPasswordError(null);
      setConfirmPasswordError(null);
    } catch (e: any) {
      toast.error(`An unexpected error occurred: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  }, [currentPassword, newPassword, confirmPassword, visitorId]);

  const benefits = [
    {
      title: "Free Health Checkups",
      description: "Annual health checkups at partner hospitals",
      icon: Heart,
      status: "Active",
    },
    {
      title: "Emergency Services",
      description: "24/7 emergency medical assistance",
      icon: Activity,
      status: "Active",
    },
    {
      title: "Digital Records",
      description: "Secure cloud storage of medical records",
      icon: FileText,
      status: "Active",
    },
  ];



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
    <>
      <div className="lg:col-span-2">
        <div>
          <Card className="mb-8 overflow-hidden">
            <div className="p-1">
              {/* <CardContent> */}
              <div className="bg-gradient-to-br from-blue-600 to-green-500 p-6 text-white w-full h-full rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Digital Health Card</h2>
                    <p className="text-blue-100">OneHealth Member</p>
                  </div>
                  <Shield className="h-12 w-12 text-white/80" />
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div>
                    <p className="text-blue-100 text-sm">Full Name</p>
                    <p className="text-xl font-semibold">{userData?.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Member ID</p>
                    <p className="text-xl font-semibold">{userData?.id}</p>
                  </div>

                  <div>
                    <p className="text-blue-100 text-sm">Valid Until</p>
                    <p className="text-lg font-semibold">December 2025</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div
                    className="w-15 h-15 bg-white/20 rounded-lg flex items-center justify-center cursor-pointer"
                    onClick={() => setShowQR(!showQR)}
                  >
                    <QrCode className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
              {/* </CardContent> */}
            </div>

            <CardContent className="p-6 relative">
              <>
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profile-picture-upload"
                    onChange={handleFileSelect}
                  />
                  {userData?.profile?.photo ? (
                    <img
                      src={userData.profile.photo}
                      alt="User Profile"
                      className="w-24 h-24 rounded-full group-hover:opacity-50 transition-opacity"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center group-hover:opacity-50 transition-opacity">
                      <span className="text-gray-500 text-4xl">
                        {userData?.first_name?.[0]}
                      </span>
                    </div>
                  )}
                  <label
                    htmlFor="profile-picture-upload"
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </label>
                </div>
                <div className="text-center">
                  <p className="font-semibold">
                    {userData?.first_name} {userData?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{userData?.email}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-center gap-3">
                    <Cake className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {userData?.profile?.data_of_birth || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Blood Group</p>
                      <p className="font-medium text-red-500">
                        {userData?.profile?.blood_group || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* New section for Address */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-semibold text-base">
                        {userData?.profile?.address
                          ? `${userData.profile.address.full_address}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-4"></div>
              </>
            </CardContent>
          </Card>
        </div>

        
      </div>
      
      <div className="space-y-6"></div>
    </>
  );
}
