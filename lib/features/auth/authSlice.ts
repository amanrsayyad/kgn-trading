import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Register async thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Registration failed");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Login async thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      // Store token in localStorage
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Logout async thunk
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Logout failed");
      }

      // Clear token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logoutUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
