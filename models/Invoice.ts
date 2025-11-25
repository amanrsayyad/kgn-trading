import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoiceRow {
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

export interface IInvoice extends Document {
  invoiceId: string;
  date: Date;
  from: string;
  to: string;
  taluka: string;
  dist: string;
  customerId?: mongoose.Types.ObjectId | null;
  customerName?: string;
  appUserId?: mongoose.Types.ObjectId | null;
  appUserName?: string;
  appUserGstin?: string;
  consignor: string;
  consignee: string;
  invoiceNo: string;
  remarks?: string;
  status: "Paid" | "Unpaid" | "Partially Paid";
  rows: IInvoiceRow[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceRowSchema = new Schema<IInvoiceRow>({
  product: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  hsnNo: {
    type: String,
    required: [true, "HSN number is required"],
    trim: true,
  },
  truckNo: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
  },
  articles: {
    type: String,
    required: [true, "Articles description is required"],
    trim: true,
  },
  weight: {
    type: Number,
    required: [true, "Weight is required"],
    min: [0, "Weight cannot be negative"],
  },
  rate: {
    type: Number,
    required: [true, "Rate is required"],
    min: [0, "Rate cannot be negative"],
  },
  cgstSgst: {
    type: Number,
    required: false,
    default: 0,
    min: [0, "CGST/SGST cannot be negative"],
  },
  total: {
    type: Number,
    required: [true, "Total is required"],
    min: [0, "Total cannot be negative"],
  },
  remarks: {
    type: String,
    trim: true,
  },
});

const InvoiceSchema: Schema<IInvoice> = new Schema(
  {
    invoiceId: {
      type: String,
      required: [true, "Invoice ID is required"],
      trim: true,
      uppercase: true,
    },
    date: {
      type: Date,
      required: [true, "Invoice date is required"],
    },
    from: {
      type: String,
      required: [true, "From location is required"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "To location is required"],
      trim: true,
    },
    taluka: {
      type: String,
      required: [true, "Taluka is required"],
      trim: true,
    },
    dist: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
      default: null,
    },
    customerName: {
      type: String,
      required: false,
      trim: true,
    },
    appUserId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: false,
      default: null,
    },
    appUserName: {
      type: String,
      required: false,
      trim: true,
    },
    appUserGstin: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
      default: "",
    },
    consignor: {
      type: String,
      required: [true, "Consignor is required"],
      trim: true,
    },
    consignee: {
      type: String,
      required: [true, "Consignee is required"],
      trim: true,
    },
    invoiceNo: {
      type: String,
      required: [true, "Invoice number is required"],
      trim: true,
      uppercase: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid", "Partially Paid"],
      default: "Unpaid",
    },
    rows: {
      type: [InvoiceRowSchema],
      validate: {
        validator: function (rows: IInvoiceRow[]) {
          return rows && rows.length > 0;
        },
        message: "At least one invoice row is required",
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
InvoiceSchema.index({ userId: 1, date: -1 });
InvoiceSchema.index({ invoiceId: 1, userId: 1 }, { unique: true });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ appUserId: 1 });
// Ensure invoice number series is unique per App User (and user)
InvoiceSchema.index({ userId: 1, appUserId: 1, invoiceNo: 1 }, { unique: true });

// Delete cached model to ensure schema is updated
if (mongoose.models.Invoice) {
  delete mongoose.models.Invoice;
}

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>(
  "Invoice",
  InvoiceSchema
);

export default Invoice;
