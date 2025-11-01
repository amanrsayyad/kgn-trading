"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchInvoices } from "@/lib/features/invoice/invoiceSlice";
import { fetchCustomers } from "@/lib/features/customer/customerSlice";
import { fetchVehicles } from "@/lib/features/vehicle/vehicleSlice";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Truck, IndianRupee, TrendingUp, Package } from "lucide-react";

export default function Home() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { invoices } = useAppSelector((state) => state.invoice);
  const { customers } = useAppSelector((state) => state.customer);
  const { vehicles } = useAppSelector((state) => state.vehicle);

  useEffect(() => {
    dispatch(fetchInvoices({ page: 1, limit: 100 }));
    dispatch(fetchCustomers());
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Calculate statistics
  const totalRevenue = invoices.reduce((sum, invoice) => {
    const invoiceTotal = invoice.rows.reduce((rowSum, row) => rowSum + row.total, 0);
    return sum + invoiceTotal;
  }, 0);

  const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
  const unpaidInvoices = invoices.filter((inv) => inv.status === "Unpaid");
  const partiallyPaidInvoices = invoices.filter((inv) => inv.status === "Partially Paid");

  const paidRevenue = paidInvoices.reduce((sum, invoice) => {
    const invoiceTotal = invoice.rows.reduce((rowSum, row) => rowSum + row.total, 0);
    return sum + invoiceTotal;
  }, 0);

  const pendingRevenue = totalRevenue - paidRevenue;

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: "Total Invoices",
      value: invoices.length.toString(),
      description: `${paidInvoices.length} paid, ${unpaidInvoices.length} pending`,
      icon: FileText,
    },
    {
      title: "Total Customers",
      value: customers.length.toString(),
      description: "Active customers",
      icon: Users,
    },
    {
      title: "Total Vehicles",
      value: vehicles.length.toString(),
      description: "Fleet size",
      icon: Truck,
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      description: `₹${pendingRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} pending`,
      icon: IndianRupee,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Unpaid":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Partially Paid":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCustomerName = (customerId: any) => {
    if (typeof customerId === "string") return "";
    return customerId?.name || "";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your transport business.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Latest {recentInvoices.length} invoices from your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No invoices yet. Create your first invoice to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentInvoices.map((invoice) => {
                    const total = invoice.rows.reduce((sum, row) => sum + row.total, 0);
                    const customerName = getCustomerName(invoice.customerId) || invoice.customerName;
                    
                    return (
                      <div key={invoice._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{invoice.invoiceId}</p>
                          <p className="text-xs text-muted-foreground">
                            {customerName} • {formatDate(invoice.date)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.from} → {invoice.to}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-semibold text-sm">₹{total.toLocaleString('en-IN')}</p>
                          <Badge className={getStatusColor(invoice.status)} variant="secondary">
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Payment status breakdown.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Paid</span>
                  <span className="text-sm font-bold text-green-600">
                    ₹{paidRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{paidInvoices.length} invoices</span>
                  <span>
                    {totalRevenue > 0 ? ((paidRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: totalRevenue > 0 ? `${(paidRevenue / totalRevenue) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending</span>
                  <span className="text-sm font-bold text-red-600">
                    ₹{pendingRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{unpaidInvoices.length + partiallyPaidInvoices.length} invoices</span>
                  <span>
                    {totalRevenue > 0 ? ((pendingRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-sm font-bold">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Invoices</span>
                  <span className="text-sm font-bold">{invoices.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
