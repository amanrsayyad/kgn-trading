"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchVehicles } from "@/lib/features/vehicle/vehicleSlice";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import VehiclesTable from "@/components/vehicles/vehicles-table";
import VehicleFormDialog from "@/components/vehicles/vehicle-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Vehicle } from "@/lib/features/vehicle/vehicleSlice";

export default function VehiclesPage() {
  const dispatch = useAppDispatch();
  const { vehicles, isLoading } = useAppSelector((state) => state.vehicle);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleAddNew = () => {
    setSelectedVehicle(null);
    setDialogOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedVehicle(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
            <p className="text-muted-foreground">
              Manage your fleet and vehicle records
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>

        {isLoading && vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading vehicles...</p>
          </div>
        ) : (
          <VehiclesTable vehicles={vehicles} onEdit={handleEdit} />
        )}

        <VehicleFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          vehicle={selectedVehicle}
        />
      </div>
    </DashboardLayout>
  );
}
