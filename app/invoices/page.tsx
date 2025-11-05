"use client";

"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchInvoices } from "@/lib/features/invoice/invoiceSlice";
import { fetchCustomers } from "@/lib/features/customer/customerSlice";
import { fetchVehicles } from "@/lib/features/vehicle/vehicleSlice";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import InvoicesTable from "@/components/invoices/invoices-table";
import InvoiceFormDrawer from "@/components/invoices/invoice-form-dialog";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Download, FileDown, X } from "lucide-react";
import type { Invoice } from "@/lib/features/invoice/invoiceSlice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function InvoicesPage() {
  const dispatch = useAppDispatch();
  const { invoices, isLoading, pagination } = useAppSelector(
    (state) => state.invoice
  );
  const { customers } = useAppSelector((state) => state.customer);
  const { vehicles } = useAppSelector((state) => state.vehicle);

  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Filter states
  const [filterCustomer, setFilterCustomer] = useState<string>("");
  const [filterVehicle, setFilterVehicle] = useState<string>("");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");

  useEffect(() => {
    console.log("Fetching invoices with filters:", {
      page: currentPage,
      filterCustomer,
      filterVehicle,
      filterFromDate,
      filterToDate,
    });

    dispatch(
      fetchInvoices({
        page: currentPage,
        limit: 10,
        customerId: filterCustomer,
        vehicle: filterVehicle,
        fromDate: filterFromDate,
        toDate: filterToDate,
      })
    );
    dispatch(fetchCustomers());
    dispatch(fetchVehicles());
  }, [
    dispatch,
    currentPage,
    filterCustomer,
    filterVehicle,
    filterFromDate,
    filterToDate,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddNew = () => {
    setSelectedInvoice(null);
    setDialogOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedInvoice(null);
    }
  };

  const getCustomerName = (customerId: any) => {
    if (typeof customerId === "string") return "";
    return customerId?.name || "";
  };

  const calculateTotal = (invoice: Invoice) => {
    return invoice.rows.reduce((sum, row) => sum + row.total, 0);
  };

  const clearFilters = () => {
    setFilterCustomer("");
    setFilterVehicle("");
    setFilterFromDate("");
    setFilterToDate("");
    setCurrentPage(1); // Reset to first page
  };

  const hasActiveFilters =
    filterCustomer || filterVehicle || filterFromDate || filterToDate;

  // Export invoices to CSV
  const handleExportCSV = () => {
    const headers = [
      "Invoice ID",
      "Invoice No",
      "Date",
      "Customer",
      "From",
      "To",
      "Taluka",
      "District",
      "Consignor",
      "Consignee",
      "Product",
      "Truck No",
      "Articles",
      "Weight",
      "Rate",
      "CGST/SGST",
      "Row Total",
      "Status",
      "Remarks",
      "Grand Total",
    ];

    const rows: string[][] = [];

    invoices.forEach((invoice) => {
      const customerName =
        getCustomerName(invoice.customerId) || invoice.customerName || "";
      const grandTotal = calculateTotal(invoice);

      // Add a row for each product/item in the invoice
      invoice.rows.forEach((row, index) => {
        rows.push([
          index === 0 ? invoice.invoiceId : "", // Invoice ID only on first row
          index === 0 ? invoice.invoiceNo : "", // Invoice No only on first row
          index === 0 ? new Date(invoice.date).toLocaleDateString() : "",
          index === 0 ? customerName : "",
          index === 0 ? invoice.from : "",
          index === 0 ? invoice.to : "",
          index === 0 ? invoice.taluka : "",
          index === 0 ? invoice.dist : "",
          index === 0 ? invoice.consignor : "",
          index === 0 ? invoice.consignee : "",
          row.product,
          row.truckNo,
          row.articles,
          row.weight.toString(),
          row.rate.toString(),
          row.cgstSgst?.toString() || "0",
          row.total.toFixed(2),
          index === 0 ? invoice.status : "",
          row.remarks || "",
          index === 0 ? grandTotal.toFixed(2) : "",
        ]);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `invoices-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!viewingInvoice) {
      console.error("No invoice to download");
      return;
    }

    try {
      // Wait for dialog to be fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      const element = document.getElementById("invoice-pdf");
      if (!element) {
        console.error("Invoice element not found in DOM");
        alert("Invoice not ready. Please try again.");
        return;
      }

      console.log("Generating PDF for invoice:", viewingInvoice.invoiceId);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        ignoreElements: (element) => {
          // Ignore elements that might have unsupported CSS
          return element.classList?.contains("dialog") || false;
        },
        onclone: (clonedDoc) => {
          // Remove all external stylesheets to avoid unsupported CSS
          const styleSheets = clonedDoc.querySelectorAll(
            'link[rel="stylesheet"]'
          );
          styleSheets.forEach((sheet) => sheet.remove());

          // Remove style tags that might contain unsupported CSS functions
          const styleTags = clonedDoc.querySelectorAll("style");
          styleTags.forEach((tag) => {
            if (
              tag.textContent?.includes("lab(") ||
              tag.textContent?.includes("oklch(") ||
              tag.textContent?.includes("color-mix(")
            ) {
              tag.remove();
            }
          });
        },
      });

      console.log("Canvas created:", canvas.width, "x", canvas.height);

      const imgData = canvas.toDataURL("image/png");

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to fit page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / (imgWidth / 2.83); // Convert px to mm (96 DPI)
      const scaledHeight = (imgHeight / 2.83) * ratio;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);

      const filename = `Invoice-${viewingInvoice.invoiceId}.pdf`;
      console.log("Saving PDF as:", filename);
      pdf.save(filename);

      console.log("PDF download initiated successfully");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      console.error("Error details:", error.message, error.stack);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            <p className="text-muted-foreground">
              Manage your transport invoices and billing
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Customer</label>
              <Select
                value={filterCustomer || "__all__"}
                onValueChange={(value) =>
                  setFilterCustomer(value === "__all__" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Vehicle</label>
              <Select
                value={filterVehicle || "__all__"}
                onValueChange={(value) =>
                  setFilterVehicle(value === "__all__" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All vehicles</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle._id} value={vehicle.vehicleNumber}>
                      {vehicle.vehicleNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                From Date
              </label>
              <Input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              Showing {pagination?.total || 0} invoice(s)
            </div>
          )}
        </div>

        {isLoading && invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? "No invoices match the selected filters"
                : "No invoices found"}
            </p>
          </div>
        ) : (
          <InvoicesTable
            invoices={invoices}
            onEdit={handleEdit}
            onView={handleView}
            currentPage={pagination?.page || 1}
            totalPages={pagination?.totalPages || 1}
            onPageChange={handlePageChange}
          />
        )}

        <InvoiceFormDrawer
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          invoice={selectedInvoice}
        />

        {/* View Invoice Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Invoice - {viewingInvoice?.invoiceId}</DialogTitle>
                <Button onClick={handleDownloadPDF} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogHeader>
            {viewingInvoice && (
              <div>
                <InvoicePDF invoice={viewingInvoice} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
