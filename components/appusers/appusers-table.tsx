"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { deleteAppUser } from "@/lib/features/appuser/appuserSlice";
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
import type { AppUser } from "@/lib/features/appuser/appuserSlice";

interface AppUsersTableProps {
  appusers: AppUser[];
  onEdit: (appuser: AppUser) => void;
}

export default function AppUsersTable({ appusers, onEdit }: AppUsersTableProps) {
  const dispatch = useAppDispatch();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this app user?")) {
      setDeletingId(id);
      await dispatch(deleteAppUser(id));
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

  if (appusers.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">
          No app users found. Add your first app user to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App User Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appusers.map((u) => (
            <TableRow key={u._id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="font-mono">{u.mobile}</TableCell>
              <TableCell className="font-mono">{u.gstin ? u.gstin : "-"}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(u._id)}
                    disabled={deletingId === u._id}
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