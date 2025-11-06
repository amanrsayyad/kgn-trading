"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createInvoice,
  updateInvoice,
  clearError,
} from "@/lib/features/invoice/invoiceSlice";
import { fetchCustomers } from "@/lib/features/customer/customerSlice";
import { fetchVehicles } from "@/lib/features/vehicle/vehicleSlice";
import { fetchLocations, createLocation } from "@/lib/features/location/locationSlice";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { Invoice, InvoiceRow } from "@/lib/features/invoice/invoiceSlice";
import type { Product } from "@/lib/features/customer/customerSlice";

interface InvoiceFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
}

export default function InvoiceFormDrawer({
  open,
  onOpenChange,
  invoice,
}: InvoiceFormDrawerProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.invoice);
  const { customers, isLoading: customersLoading } = useAppSelector(
    (state) => state.customer
  );
  const { vehicles, isLoading: vehiclesLoading } = useAppSelector(
    (state) => state.vehicle
  );
  const { locations } = useAppSelector((state) => state.location);

  const [customerProducts, setCustomerProducts] = useState<Product[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showAddFromLocation, setShowAddFromLocation] = useState(false);
  const [showAddToLocation, setShowAddToLocation] = useState(false);
  const [newFromLocationName, setNewFromLocationName] = useState("");
  const [newToLocationName, setNewToLocationName] = useState("");

  const generateInvoiceId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `INV-${timestamp}-${random}`;
  };

  const generateInvoiceNo = () => {
    // Generate 4-character random number
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit number (1000-9999)
    return random.toString();
  };

  const [formData, setFormData] = useState({
    invoiceId: "",
    date: new Date().toISOString().split("T")[0],
    from: "",
    to: "",
    taluka: "",
    dist: "",
    customerId: "",
    consignor: "",
    consignee: "",
    invoiceNo: "",
    remarks: "",
    status: "Unpaid" as "Paid" | "Unpaid" | "Partially Paid",
  });

  const [rows, setRows] = useState<InvoiceRow[]>([
    {
      product: "",
      hsnNo: "",
      truckNo: "",
      articles: "bag", // ✅ Default value set to "bag"
      weight: 0,
      rate: 0,
      cgstSgst: 0,
      total: 0,
      remarks: "",
    },
  ]);

  useEffect(() => {
    if (open) {
      setDataLoaded(false);
      Promise.all([
        dispatch(fetchCustomers()),
        dispatch(fetchVehicles()),
        dispatch(fetchLocations()),
      ]).then(() => {
        setDataLoaded(true);
      });
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!dataLoaded || !open) return;

    if (invoice) {
      setFormData({
        invoiceId: invoice.invoiceId,
        date: new Date(invoice.date).toISOString().split("T")[0],
        from: invoice.from,
        to: invoice.to,
        taluka: invoice.taluka,
        dist: invoice.dist,
        customerId:
          typeof invoice.customerId === "string"
            ? invoice.customerId
            : invoice.customerId?._id || "",
        consignor: invoice.consignor,
        consignee: invoice.consignee,
        invoiceNo: invoice.invoiceNo,
        remarks: invoice.remarks || "",
        status: invoice.status,
      });
      setRows(invoice.rows);

      // Load customer products if customer exists and customers are loaded
      if (invoice.customerId && customers.length > 0) {
        const customerId =
          typeof invoice.customerId === "string"
            ? invoice.customerId
            : invoice.customerId._id;
        const selectedCustomer = customers.find((c) => c._id === customerId);
        if (selectedCustomer && selectedCustomer.products) {
          setCustomerProducts(selectedCustomer.products);
        }
      }
    } else {
      setFormData({
        invoiceId: generateInvoiceId(),
        date: new Date().toISOString().split("T")[0],
        from: "",
        to: "",
        taluka: "",
        dist: "",
        customerId: "",
        consignor: "",
        consignee: "",
        invoiceNo: generateInvoiceNo(),
        remarks: "",
        status: "Unpaid",
      });
      setRows([
        {
          product: "",
          hsnNo: "",
          truckNo: "",
          articles: "bag", // ✅ Default value set to "bag"
          weight: 0,
          rate: 0,
          cgstSgst: 0,
          total: 0,
          remarks: "",
        },
      ]);
      setCustomerProducts([]);
    }
    dispatch(clearError());
  }, [invoice, dispatch, open, customers, dataLoaded]);

  const handleCustomerChange = (customerId: string) => {
    // Find selected customer
    const selectedCustomer = customers.find((c) => c._id === customerId);

    if (selectedCustomer) {
      // Auto-populate taluka, district, consignor, and consignee from customer
      setFormData({
        ...formData,
        customerId,
        taluka: selectedCustomer.taluka || "",
        dist: selectedCustomer.district || "",
        consignor:
          selectedCustomer.consignors && selectedCustomer.consignors.length > 0
            ? selectedCustomer.consignors[0]
            : "",
        consignee: selectedCustomer.name, // ✅ Auto-fill consignee with customer name
      });

      // Set customer products
      if (selectedCustomer.products) {
        setCustomerProducts(selectedCustomer.products);
      } else {
        setCustomerProducts([]);
      }
    } else {
      setFormData({ ...formData, customerId });
      setCustomerProducts([]);
    }
  };

  const handleProductChange = (index: number, productName: string) => {
    const newRows = [...rows];
    newRows[index].product = productName;

    // Find product rate and auto-fill
    const selectedProduct = customerProducts.find(
      (p) => p.productName === productName
    );
    if (selectedProduct) {
      newRows[index].rate = selectedProduct.productRate;
      // Recalculate total
      const weight = newRows[index].weight;
      const rate = selectedProduct.productRate;
      const cgstSgst = newRows[index].cgstSgst;
      const subtotal = weight * rate;
      newRows[index].total = subtotal + cgstSgst;
    }

    setRows(newRows);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRowChange = (
    index: number,
    field: keyof InvoiceRow,
    value: string | number
  ) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };

    // Auto-calculate total if weight, rate, or CGST/SGST changes
    if (field === "weight" || field === "rate" || field === "cgstSgst") {
      const weight = field === "weight" ? Number(value) : newRows[index].weight;
      const rate = field === "rate" ? Number(value) : newRows[index].rate;
      const cgstSgst =
        field === "cgstSgst" ? Number(value) : newRows[index].cgstSgst;
      const subtotal = weight * rate;
      newRows[index].total = subtotal + cgstSgst;
    }

    setRows(newRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        product: "",
        hsnNo: "",
        truckNo: "",
        articles: "bag", // ✅ Default value set to "bag"
        weight: 0,
        rate: 0,
        cgstSgst: 0,
        total: 0,
        remarks: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invoicePayload = {
      ...formData,
      rows,
    };

    const result = invoice
      ? await dispatch(
          updateInvoice({ id: invoice._id, invoiceData: invoicePayload as any })
        )
      : await dispatch(createInvoice(invoicePayload as any));

    if (
      (invoice && updateInvoice.fulfilled.match(result)) ||
      (!invoice && createInvoice.fulfilled.match(result))
    ) {
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[98vh] flex flex-col">
        <div className="mx-auto w-full max-w-6xl flex flex-col flex-1 overflow-hidden">
          <DrawerHeader>
            <DrawerTitle>
              {invoice ? "Edit Invoice" : "Create New Invoice"}
            </DrawerTitle>
            <DrawerDescription>
              {invoice
                ? "Update invoice information"
                : "Enter invoice details and line items"}
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {error && (
              <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {!dataLoaded && invoice ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Loading invoice data...
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium">
                        Invoice ID *
                      </label>
                      <Input
                        name="invoiceId"
                        value={formData.invoiceId}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Date *</label>
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full"
                        max="9999-12-31"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status *</label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Partially Paid">
                            Partially Paid
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium">From *</label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.from}
                          onValueChange={(value) =>
                            setFormData({ ...formData, from: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem
                                key={location._id}
                                value={location.name}
                              >
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddFromLocation(!showAddFromLocation)}
                        >
                          +
                        </Button>
                      </div>
                      {showAddFromLocation && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={newFromLocationName}
                            onChange={(e) => setNewFromLocationName(e.target.value)}
                            placeholder="Enter new location name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              if (newFromLocationName.trim()) {
                                await dispatch(createLocation({ name: newFromLocationName.trim() }));
                                setFormData({ ...formData, from: newFromLocationName.trim() });
                                setNewFromLocationName("");
                                setShowAddFromLocation(false);
                                // Refresh locations
                                dispatch(fetchLocations());
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">To *</label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.to}
                          onValueChange={(value) =>
                            setFormData({ ...formData, to: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem
                                key={location._id}
                                value={location.name}
                              >
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddToLocation(!showAddToLocation)}
                        >
                          +
                        </Button>
                      </div>
                      {showAddToLocation && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={newToLocationName}
                            onChange={(e) => setNewToLocationName(e.target.value)}
                            placeholder="Enter new location name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              if (newToLocationName.trim()) {
                                await dispatch(createLocation({ name: newToLocationName.trim() }));
                                setFormData({ ...formData, to: newToLocationName.trim() });
                                setNewToLocationName("");
                                setShowAddToLocation(false);
                                // Refresh locations
                                dispatch(fetchLocations());
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Taluka *</label>
                      <Input
                        name="taluka"
                        value={formData.taluka}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">District *</label>
                      <Input
                        name="dist"
                        value={formData.dist}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium">Customer *</label>
                      <Select
                        value={formData.customerId}
                        onValueChange={handleCustomerChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Invoice No *
                      </label>
                      <Input
                        name="invoiceNo"
                        value={formData.invoiceNo}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Consignor *</label>
                      {formData.customerId && customerProducts.length > 0 ? (
                        <Select
                          value={formData.consignor}
                          onValueChange={(value) =>
                            setFormData({ ...formData, consignor: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select consignor" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers
                              .find((c) => c._id === formData.customerId)
                              ?.consignors?.map((consignor, idx) => (
                                <SelectItem key={idx} value={consignor}>
                                  {consignor}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          name="consignor"
                          value={formData.consignor}
                          onChange={handleChange}
                          required
                          placeholder="Enter consignor name"
                        />
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Consignee *</label>
                      <Input
                        name="consignee"
                        value={formData.consignee}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium">Remarks</label>
                    <Input
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Invoice Items</h3>
                      <Button type="button" size="sm" onClick={addRow}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Row
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {rows.map((row, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-10 gap-2 items-end border-b pb-4"
                        >
                          <div className="col-span-1">
                            <label className="text-xs">Product</label>
                            <Select
                              value={row.product}
                              onValueChange={(value) =>
                                handleProductChange(index, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {customerProducts.map((product) => (
                                  <SelectItem
                                    key={product.productName}
                                    value={product.productName}
                                  >
                                    {product.productName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs">HSN No</label>
                            <Input
                              value={row.hsnNo}
                              onChange={(e) =>
                                handleRowChange(index, "hsnNo", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs">Truck No</label>
                            <Select
                              value={row.truckNo}
                              onValueChange={(value) =>
                                handleRowChange(index, "truckNo", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicles.map((vehicle) => (
                                  <SelectItem
                                    key={vehicle._id}
                                    value={vehicle.vehicleNumber}
                                  >
                                    {vehicle.vehicleNumber}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs">Articles</label>
                            <Input
                              value={row.articles}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "articles",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs">Weight</label>
                            <Input
                              type="number"
                              value={row.weight}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "weight",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs">Rate</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={row.rate}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "rate",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs">CGST/SGST</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={row.cgstSgst}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "cgstSgst",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs">Total</label>
                            <Input
                              type="number"
                              value={row.total}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs">Remarks</label>
                            <Input
                              value={row.remarks}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "remarks",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRow(index)}
                              disabled={rows.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-right">
                      <p className="text-lg font-semibold">
                        Grand Total: ₹
                        {rows
                          .reduce((sum, row) => sum + row.total, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DrawerFooter className="border-t bg-background mt-auto">
              <div className="flex gap-2 justify-end w-full max-w-6xl mx-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : invoice ? "Update" : "Create"}
                </Button>
              </div>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
