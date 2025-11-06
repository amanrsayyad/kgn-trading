"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createLocation,
  updateLocation,
  clearError,
} from "@/lib/features/location/locationSlice";
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
import type { Location } from "@/lib/features/location/locationSlice";

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location | null;
}

export default function LocationFormDialog({
  open,
  onOpenChange,
  location,
}: LocationFormDialogProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.location);

  const [formData, setFormData] = useState({
    name: "",
  });

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
      });
    } else {
      setFormData({
        name: "",
      });
    }
    setValidationError("");
    dispatch(clearError());
  }, [location, dispatch, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError("");
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (formData.name.trim().length < 2) {
      setValidationError("Location name must be at least 2 characters");
      return;
    }

    const result = location
      ? await dispatch(
          updateLocation({
            id: location._id,
            locationData: { name: formData.name },
          })
        )
      : await dispatch(createLocation({ name: formData.name }));

    if (
      (location && updateLocation.fulfilled.match(result)) ||
      (!location && createLocation.fulfilled.match(result))
    ) {
      onOpenChange(false);
      setFormData({ name: "" });
    }
  };

  const displayError = error || validationError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {location ? "Edit Location" : "Add New Location"}
          </DialogTitle>
          <DialogDescription>
            {location
              ? "Update location information below."
              : "Enter location details to add them to your database."}
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
                Location Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter location name"
                required
              />
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
              {isLoading ? "Saving..." : location ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
