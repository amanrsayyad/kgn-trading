"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAppUsers,
  type AppUser,
} from "@/lib/features/appuser/appuserSlice";
import AppUsersTable from "@/components/appusers/appusers-table";
import AppUserFormDialog from "@/components/appusers/appuser-form-dialog";

export default function AppUsersPage() {
  const dispatch = useAppDispatch();
  const { appusers, isLoading } = useAppSelector((state) => state.appuser);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppUser, setSelectedAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    dispatch(fetchAppUsers());
  }, [dispatch]);

  const handleAddNew = () => {
    setSelectedAppUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (appuser: AppUser) => {
    setSelectedAppUser(appuser);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setSelectedAppUser(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">App Users</h2>
            <p className="text-muted-foreground">Manage users for your application access</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add App User
          </Button>
        </div>

        {isLoading && appusers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading app users...</p>
          </div>
        ) : (
          <AppUsersTable appusers={appusers} onEdit={handleEdit} />
        )}

        <AppUserFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          appuser={selectedAppUser}
        />
      </div>
    </DashboardLayout>
  );
}