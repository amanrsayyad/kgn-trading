"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { deleteCustomer } from "@/lib/features/customer/customerSlice";
import { Pencil, Trash2 } from "lucide-react";
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
import type { Customer } from "@/lib/features/customer/customerSlice";

interface CustomersTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
}

export default function CustomersTable({
  customers,
  onEdit,
}: CustomersTableProps) {
  const dispatch = useAppDispatch();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setDeletingId(id);
      await dispatch(deleteCustomer(id));
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">
          No customers found. Add your first customer to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer._id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {customer.gstin}
                </Badge>
              </TableCell>
              <TableCell>
                {customer.products && customer.products.length > 0 ? (
                  <div className="space-y-1">
                    {customer.products.map((product, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">
                          {product.productName}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          - ₹{product.productRate}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No products
                  </span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(customer.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(customer._id)}
                    disabled={deletingId === customer._id}
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
  );
}
