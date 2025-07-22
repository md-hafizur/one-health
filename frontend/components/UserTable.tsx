"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Eye, MoreHorizontal, CreditCard, FileText } from "lucide-react";
import { LoadingScreen } from "@/app/LoadingScreen";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roleName: string;
  is_active: boolean;
  payment_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  addBy: string;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  roleFilter: string;
  paymentStatusFilter: string;
  verificationStatusFilter: string;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  handlePayNow: (user: User) => void;
  handleVerifyClick: (user: User) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setRoleFilter: (value: string) => void;
  setPaymentStatusFilter: (value: string) => void;
  setVerificationStatusFilter: (value: string) => void;
}

const UserTable: React.FC<UserTableProps> = React.memo(
  ({
    users,
    loading,
    currentPage,
    totalPages,
    searchTerm,
    roleFilter,
    paymentStatusFilter,
    verificationStatusFilter,
    setCurrentPage,
    handlePayNow,
    handleVerifyClick,
    handleSearchChange,
    setRoleFilter,
    setPaymentStatusFilter,
    setVerificationStatusFilter,
  }) => {
    const filteredUsers = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    return (
      <>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="public">Public User</SelectItem>
              <SelectItem value="collector">Data Collector</SelectItem>
              <SelectItem value="subUser">Sub User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verificationStatusFilter} onValueChange={setVerificationStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Verification Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verification Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingScreen />
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Initiator</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.roleName === "dataCollector"
                            ? "bg-blue-50 text-blue-700"
                            : user.roleName === "public"
                            ? "bg-green-50 text-green-700"
                            : user.roleName === "subUser"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-purple-50 text-purple-700"
                        }
                      >
                        {user.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-800">{user.email}</p>
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.is_active ? "default" : "secondary"}
                        className={
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.payment_status !== "N/A" && (
                        <Badge
                          variant={user.payment_status === "Paid" ? "default" : "secondary"}
                          className={
                            user.payment_status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {user.payment_status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{user.addBy}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => console.log("View user details")}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          {(!user.email_verified && !user.phone_verified) && user.payment_status === "Pending" && (
                            <DropdownMenuItem
                              onClick={() => handleVerifyClick(user)}
                              disabled={!user.email && !user.phone}
                            >
                              <FileText className="h-4 w-4 mr-2" /> Verify {user.email ? "Email" : "Phone"}
                            </DropdownMenuItem>
                          )}
                          {(user.email_verified || user.phone_verified) && user.payment_status === "Pending" && (
                            <DropdownMenuItem onClick={() => handlePayNow(user)}>
                              <CreditCard className="h-4 w-4 mr-2" /> Pay Now
                            </DropdownMenuItem>
                          )}
                          {(user.email_verified || user.phone_verified) && user.payment_status === "Paid" && (
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" /> Card Issued
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {Array.from({ length: Math.max(0, 10 - filteredUsers.length) }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell colSpan={7} className="h-16"></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </>
    );
  }
);

UserTable.displayName = "UserTable";

export default UserTable;
