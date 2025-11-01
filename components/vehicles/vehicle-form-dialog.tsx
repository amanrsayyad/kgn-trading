"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createVehicle,
  updateVehicle,
  clearError,
  type Vehicle,
} from "@/lib/features/vehicle/vehicleSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
}

export default function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
}: VehicleFormDialogProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.vehicle);

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    capacity: 0,
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNumber: vehicle.vehicleNumber,
        capacity: vehicle.capacity,
      });
    } else {
      setFormData({
        vehicleNumber: "",
        capacity: 0,
      });
    }
    dispatch(clearError());
  }, [vehicle, dispatch, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = vehicle
      ? await dispatch(
          updateVehicle({ id: vehicle._id, vehicleData: formData })
        )
      : await dispatch(createVehicle(formData as any));

    if (
      (vehicle && updateVehicle.fulfilled.match(result)) ||
      (!vehicle && createVehicle.fulfilled.match(result))
    ) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <DialogDescription>
            {vehicle
              ? "Update vehicle information"
              : "Enter vehicle details to add to your fleet"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Vehicle Number *</label>
              <Input
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="MH12AB1234"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Capacity (in Tons) *
              </label>
              <Input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : vehicle ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
