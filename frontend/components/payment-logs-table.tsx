"use client"
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Download } from "lucide-react"
import { LoadingScreen } from "../app/LoadingScreen"

import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js"

interface PaymentLog {
  id: number
  payment_id: string
  user: string
  amount: string
  method: string
  status: string
  date: string
  message: string
}

export function PaymentLogsTable() {
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([])
  const [count, setCount] = useState(0)
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [previousPage, setPreviousPage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // Add loading state

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await getCurrentBrowserFingerPrint()
      setVisitorId(fp)
    }
    getFingerprint()
  }, [])

  useEffect(() => {
    const fetchPaymentLogs = async () => {
      if (!visitorId) return
      setLoading(true) // Set loading to true before fetching
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(
          `${apiUrl}/data/payment-log-table?page=${currentPage}&page_size=${pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Visitor-ID": visitorId,
            },
            credentials: "include",
          }
        )
        if (!response.ok) {
          throw new Error("Failed to fetch payment logs")
        }
        const data = await response.json()
        setPaymentLogs(data.results)
        setCount(data.count)
        setNextPage(data.next)
        setPreviousPage(data.previous)
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(`Error fetching payment logs: ${error.message}`)
        }
      } finally {
        setLoading(false) // Set loading to false after fetching (or error)
      }
    }
    fetchPaymentLogs()
  }, [currentPage, pageSize, visitorId])

  const handlePreviousPage = () => {
    if (previousPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (nextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const totalPages = Math.ceil(count / pageSize)

  const convertToCSV = (data: PaymentLog[]) => {
    const headers = Object.keys(data[0]) as (keyof PaymentLog)[];
    const rows = data.map(obj => headers.map(header => obj[header]).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const handleDownloadRecord = (payment: PaymentLog) => {
    const csvString = convertToCSV([payment]);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_log_${payment.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Payment log ${payment.payment_id} downloaded.`);
  };

  if (loading) {
    return <LoadingScreen />; // Render LoadingScreen when loading
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentLogs.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-800">{payment.payment_id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-800">{payment.user}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{payment.amount}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      payment.method === "bkash"
                        ? "bg-pink-50 text-pink-700"
                        : "bg-orange-50 text-orange-700"
                    }
                  >
                    {payment.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={payment.status === "completed" ? "default" : "secondary"}
                    className={
                      payment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {new Date(payment.date).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDownloadRecord(payment)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePreviousPage}
            disabled={!previousPage}
            variant="outline"
          >
            Previous
          </Button>
          <Button onClick={handleNextPage} disabled={!nextPage} variant="outline">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
