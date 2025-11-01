"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { deleteVehicle } from "@/lib/features/vehicle/vehicleSlice";
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
import type { Vehicle } from "@/lib/features/vehicle/vehicleSlice";

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
}

export default function VehiclesTable({
  vehicles,
  onEdit,
}: VehiclesTableProps) {
  const dispatch = useAppDispatch();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setDeletingId(id);
      await dispatch(deleteVehicle(id));
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

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">
          No vehicles found. Add your first vehicle to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle Number</TableHead>
            <TableHead>Capacity (Tons)</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle._id}>
              <TableCell className="font-medium font-mono">
                {vehicle.vehicleNumber}
              </TableCell>
              <TableCell>{vehicle.capacity}</TableCell>
              <TableCell>{formatDate(vehicle.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(vehicle)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(vehicle._id)}
                    disabled={deletingId === vehicle._id}
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
