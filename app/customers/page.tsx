"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCustomers } from "@/lib/features/customer/customerSlice";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import CustomersTable from "@/components/customers/customers-table";
import CustomerFormDialog from "@/components/customers/customer-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Customer } from "@/lib/features/customer/customerSlice";

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const { customers, isLoading } = useAppSelector((state) => state.customer);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedCustomer(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">
              Manage your customer database with GSTIN information
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {isLoading && customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        ) : (
          <CustomersTable customers={customers} onEdit={handleEdit} />
        )}

        <CustomerFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          customer={selectedCustomer}
        />
      </div>
    </DashboardLayout>
  );
}
