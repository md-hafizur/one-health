"use client"

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

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState("public")
  const router = useRouter()

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

              {roles.map((role) => (
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
                        <Input id={`username-${role.id}`} type="text" placeholder="Enter your username" required />
                      </div>
                      <div>
                        <Label htmlFor={`password-${role.id}`}>Password</Label>
                        <Input id={`password-${role.id}`} type="password" placeholder="Enter your password" required />
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
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
