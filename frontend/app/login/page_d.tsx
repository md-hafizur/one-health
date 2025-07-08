"use client"

import type React from "react"

import { useState } from "react"
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

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState("public")
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)

  // Controlled state for login forms
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  // Controlled state for signup form
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    contactInfo: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = (role: string) => {
    // Simulate login and redirect based on role
    switch (role) {
      case "admin":
        router.push("/admin/dashboard")
        break
      case "collector":
        router.push("/collector/dashboard")
        break
      case "public":
        router.push("/user/dashboard")
        break
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
      const userId = result.data.id
      router.push(`/signup/collector/verify?user_id=${userId}`)

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
    setSignUpData({
      firstName: "",
      lastName: "",
      contactInfo: "",
      password: "",
      confirmPassword: "",
    })
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
                            onSubmit={(e) => {
                              e.preventDefault()
                              handleLogin("collector")
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
                                  onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
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
                                  onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
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
                                onChange={(e) => setSignUpData({ ...signUpData, contactInfo: e.target.value })}
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
                                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
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
                                onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
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
