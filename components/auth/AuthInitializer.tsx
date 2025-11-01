"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser } from "@/lib/features/auth/authSlice";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");

      if (storedToken && !user) {
        // You might want to verify the token with the backend here
        // For now, we'll just set the token in the state
        // In a real app, you'd make an API call to validate and get user info
        dispatch(setUser({ user: null as any, token: storedToken }));
      }
    }
  }, [dispatch, user]);

  return <>{children}</>;
}
