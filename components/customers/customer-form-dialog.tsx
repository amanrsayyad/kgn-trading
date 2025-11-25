"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createCustomer,
  updateCustomer,
  clearError,
  type Product,
} from "@/lib/features/customer/customerSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { Customer } from "@/lib/features/customer/customerSlice";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export default function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
}: CustomerFormDialogProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.customer);

  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    taluka: "",
    district: "",
    address: "",
  });

  const [products, setProducts] = useState<Product[]>([
    { productName: "", productRate: 0 },
  ]);
  const [consignors, setConsignors] = useState<string[]>([""]);

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        gstin: customer.gstin,
        taluka: customer.taluka || "",
        district: customer.district || "",
        address: customer.address || "",
      });
      setProducts(
        customer.products && customer.products.length > 0
          ? customer.products
          : [{ productName: "", productRate: 0 }]
      );
      setConsignors(
        customer.consignors && customer.consignors.length > 0
          ? customer.consignors
          : [""]
      );
    } else {
      setFormData({
        name: "",
        gstin: "",
        taluka: "",
        district: "",
        address: "",
      });
      setProducts([{ productName: "", productRate: 0 }]);
      setConsignors([""]);
    }
    setValidationError("");
    dispatch(clearError());
  }, [customer, dispatch, open]);

  const handleProductChange = (
    index: number,
    field: keyof Product,
    value: string | number
  ) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value,
    };
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { productName: "", productRate: 0 }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const addConsignor = () => {
    setConsignors([...consignors, ""]);
  };

  const removeConsignor = (index: number) => {
    if (consignors.length > 1) {
      setConsignors(consignors.filter((_, i) => i !== index));
    }
  };

  const handleConsignorChange = (index: number, value: string) => {
    const newConsignors = [...consignors];
    newConsignors[index] = value;
    setConsignors(newConsignors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError("");
    dispatch(clearError());
  };

  const validateGSTIN = (gstin: string): boolean => {
    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    if (formData.name.trim().length < 2) {
      setValidationError("Customer name must be at least 2 characters");
      return;
    }

    // Validate GSTIN only if provided
    if (
      formData.gstin &&
      formData.gstin.trim() !== "" &&
      !validateGSTIN(formData.gstin)
    ) {
      setValidationError("Please enter a valid 15-character GSTIN");
      return;
    }

    const result = customer
      ? await dispatch(
          updateCustomer({
            id: customer._id,
            customerData: { ...formData, products, consignors },
          })
        )
      : await dispatch(createCustomer({ ...formData, products, consignors }));

    if (
      (customer && updateCustomer.fulfilled.match(result)) ||
      (!customer && createCustomer.fulfilled.match(result))
    ) {
      onOpenChange(false);
      setFormData({ name: "", gstin: "", taluka: "", district: "", address: "" });
      setProducts([{ productName: "", productRate: 0 }]);
      setConsignors([""]);
    }
  };

  const displayError = error || validationError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Update customer information below."
              : "Enter customer details to add them to your database."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {displayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {displayError}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="gstin" className="text-sm font-medium">
                GSTIN
              </label>
              <Input
                id="gstin"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5 (Optional)"
                maxLength={15}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                15-character Goods and Services Tax Identification Number
                (Optional)
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, Area, City"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="taluka" className="text-sm font-medium">
                  Taluka
                </label>
                <Input
                  id="taluka"
                  name="taluka"
                  value={formData.taluka}
                  onChange={handleChange}
                  placeholder="Enter taluka"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="district" className="text-sm font-medium">
                  District
                </label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Products</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProduct}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>
              <div className="space-y-2">
                {products.map((product, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Product name"
                        value={product.productName}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "productName",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Rate"
                        step="0.01"
                        min="0"
                        value={product.productRate}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "productRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      disabled={products.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Consignor Names</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConsignor}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Consignor
                </Button>
              </div>
              <div className="space-y-2">
                {consignors.map((consignor, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Consignor name"
                        value={consignor}
                        onChange={(e) =>
                          handleConsignorChange(index, e.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConsignor(index)}
                      disabled={consignors.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : customer ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
