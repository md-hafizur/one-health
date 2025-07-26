"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { selectAuth, setLogout } from "@/lib/redux/authSlice";
import { toast } from "sonner";
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
import Link from "next/link";

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
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
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
    if (!authData.isAuthenticated || authData.userRole !== "public") {
      router.push("/login");
    }

    const getFingerprint = async () => {
      const fp = await getCurrentBrowserFingerPrint();
      setVisitorId(fp);
      visitorIdRef.current = fp;
    };
    getFingerprint();

    if (authData.isAuthenticated) {
      fetchUserData();
    }
  }, [authData.isAuthenticated, authData.userRole, router, fetchUserData]);

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
          if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (typeof errorData.message === 'object' && errorData.message !== null) {
            errorMessage = Object.entries(errorData.message)
              .map(([field, errors]) => {
                const fieldName = field
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (char) => char.toUpperCase());

                if (Array.isArray(errors)) {
                  return `${fieldName}: ${errors.join(', ')}`;
                } else {
                  return `${fieldName}: ${String(errors)}`;
                }
              })
              .join('; ');
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
      setConfirmPasswordError("New password and confirm password do not match.");
      hasError = true;
    }

    if (newPassword && (newPassword.length < 8 ||
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[^A-Za-z0-9]/.test(newPassword))) {
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
          if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (typeof errorData.message === 'object' && errorData.message !== null) {
            errorMessage = Object.entries(errorData.message)
              .map(([field, errors]) => {
                const fieldName = field
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (char) => char.toUpperCase());

                if (Array.isArray(errors)) {
                  return `${fieldName}: ${errors.join(', ')}`;
                } else {
                  return `${fieldName}: ${String(errors)}`;
                }
              })
              .join('; ');
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
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                My Health Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {userData?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Active Member
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Digital Card Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-8 overflow-hidden">
                <div className="p-1">
                  {/* <CardContent> */}
                  <div className="bg-gradient-to-br from-blue-600 to-green-500 p-6 text-white w-full h-full rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">
                          Digital Health Card
                        </h2>
                        <p className="text-blue-100">OneHealth Member</p>
                      </div>
                      <Shield className="h-12 w-12 text-white/80" />
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-8">
                      <div>
                        <p className="text-blue-100 text-sm">Full Name</p>
                        <p className="text-xl font-semibold">
                          {userData?.name}
                        </p>
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
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-15 h-15 bg-white/20 rounded-lg flex items-center justify-center cursor-pointer"
                        onClick={() => setShowQR(!showQR)}
                      >
                        <QrCode className="h-10 w-10 text-white" />
                      </motion.div>
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
            </motion.div>

            {/* Linked Family Members Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Linked Family Members
                  </CardTitle>
                  <CardDescription>
                    Manage your family members' health cards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Blood Group</TableHead>

                        <TableHead>Relationship</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userData?.children.map((child) => (
                        <TableRow key={child.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {child.profile?.photo ? (
                                <img
                                  src={child.profile.photo}
                                  alt={child.name}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-lg">
                                    {child.first_name?.[0]}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{child.name}</p>
                                <p className="text-sm text-gray-500">
                                  {child.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                child.status === "pending"
                                  ? "outline"
                                  : "default"
                              }
                              className={
                                child.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ""
                              }
                            >
                              {child.status || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {child.profile?.data_of_birth || "N/A"}
                          </TableCell>
                          <TableCell className="font-medium text-red-500">
                            {child.profile?.blood_group || "N/A"}
                          </TableCell>

                          <TableCell>
                            {child.profile?.relationship || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {userData?.children.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No linked family members found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Member Benefits</CardTitle>
                  <CardDescription>
                    Your active benefits and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {benefit.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {benefit.description}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-1 text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            {benefit.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Account Settings
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="first_name" className="text-right">
                              First Name
                            </Label>
                            <Input
                              id="first_name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="last_name" className="text-right">
                              Last Name
                            </Label>
                            <Input
                              id="last_name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name_bn" className="text-right">
                              Name (Bengali)
                            </Label>
                            <Input
                              id="name_bn"
                              value={nameBn}
                              onChange={(e) => setNameBn(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="blood_group" className="text-right">
                              Blood Group
                            </Label>
                            <Select
                              value={bloodGroup || ""}
                              onValueChange={setBloodGroup}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a blood group" />
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
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={handleUpdateProfile}>
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Update your password here.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="current-password" className="text-right">
                              Current Password
                            </Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="col-span-3"
                            />
                            {currentPasswordError && <p className="col-span-4 text-red-500 text-sm mt-1">{currentPasswordError}</p>}
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-password" className="text-right">
                              New Password
                            </Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="col-span-3"
                            />
                            {newPasswordError && <p className="col-span-4 text-red-500 text-sm mt-1">{newPasswordError}</p>}
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="confirm-password" className="text-right">
                              Confirm Password
                            </Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="col-span-3"
                            />
                            {confirmPasswordError && <p className="col-span-4 text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={handleChangePassword}>
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Medical Records
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
