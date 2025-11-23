import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface InvoiceRow {
  product: string;
  hsnNo: string;
  truckNo: string;
  articles: string;
  weight: number;
  rate: number;
  cgstSgst: number;
  total: number;
  remarks?: string;
}

export interface Invoice {
  _id: string;
  invoiceId: string;
  date: string;
  from: string;
  to: string;
  taluka: string;
  dist: string;
  customerId: string | { _id: string; name: string; gstin: string };
  customerName: string;
  appUserId?: string | { _id: string; name: string; gstin: string };
  appUserName?: string;
  appUserGstin?: string;
  consignor: string;
  consignee: string;
  invoiceNo: string;
  remarks?: string;
  status: "Paid" | "Unpaid" | "Partially Paid";
  rows: InvoiceRow[];
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface InvoiceState {
  invoices: Invoice[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  pagination: null,
  isLoading: false,
  error: null,
};

// Fetch invoices with pagination and filters
export const fetchInvoices = createAsyncThunk(
  "invoice/fetchInvoices",
  async (
    {
      page = 1,
      limit = 10,
      customerId,
      vehicle,
      fromDate,
      toDate,
    }: {
      page?: number;
      limit?: number;
      customerId?: string;
      vehicle?: string;
      fromDate?: string;
      toDate?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      // Build query string with filters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (customerId) params.append("customerId", customerId);
      if (vehicle) params.append("vehicle", vehicle);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const response = await fetch(`/api/invoices?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch invoices");
      }

      return { invoices: data.invoices, pagination: data.pagination };
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Create invoice
export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",
  async (
    invoiceData: Omit<
      Invoice,
      "_id" | "createdAt" | "updatedAt" | "customerName" | "appUserName" | "appUserGstin"
    >,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create invoice");
      }

      return data.invoice;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update invoice
export const updateInvoice = createAsyncThunk(
  "invoice/updateInvoice",
  async (
    {
      id,
      invoiceData,
    }: {
      id: string;
      invoiceData: Omit<
        Invoice,
        "_id" | "createdAt" | "updatedAt" | "customerName" | "appUserName" | "appUserGstin"
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update invoice");
      }

      return data.invoice;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete invoice
export const deleteInvoice = createAsyncThunk(
  "invoice/deleteInvoice",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete invoice");
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch invoices
    builder.addCase(fetchInvoices.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchInvoices.fulfilled,
      (
        state,
        action: PayloadAction<{ invoices: Invoice[]; pagination: Pagination }>
      ) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.pagination = action.payload.pagination;
      }
    );
    builder.addCase(fetchInvoices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create invoice
    builder.addCase(createInvoice.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      createInvoice.fulfilled,
      (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload);
      }
    );
    builder.addCase(createInvoice.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update invoice
    builder.addCase(updateInvoice.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      updateInvoice.fulfilled,
      (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        const index = state.invoices.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      }
    );
    builder.addCase(updateInvoice.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete invoice
    builder.addCase(deleteInvoice.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      deleteInvoice.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.invoices = state.invoices.filter((i) => i._id !== action.payload);
      }
    );
    builder.addCase(deleteInvoice.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
