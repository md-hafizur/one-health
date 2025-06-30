"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, ChevronRight, Users, User, Eye, CreditCard, FileText, Shield } from "lucide-react"

interface SubAccount {
  id: string
  name: string
  role: "Child"
  status: "Paid" | "Waiting"
  serviceCode: string
  age?: number
  gender?: string
  registeredAt: string
}

interface PublicAccount {
  id: string
  name: string
  role: "Parent"
  status: "Paid" | "Waiting"
  serviceCode: string
  phone?: string
  email?: string
  registeredAt: string
  subAccounts?: SubAccount[]
}

interface DataCollector {
  id: string
  name: string
  role: "Data Collector"
  status: "Active" | "Inactive"
  phone: string
  email: string
  registeredAt: string
  totalRegistrations: number
  publicAccounts: PublicAccount[]
}

interface CollectorRelationshipViewProps {
  collectors: DataCollector[]
}

export function FamilyRelationshipView({ collectors = [] }: CollectorRelationshipViewProps) {
  const [expandedCollectors, setExpandedCollectors] = useState<Set<string>>(new Set())
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set())

  const toggleCollector = (collectorId: string) => {
    const newExpanded = new Set(expandedCollectors)
    if (newExpanded.has(collectorId)) {
      newExpanded.delete(collectorId)
    } else {
      newExpanded.add(collectorId)
    }
    setExpandedCollectors(newExpanded)
  }

  const toggleFamily = (familyId: string) => {
    const newExpanded = new Set(expandedFamilies)
    if (newExpanded.has(familyId)) {
      newExpanded.delete(familyId)
    } else {
      newExpanded.add(familyId)
    }
    setExpandedFamilies(newExpanded)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Waiting":
        return "bg-yellow-100 text-yellow-800"
      case "Active":
        return "bg-blue-100 text-blue-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Data Collector":
        return "bg-red-100 text-red-800"
      case "Parent":
        return "bg-blue-100 text-blue-800"
      case "Child":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Data Collector":
        return Shield
      case "Parent":
        return Users
      case "Child":
        return User
      default:
        return User
    }
  }

  return (
    <div className="space-y-8">
      {collectors.map((collector) => (
        <motion.div
          key={collector.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Data Collector Container */}
          <Card className="overflow-hidden border-2 border-red-200 hover:border-red-300 transition-colors shadow-lg">
            {/* Data Collector Header */}
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b-2 border-red-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Expand/Collapse Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCollector(collector.id)}
                      className="h-10 w-10 p-0 rounded-full bg-white/70 hover:bg-white/90 shadow-sm"
                    >
                      {expandedCollectors.has(collector.id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </Button>

                    {/* Collector Avatar */}
                    <Avatar className="h-14 w-14 border-3 border-white shadow-md">
                      <AvatarFallback className="bg-red-600 text-white font-bold text-lg">
                        {getInitials(collector.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Collector Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{collector.name}</h2>
                        <Badge variant="outline" className={getRoleColor(collector.role)}>
                          <Shield className="h-4 w-4 mr-1" />
                          {collector.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-mono font-medium">{collector.id}</span>
                        <span>•</span>
                        <span>{collector.phone}</span>
                        <span>•</span>
                        <span>{collector.email}</span>
                        <span>•</span>
                        <span>Joined {collector.registeredAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Collector Stats */}
                    <div className="text-center bg-white/70 rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-red-600">{collector.totalRegistrations}</div>
                      <div className="text-xs text-gray-600">Total Registrations</div>
                    </div>
                    <div className="text-center bg-white/70 rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{collector.publicAccounts.length}</div>
                      <div className="text-xs text-gray-600">Public Accounts</div>
                    </div>

                    {/* Status Badge */}
                    <Badge variant="outline" className={getStatusColor(collector.status)}>
                      {collector.status}
                    </Badge>

                    {/* Actions */}
                    <Button variant="ghost" size="sm" className="bg-white/70 hover:bg-white/90">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Public Accounts (Expandable) */}
              {expandedCollectors.has(collector.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50"
                >
                  {/* Connection Line */}
                  <div className="relative">
                    <div className="absolute left-12 top-0 w-px h-6 bg-red-300"></div>
                  </div>

                  {collector.publicAccounts.map((publicAccount, accountIndex) => (
                    <div key={publicAccount.id} className="relative">
                      {/* Connection Lines */}
                      <div className="absolute left-12 top-0 w-px h-full bg-red-300"></div>
                      <div className="absolute left-12 top-8 w-12 h-px bg-red-300"></div>
                      {accountIndex === collector.publicAccounts.length - 1 && (
                        <div className="absolute left-12 top-8 w-px h-8 bg-gray-50"></div>
                      )}

                      {/* Public Account Card */}
                      <div className="ml-24 mr-6 my-6">
                        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors shadow-md">
                          <CardContent className="p-0">
                            {/* Public Account Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-blue-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {/* Family Expand/Collapse Button */}
                                  {publicAccount.subAccounts && publicAccount.subAccounts.length > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleFamily(publicAccount.id)}
                                      className="h-8 w-8 p-0 rounded-full bg-white/60 hover:bg-white/90"
                                    >
                                      {expandedFamilies.has(publicAccount.id) ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}

                                  {/* Public Account Avatar */}
                                  <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                                      {getInitials(publicAccount.name)}
                                    </AvatarFallback>
                                  </Avatar>

                                  {/* Public Account Info */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-gray-800">{publicAccount.name}</h4>
                                      <Badge variant="outline" className={getRoleColor(publicAccount.role)}>
                                        <Users className="h-3 w-3 mr-1" />
                                        {publicAccount.role}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                      <span className="font-mono">{publicAccount.id}</span>
                                      <span>•</span>
                                      <span className="font-mono">{publicAccount.serviceCode}</span>
                                      {publicAccount.phone && (
                                        <>
                                          <span>•</span>
                                          <span>{publicAccount.phone}</span>
                                        </>
                                      )}
                                      <span>•</span>
                                      <span>Registered {publicAccount.registeredAt}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Sub-account count */}
                                  {publicAccount.subAccounts && publicAccount.subAccounts.length > 0 && (
                                    <div className="text-center bg-white/60 rounded-lg p-2 shadow-sm">
                                      <div className="text-lg font-bold text-purple-600">
                                        {publicAccount.subAccounts.length}
                                      </div>
                                      <div className="text-xs text-gray-600">Children</div>
                                    </div>
                                  )}

                                  {/* Status Badge */}
                                  <Badge variant="outline" className={getStatusColor(publicAccount.status)}>
                                    {publicAccount.status}
                                  </Badge>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {publicAccount.status === "Waiting" ? (
                                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-200">
                                        <CreditCard className="h-4 w-4 mr-1" />
                                        Pay Now
                                      </Button>
                                    ) : (
                                      <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                                        <FileText className="h-4 w-4 mr-1" />
                                        Card Issued
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Sub-Accounts (Expandable) */}
                            {publicAccount.subAccounts &&
                              publicAccount.subAccounts.length > 0 &&
                              expandedFamilies.has(publicAccount.id) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-purple-50/30"
                                >
                                  {/* Connection Line */}
                                  <div className="relative">
                                    <div className="absolute left-8 top-0 w-px h-4 bg-blue-300"></div>
                                  </div>

                                  {publicAccount.subAccounts.map((subAccount, subIndex) => (
                                    <div key={subAccount.id} className="relative">
                                      {/* Connection Lines */}
                                      <div className="absolute left-8 top-0 w-px h-full bg-blue-300"></div>
                                      <div className="absolute left-8 top-6 w-8 h-px bg-blue-300"></div>
                                      {subIndex === publicAccount.subAccounts!.length - 1 && (
                                        <div className="absolute left-8 top-6 w-px h-6 bg-purple-50"></div>
                                      )}

                                      {/* Sub-Account Card */}
                                      <div className="ml-16 mr-4 my-4">
                                        <Card className="border border-purple-200 hover:border-purple-300 transition-colors">
                                          <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                {/* Sub-Account Avatar */}
                                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                  <AvatarFallback className="bg-purple-600 text-white font-semibold text-sm">
                                                    {getInitials(subAccount.name)}
                                                  </AvatarFallback>
                                                </Avatar>

                                                {/* Sub-Account Info */}
                                                <div>
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <h5 className="font-medium text-gray-800">{subAccount.name}</h5>
                                                    <Badge variant="outline" className={getRoleColor(subAccount.role)}>
                                                      <User className="h-3 w-3 mr-1" />
                                                      {subAccount.role}
                                                    </Badge>
                                                  </div>
                                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="font-mono">{subAccount.id}</span>
                                                    <span>•</span>
                                                    <span className="font-mono">{subAccount.serviceCode}</span>
                                                    {subAccount.age && (
                                                      <>
                                                        <span>•</span>
                                                        <span>Age {subAccount.age}</span>
                                                      </>
                                                    )}
                                                    {subAccount.gender && (
                                                      <>
                                                        <span>•</span>
                                                        <span>{subAccount.gender}</span>
                                                      </>
                                                    )}
                                                    <span>•</span>
                                                    <span>Added {subAccount.registeredAt}</span>
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-3">
                                                {/* Status Badge */}
                                                <Badge variant="outline" className={getStatusColor(subAccount.status)}>
                                                  {subAccount.status}
                                                </Badge>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                  <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                  {subAccount.status === "Waiting" ? (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="text-orange-600 border-orange-200"
                                                    >
                                                      <CreditCard className="h-4 w-4 mr-1" />
                                                      Pay Now
                                                    </Button>
                                                  ) : (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="text-green-600 border-green-200"
                                                    >
                                                      <FileText className="h-4 w-4 mr-1" />
                                                      Card Issued
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
