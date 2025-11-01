import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Vehicle {
  _id: string;
  vehicleNumber: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

interface VehicleState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchVehicles = createAsyncThunk(
  "vehicle/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/vehicles", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch vehicles");
      }

      return data.vehicles;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const createVehicle = createAsyncThunk(
  "vehicle/createVehicle",
  async (
    vehicleData: Omit<Vehicle, "_id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(vehicleData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create vehicle");
      }

      return data.vehicle;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "vehicle/updateVehicle",
  async (
    { id, vehicleData }: { id: string; vehicleData: Partial<Vehicle> },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(vehicleData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update vehicle");
      }

      return data.vehicle;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "vehicle/deleteVehicle",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete vehicle");
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchVehicles.fulfilled,
        (state, action: PayloadAction<Vehicle[]>) => {
          state.isLoading = false;
          state.vehicles = action.payload;
        }
      )
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createVehicle.fulfilled,
        (state, action: PayloadAction<Vehicle>) => {
          state.isLoading = false;
          state.vehicles.unshift(action.payload);
        }
      )
      .addCase(createVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateVehicle.fulfilled,
        (state, action: PayloadAction<Vehicle>) => {
          state.isLoading = false;
          const index = state.vehicles.findIndex(
            (v) => v._id === action.payload._id
          );
          if (index !== -1) {
            state.vehicles[index] = action.payload;
          }
        }
      )
      .addCase(updateVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteVehicle.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.vehicles = state.vehicles.filter(
            (v) => v._id !== action.payload
          );
        }
      )
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = vehicleSlice.actions;
export default vehicleSlice.reducer;
