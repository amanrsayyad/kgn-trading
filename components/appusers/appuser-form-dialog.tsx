"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createAppUser,
  updateAppUser,
  clearError,
  type AppUser,
} from "@/lib/features/appuser/appuserSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AppUserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appuser: AppUser | null;
}

export default function AppUserFormDialog({
  open,
  onOpenChange,
  appuser,
}: AppUserFormDialogProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.appuser);

  const [formData, setFormData] = useState({ name: "", mobile: "", gstin: "" });
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    if (appuser) {
      setFormData({ name: appuser.name, mobile: appuser.mobile, gstin: appuser.gstin ?? "" });
    } else {
      setFormData({ name: "", mobile: "", gstin: "" });
    }
    setValidationError("");
    dispatch(clearError());
  }, [appuser, dispatch, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setValidationError("");
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (formData.name.trim().length < 2) {
      setValidationError("App user name must be at least 2 characters");
      return;
    }
    if (!/^\d{10}$/u.test(formData.mobile.trim())) {
      setValidationError("Mobile must be a 10 digit number");
      return;
    }

    const result = appuser
      ? await dispatch(
          updateAppUser({ id: appuser._id, appuserData: formData })
        )
      : await dispatch(createAppUser(formData));

    if (
      (appuser && updateAppUser.fulfilled.match(result)) ||
      (!appuser && createAppUser.fulfilled.match(result))
    ) {
      onOpenChange(false);
    }
  };

  const displayError = error || validationError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{appuser ? "Edit App User" : "Add New App User"}</DialogTitle>
          <DialogDescription>
            {appuser
              ? "Update app user information below."
              : "Enter app user details to add them to your application."}
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
              <label className="text-sm font-medium">
                App User Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter app user name"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Mobile <span className="text-red-500">*</span>
              </label>
              <Input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10 digit mobile number"
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">GSTIN (optional)</label>
              <Input
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="15-character GSTIN"
                maxLength={15}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : appuser ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}