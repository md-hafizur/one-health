"use client"

import { useState, useEffect } from "react"
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Eye, Check, X, Clock, UserCheck, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LoadingScreen } from "../app/LoadingScreen"


interface PendingCollector {
  id: string | number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  district: string | null
  upazila: string | null
  nidNumber: string | null
  appliedAt: string
  status: "Pending" | "Approved" | "Rejected"
  paymentStatus: "Paid" | "Pending" | "Failed"
  paidAmount?: number
  approved: boolean
  rejected: boolean
  paidAt?: string | null
}

interface CollectorStats {
  pending_review: number;
  approved: number;
  rejected: number;
}


export function PendingCollectorsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [stats, setStats] = useState<CollectorStats>({ pending_review: 0, approved: 0, rejected: 0 });

  const [pendingCollectors, setPendingCollectors] = useState<PendingCollector[]>([])
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [collectorToReject, setCollectorToReject] = useState<PendingCollector | null>(null)
  const [rejectionContact, setRejectionContact] = useState("")
  const [loading, setLoading] = useState(true) // Add loading state
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await getCurrentBrowserFingerPrint()
      setVisitorId(fp)
    }
    getFingerprint()
  }, [])

  const fetchPendingCollectors = async () => {
    if (!visitorId) return;
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await fetch(`${apiUrl}/data/pending-application-table`, {
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorId,
        },
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: PendingCollector[] = await response.json()
      setPendingCollectors(data)
    } catch (error) {
      console.error("Error fetching pending collectors:", error)
      toast.error("Failed to fetch pending applications.")
    } finally {
      setLoading(false); // Set loading to false after fetching (or error)
    }
  }

  const fetchStats = async () => {
    if (!visitorId) return;
      try {
          const response = await fetch(`${apiUrl}/data/collector-app-statistic`, {
              headers: {
                  "Content-Type": "application/json",
                  "X-Visitor-ID": visitorId,
              },
              credentials: "include",
          });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setStats(data);
      } catch (error) {
          console.error("Error fetching collector stats:", error);
          toast.error("Failed to fetch collector statistics.");
      }
  };

  useEffect(() => {
    fetchPendingCollectors();
    fetchStats();
}, [visitorId, apiUrl]);

  const handleApprove = async (collector: PendingCollector) => {
    if (!visitorId) return;
    try {
      const response = await fetch(`${apiUrl}/auth/approve-reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorId,
        },
        credentials: "include",
        body: JSON.stringify({ id: collector.id, approved: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.status === 'error' && errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      toast.success(`${collector.firstName} ${collector.lastName} has been approved as a data collector!`);
      fetchPendingCollectors();
      fetchStats();
    } catch (error) {
      console.error("Error approving collector:", error);
      toast.error("Failed to approve collector.");
    }
  };

  const handleReject = (collector: PendingCollector) => {
    setCollectorToReject(collector);
    setRejectionContact(""); // Initialize as empty string
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!collectorToReject || !visitorId) return;

    try {
      const response = await fetch(`${apiUrl}/auth/approve-reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-ID": visitorId,
        },
        credentials: "include",
        body: JSON.stringify({ id: collectorToReject.id, rejected: true, contact: rejectionContact }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.status === 'error' && errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      toast.error(`${collectorToReject.firstName} ${collectorToReject.lastName}'s application has been rejected.`);
      setIsRejectModalOpen(false);
      setCollectorToReject(null);
      setRejectionContact("");
      fetchPendingCollectors();
      fetchStats();
    } catch (error) {
      console.error("Error rejecting collector:", error);
      toast.error("Failed to reject collector.");
    }
  };

  const filteredCollectors = pendingCollectors.filter(
    (collector) =>
      collector.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.id.toString().includes(searchTerm.toLowerCase()),
  )

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-blue-600" />
          Pending Collector Applications
        </CardTitle>
        <CardDescription>Review and approve data collector applications</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollectors.map((collector) => (
                <TableRow key={collector.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {getInitials(collector.firstName, collector.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-800">
                          {collector.firstName} {collector.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{collector.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-800">{collector.email}</p>
                      <p className="text-sm text-gray-600">{collector.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-800">{collector.district}</p>
                      <p className="text-sm text-gray-600">{collector.upazila}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{collector.appliedAt}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(collector.status)}>
                      {collector.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                      {collector.status === "Approved" && <Check className="h-3 w-3 mr-1" />}
                      {collector.status === "Rejected" && <X className="h-3 w-3 mr-1" />}
                      {collector.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge
                        variant="outline"
                        className={
                          collector.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-800"
                            : collector.paymentStatus === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {collector.paymentStatus}
                      </Badge>
                      {collector.paidAmount && <p className="text-xs text-gray-500 mt-1">৳{collector.paidAmount}</p>}
                    </div>
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
                        {!collector.approved && !collector.rejected && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleApprove(collector)}
                              className="cursor-pointer"
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReject(collector)}
                              className="cursor-pointer"
                            >
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {collector.approved && (
                          <DropdownMenuItem
                            onClick={() => handleReject(collector)}
                            className="cursor-pointer"
                          >
                            Reject
                          </DropdownMenuItem>
                        )}
                        {collector.rejected && (
                          <DropdownMenuItem
                            onClick={() => handleApprove(collector)}
                            className="cursor-pointer"
                          >
                            Approve
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending_review}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </CardContent>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this data collector’s application? To proceed, please provide the <strong>{collectorToReject?.email || collectorToReject?.phone || 'contact'}</strong> used by the applicant. Enter the contact below to confirm the rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                {collectorToReject?.email ? "Contact Email" : (collectorToReject?.phone ? "Contact Phone" : "Contact")}
              </Label>
              <Input
                id="contact"
                type={collectorToReject?.email ? "email" : (collectorToReject?.phone ? "tel" : "text")}
                placeholder={collectorToReject?.email ? "Enter email..." : (collectorToReject?.phone ? "Enter phone number..." : "Enter contact...")}
                value={rejectionContact}
                onChange={(e) => setRejectionContact(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                autoComplete="off"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmReject} disabled={!rejectionContact}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}