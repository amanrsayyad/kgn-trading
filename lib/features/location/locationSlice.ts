import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Location {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationState {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  locations: [],
  isLoading: false,
  error: null,
};

// Fetch all locations
export const fetchLocations = createAsyncThunk(
  "location/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/locations", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch locations");
      }

      return data.locations;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Create location
export const createLocation = createAsyncThunk(
  "location/createLocation",
  async (
    locationData: { name: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(locationData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create location");
      }

      return data.location;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update location
export const updateLocation = createAsyncThunk(
  "location/updateLocation",
  async (
    {
      id,
      locationData,
    }: {
      id: string;
      locationData: { name: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(locationData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update location");
      }

      return data.location;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete location
export const deleteLocation = createAsyncThunk(
  "location/deleteLocation",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete location");
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch locations
    builder.addCase(fetchLocations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchLocations.fulfilled,
      (state, action: PayloadAction<Location[]>) => {
        state.isLoading = false;
        state.locations = action.payload;
      }
    );
    builder.addCase(fetchLocations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create location
    builder.addCase(createLocation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      createLocation.fulfilled,
      (state, action: PayloadAction<Location>) => {
        state.isLoading = false;
        state.locations.unshift(action.payload);
      }
    );
    builder.addCase(createLocation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update location
    builder.addCase(updateLocation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      updateLocation.fulfilled,
      (state, action: PayloadAction<Location>) => {
        state.isLoading = false;
        const index = state.locations.findIndex(
          (l) => l._id === action.payload._id
        );
        if (index !== -1) {
          state.locations[index] = action.payload;
        }
      }
    );
    builder.addCase(updateLocation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete location
    builder.addCase(deleteLocation.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      deleteLocation.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.locations = state.locations.filter(
          (l) => l._id !== action.payload
        );
      }
    );
    builder.addCase(deleteLocation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = locationSlice.actions;
export default locationSlice.reducer;
