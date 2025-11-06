"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchLocations,
  deleteLocation,
} from "@/lib/features/location/locationSlice";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import LocationFormDialog from "@/components/locations/location-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import type { Location } from "@/lib/features/location/locationSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LocationsPage() {
  const dispatch = useAppDispatch();
  const { locations, isLoading } = useAppSelector((state) => state.location);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const handleAddNew = () => {
    setSelectedLocation(null);
    setDialogOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      await dispatch(deleteLocation(id));
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedLocation(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Locations</h2>
            <p className="text-muted-foreground">
              Manage your saved locations for quick selection in invoices
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>

        {isLoading && locations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No locations found.</p>
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Location
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location._id}>
                    <TableCell className="font-medium">
                      {location.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(location._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <LocationFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          location={selectedLocation}
        />
      </div>
    </DashboardLayout>
  );
}
