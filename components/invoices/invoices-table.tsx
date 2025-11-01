"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { deleteInvoice } from "@/lib/features/invoice/invoiceSlice";
import { Pencil, Trash2, Eye } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Invoice } from "@/lib/features/invoice/invoiceSlice";

interface InvoicesTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function InvoicesTable({
  invoices,
  onEdit,
  onView,
  currentPage,
  totalPages,
  onPageChange,
}: InvoicesTableProps) {
  const dispatch = useAppDispatch();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setDeletingId(id);
      await dispatch(deleteInvoice(id));
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Unpaid":
        return "bg-red-100 text-red-700";
      case "Partially Paid":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const calculateTotal = (invoice: Invoice) => {
    return invoice.rows.reduce((sum, row) => sum + row.total, 0);
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">
          No invoices found. Create your first invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>From → To</TableHead>
              <TableHead>LR No</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell className="font-medium">
                  {invoice.invoiceId}
                </TableCell>
                <TableCell>{formatDate(invoice.date)}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell className="text-sm">
                  {invoice.from} → {invoice.to}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {invoice.invoiceNo}
                </TableCell>
                <TableCell className="font-semibold">
                  ₹{calculateTotal(invoice).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(invoice)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(invoice)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(invoice._id)}
                      disabled={deletingId === invoice._id}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
