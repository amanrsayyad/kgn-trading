import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface AppUser {
  _id: string;
  name: string;
  mobile: string;
  gstin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppUserState {
  appusers: AppUser[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AppUserState = {
  appusers: [],
  isLoading: false,
  error: null,
};

// Fetch app users
export const fetchAppUsers = createAsyncThunk<AppUser[], void, { rejectValue: string }>(
  "appuser/fetchAppUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/appusers", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch app users");
      }
      return data.appusers as AppUser[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Create app user
export const createAppUser = createAsyncThunk<
  AppUser,
  { name: string; mobile: string; gstin?: string },
  { rejectValue: string }
>("appuser/createAppUser", async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/appusers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue(data.message || "Failed to create app user");
    }
    return data.appuser as AppUser;
  } catch (error: any) {
    return rejectWithValue(error.message || "Network error");
  }
});

// Update app user
export const updateAppUser = createAsyncThunk<
  AppUser,
  { id: string; appuserData: { name?: string; mobile?: string; gstin?: string } },
  { rejectValue: string }
>("appuser/updateAppUser", async ({ id, appuserData }, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/appusers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appuserData),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue(data.message || "Failed to update app user");
    }
    return data.appuser as AppUser;
  } catch (error: any) {
    return rejectWithValue(error.message || "Network error");
  }
});

// Delete app user
export const deleteAppUser = createAsyncThunk<string, string, { rejectValue: string }>(
  "appuser/deleteAppUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/appusers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to delete app user");
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const appuserSlice = createSlice({
  name: "appuser",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchAppUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAppUsers.fulfilled,
      (state, action: PayloadAction<AppUser[]>) => {
        state.isLoading = false;
        state.appusers = action.payload;
      }
    );
    builder.addCase(fetchAppUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createAppUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      createAppUser.fulfilled,
      (state, action: PayloadAction<AppUser>) => {
        state.isLoading = false;
        state.appusers.unshift(action.payload);
      }
    );
    builder.addCase(createAppUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update
    builder.addCase(updateAppUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      updateAppUser.fulfilled,
      (state, action: PayloadAction<AppUser>) => {
        state.isLoading = false;
        state.appusers = state.appusers.map((u) =>
          u._id === action.payload._id ? action.payload : u
        );
      }
    );
    builder.addCase(updateAppUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete
    builder.addCase(deleteAppUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      deleteAppUser.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.appusers = state.appusers.filter((u) => u._id !== action.payload);
      }
    );
    builder.addCase(deleteAppUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = appuserSlice.actions;
export default appuserSlice.reducer;