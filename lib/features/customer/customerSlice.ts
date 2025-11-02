import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  productName: string;
  productRate: number;
}

export interface Customer {
  _id: string;
  name: string;
  gstin: string;
  taluka: string;
  district: string;
  products: Product[];
  consignors: string[];
  createdAt: string;
  updatedAt: string;
}

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  isLoading: false,
  error: null,
};

// Fetch all customers
export const fetchCustomers = createAsyncThunk(
  "customer/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/customers", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch customers");
      }

      return data.customers;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Create customer
export const createCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (
    customerData: {
      name: string;
      gstin: string;
      taluka: string;
      district: string;
      products: Product[];
      consignors: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create customer");
      }

      return data.customer;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update customer
export const updateCustomer = createAsyncThunk(
  "customer/updateCustomer",
  async (
    {
      id,
      customerData,
    }: {
      id: string;
      customerData: {
        name: string;
        gstin: string;
        taluka: string;
        district: string;
        products: Product[];
        consignors: string[];
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update customer");
      }

      return data.customer;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete customer
export const deleteCustomer = createAsyncThunk(
  "customer/deleteCustomer",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete customer");
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder.addCase(fetchCustomers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchCustomers.fulfilled,
      (state, action: PayloadAction<Customer[]>) => {
        state.isLoading = false;
        state.customers = action.payload;
      }
    );
    builder.addCase(fetchCustomers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create customer
    builder.addCase(createCustomer.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      createCustomer.fulfilled,
      (state, action: PayloadAction<Customer>) => {
        state.isLoading = false;
        state.customers.unshift(action.payload);
      }
    );
    builder.addCase(createCustomer.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update customer
    builder.addCase(updateCustomer.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      updateCustomer.fulfilled,
      (state, action: PayloadAction<Customer>) => {
        state.isLoading = false;
        const index = state.customers.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      }
    );
    builder.addCase(updateCustomer.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete customer
    builder.addCase(deleteCustomer.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      deleteCustomer.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.customers = state.customers.filter(
          (c) => c._id !== action.payload
        );
      }
    );
    builder.addCase(deleteCustomer.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = customerSlice.actions;
export default customerSlice.reducer;
