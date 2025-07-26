"use client"

import type React from "react"

import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, UserCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { setField, selectSignup, resetSignup, SignupState } from "@/lib/redux/signupSlice"
import { setLogin, selectAuth, setAllowLoginAccess } from "@/lib/redux/authSlice"
import type { RootState } from "@/lib/redux/store"
import { getCookie } from "@/lib/utils/csrf";

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState("public")
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const dispatch = useDispatch()
  const signUpData = useSelector(selectSignup)
  const authData = useSelector(selectAuth)

  // Controlled state for login forms
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false); // New state for client-side rendering

  useEffect(() => {
    setIsClient(true); // Set isClient to true after component mounts on the client
  }, []);

  useEffect(() => {
    if (isClient) { // Only run on the client
      const getFingerprint = async () => {
        const fp = await getCurrentBrowserFingerPrint()
        setVisitorId(fp)
      }
      getFingerprint()
    }
  }, [isClient]);

  useEffect(() => {
    if (authData.isAuthenticated && !authData.allowLoginAccessWhileAuthenticated) {
      switch (authData.userRole) {
        case "admin":
          router.replace("/admin/dashboard");
          break;
        case "collector":
          router.replace("/collector/dashboard");
          break;
        case "public":
          router.replace("/user/dashboard");
          break;
      }
    }
  }, [authData, router]);




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    dispatch(setField({ field: id as keyof SignupState, value: value as any }));
  }

  const handleLogin = async (role: string) => {
    try {
      if (role === "collector") {
        if (!visitorId) {
          toast.error("Visitor ID not generated. Please try again.")
          return
        }

        const isEmail = loginData.username.includes("@")
        const payload = {
          [isEmail ? "email" : "phone"]: loginData.username,
          password: loginData.password,
          account_type: "dataCollector",
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Visitor-ID": visitorId,
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          body: JSON.stringify(payload),
          credentials: "include", // Required for sending cookies with cross-origin requests
        })

        const result = await response.json()
        console.log("API Response Result:", result);

        if (!response.ok) {
          if (result.message) {
            toast.error(result.message)
          } else if (result.errors) {
            Object.entries(result.errors).forEach(([field, errors]) => {
              const errorMessages = (errors as string[]).join(" ")
              toast.error(`${field}: ${errorMessages}`)
            })
          } else {
            toast.error("An unknown error occurred during login.")
          }
          return
        }

        toast.success(result.message || "Login successful!")
        const phoneVerified = result.phone_verified ?? false;
        const emailVerified = result.email_verified ?? false;
        const applicationId = result.id;
        const contact = result.email || result.phone || null;
        const contactType = result.email ? "email" : (result.phone ? "phone" : null);
        const firstName = result.first_name;
        const lastName = result.last_name;

        const paymentMade = result.payment_made ?? false;

        dispatch(setLogin({ role: "collector", phoneVerified: phoneVerified, emailVerified: emailVerified, applicationId: applicationId, contact: contact, contactType: contactType, firstName: firstName, lastName: lastName, paymentMade: paymentMade }));

        if ((contactType === "phone" && !phoneVerified) || (contactType === "email" && !emailVerified)) {
          console.log(
            "Login Page - Redirecting to verification page as contact info is not verified.",
          )
          toast.error("Please verify your contact information to proceed.")
          dispatch(setField({ field: "firstName", value: firstName }));
          dispatch(setField({ field: "lastName", value: lastName }));
          dispatch(setField({ field: "contact", value: contact }));
          dispatch(setField({ field: "contactType", value: contactType }));
          dispatch(setField({ field: "applicationId", value: applicationId }));

          // Persist data to localStorage for page reloads
          localStorage.setItem("onehealth_application_id", applicationId);
          localStorage.setItem("onehealth_contact_type", contactType);
          localStorage.setItem("onehealth_contact", contact || "");
          localStorage.setItem("onehealth_first_name", firstName || "");
          localStorage.setItem("onehealth_last_name", lastName || "");

          router.push("/signup/collector/verify");
        } else if (!paymentMade) {
          console.log("Login Page - Redirecting to payment page as payment is not made.");
          toast.error("Please complete the payment to proceed.");
          // router.push(`/signup/collector/payment?application=${applicationId}`);
          router.push("/collector/dashboard");
        } else {
          console.log("Login Page - Redirecting to dashboard.")
          router.push("/collector/dashboard")
        }

      } else {
        // Simulate login and redirect based on role for other roles
        switch (role) {
          case "admin":
            if (!visitorId) {
              toast.error("Visitor ID not generated. Please try again.")
              return
            }

            const isEmail = loginData.username.includes("@")
            const payload = {
              [isEmail ? "email" : "phone"]: loginData.username,
              password: loginData.password,
              account_type: "admin",
            }
            try {

              const apiUrl = process.env.NEXT_PUBLIC_API_URL;
              const response = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Visitor-ID": visitorId,
                  "X-CSRFToken": getCookie("csrftoken") || "",
                },
                body: JSON.stringify({
                  ...payload,
                }),
                credentials: "include",
              });

              const result = await response.json();

              if (!response.ok) {
                if (result.message) {
                  toast.error(result.message);
                } else if (result.errors) {
                  Object.entries(result.errors).forEach(([field, errors]) => {
                    const errorMessages = (errors as string[]).join(" ");
                    toast.error(`${field}: ${errorMessages}`);
                  });
                } else {
                  toast.error("An unknown error occurred during admin login.");
                }
                return;
              }

              toast.success(result.message || "Admin login successful!");
              dispatch(setLogin({ role: "admin", phoneVerified: true, emailVerified: true, applicationId: result.id, contact: result.email || result.phone, contactType: result.email ? "email" : "phone", firstName: result.first_name, lastName: result.last_name, paymentMade: true }));
              router.push("/admin/dashboard");
            } catch (error) {
              console.error("Admin Login Error:", error);
              toast.error("An unexpected error occurred during admin login. Please try again later.");
            }
            break;
          case "public":
            const isEmailPublic = loginData.username.includes("@")
            const payloadPublic = {
              [isEmailPublic ? "email" : "phone"]: loginData.username,
              password: loginData.password,
              account_type: "public",
            }
            try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL;
              const response = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": getCookie("csrftoken") || "",
                  "X-Visitor-ID": visitorId || "",
                },
                body: JSON.stringify({
                  ...payloadPublic,
                  account_type: "public",
                }),
                credentials: "include",
              });

              const result = await response.json();

              if (!response.ok) {
                if (result.message) {
                  toast.error(result.message);
                } else if (result.errors) {
                  Object.entries(result.errors).forEach(([field, errors]) => {
                    const errorMessages = (errors as string[]).join(" ");
                    toast.error(`${field}: ${errorMessages}`);
                  });
                } else {
                  toast.error("An unknown error occurred during public user login.");
                }
                return;
              }

              toast.success(result.message || "Public user login successful!");
              dispatch(setLogin({ role: "public", phoneVerified: result.phone_verified ?? false, emailVerified: result.email_verified ?? false, applicationId: result.id, contact: result.email || result.phone, contactType: result.email ? "email" : "phone", firstName: result.first_name, lastName: result.last_name, paymentMade: result.payment_made ?? false }));
              if (authData.isAuthenticated && !authData.allowLoginAccessWhileAuthenticated) {
                router.push("/user/dashboard");
              }

            } catch (error) {
              console.error("Public User Login Error:", error);
              toast.error("An unexpected error occurred during public user login. Please try again later.");
            }
            break;
        }
      }
    } catch (error) {
      console.error("Login Error (top-level):", error);
      toast.error("An unexpected error occurred during login. Please try again later.");
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Form Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (signUpData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }
    if (!signUpData.contactInfo) {
      toast.error("Please provide a phone number or email address")
      return
    }

    // 2. Prepare API Payload
    const isEmail = signUpData.contactInfo.includes("@")
    const payload = {
      first_name: signUpData.firstName,
      last_name: signUpData.lastName,
      password: signUpData.password,
      confirm_password: signUpData.confirmPassword,
      [isEmail ? "email" : "phone"]: signUpData.contactInfo,
    }

    // 3. API Call
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/accounts/register?identity=DataCollector&for_account=self`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle API errors (e.g., validation errors)
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            const errorMessages = (errors as string[]).join(" ");
            toast.error(`${field}: ${errorMessages}`);
          });
        } else {
          toast.error("An unknown error occurred.");
        }
        return
      }

      // 4. Handle Success
      toast.success(result.message || "Registration successful! Redirecting to verify...")

      // Redirect to a verification page, passing user identifier
      const { contact, contact_type, application_id, first_name, last_name } = result.data

      dispatch(setField({ field: "firstName", value: first_name }))
      dispatch(setField({ field: "lastName", value: last_name }))
      dispatch(setField({ field: "contact", value: contact }))
      dispatch(setField({ field: "contactType", value: contact_type }))
      dispatch(setField({ field: "applicationId", value: application_id }))

      localStorage.setItem("onehealth_application_id", application_id);
      localStorage.setItem("onehealth_contact_type", contact_type);
      localStorage.setItem("onehealth_contact", contact);
      localStorage.setItem("signupState", JSON.stringify({
        firstName: first_name,
        lastName: last_name,
        contact: contact,
        contactType: contact_type,
        applicationId: application_id,
        // Other signup fields that need to be persisted
        contactInfo: signUpData.contactInfo,
        password: signUpData.password,
        confirmPassword: signUpData.confirmPassword,
        verified: false, // Initial state for verification
      }));

      router.push(`/signup/collector/verify?applicationId=${application_id}`);

    } catch (error) {
      // Handle network or other unexpected errors
      console.error("Signup Error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    }
  }

  const resetLoginData = () => {
    setLoginData({
      username: "",
      password: "",
    })
  }

  const resetSignUpData = () => {
    dispatch(resetSignup())
  }

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp)
    resetLoginData()
    resetSignUpData()
  }

  const roles = [
    {
      id: "admin",
      title: "Super Admin",
      description: "System administration and oversight",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      id: "collector",
      title: "Data Collector",
      description: "Register users and manage data",
      icon: UserCheck,
      color: "bg-blue-500",
    },
    {
      id: "public",
      title: "Public User",
      description: "Access your health card and records",
      icon: Users,
      color: "bg-green-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Choose your role to continue</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle>Login to OneHealth</CardTitle>
            <CardDescription>Select your role and enter your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeRole} onValueChange={setActiveRole} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                {roles.map((role) => (
                  <TabsTrigger
                    key={role.id}
                    value={role.id}
                    className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <role.icon className="h-4 w-4 mr-1" />
                    {role.title.split(" ")[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              

              {roles.map((role) => {
                if (role.id === "collector") {
                  return (
                    <TabsContent key="collector" value="collector">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserCheck className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Data Collector</h3>
                          <p className="text-sm text-gray-600">Register users and manage data</p>
                        </div>

                        {!isSignUp ? (
                          // Login Form
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault()
                              await handleLogin("collector")
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="username-collector">Username</Label>
                              <Input
                                id="username-collector"
                                type="text"
                                placeholder="Enter your username"
                                value={loginData.username}
                                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="password-collector">Password</Label>
                              <Input
                                id="password-collector"
                                type="password"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                              Login as Data Collector
                            </Button>

                            <div className="text-center mt-4">
                              <button
                                type="button"
                                onClick={toggleSignUp}
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                              >
                                Don't have an account? Sign up here
                              </button>
                            </div>
                          </form>
                        ) : (
                          // Sign Up Form
                          <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                  id="firstName"
                                  type="text"
                                  value={signUpData.firstName}
                                  onChange={handleInputChange}
                                  placeholder="Enter first name"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                  id="lastName"
                                  type="text"
                                  value={signUpData.lastName}
                                  onChange={handleInputChange}
                                  placeholder="Enter last name"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="contactInfo">Phone Number or Email Address *</Label>
                              <Input
                                id="contactInfo"
                                type="text"
                                value={signUpData.contactInfo}
                                onChange={handleInputChange}
                                placeholder="Enter phone number or email address"
                                required
                              />
                            </div>

                            

                            <div>
                              <Label htmlFor="password">Password *</Label>
                              <Input
                                id="password"
                                type="password"
                                value={signUpData.password}
                                onChange={handleInputChange}
                                placeholder="Enter password (min 6 characters)"
                                required
                                minLength={6}
                              />
                            </div>

                            <div>
                              <Label htmlFor="confirmPassword">Confirm Password *</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={signUpData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                required
                                minLength={6}
                              />
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                              Continue to Verification
                            </Button>

                            <div className="text-center mt-4">
                              <button
                                type="button"
                                onClick={toggleSignUp}
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                              >
                                Already have an account? Login here
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="text-center mt-4">
                          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                            Forgot Password?
                          </Link>
                        </div>
                      </motion.div>
                    </TabsContent>
                  )
                }
                return (
                  <TabsContent key={role.id} value={role.id}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center mb-6">
                        <div
                          className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                        >
                          <role.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{role.title}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleLogin(role.id)
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor={`username-${role.id}`}>Username</Label>
                          <Input
                            id={`username-${role.id}`}
                            type="text"
                            placeholder="Enter your username"
                            value={loginData.username}
                            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`password-${role.id}`}>Password</Label>
                          <Input
                            id={`password-${role.id}`}
                            type="password"
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          Login as {role.title}
                        </Button>
                      </form>

                      <div className="text-center mt-4">
                        <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                          Forgot Password?
                        </Link>
                      </div>
                    </motion.div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}