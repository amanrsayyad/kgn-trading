import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct {
  productName: string;
  productRate: number;
}

export interface ICustomer extends Document {
  name: string;
  gstin: string;
  products: IProduct[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  productName: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  productRate: {
    type: Number,
    required: [true, "Product rate is required"],
    min: [0, "Product rate cannot be negative"],
  },
});

const CustomerSchema: Schema<ICustomer> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must be at least 2 characters"],
      maxlength: [100, "Customer name must not exceed 100 characters"],
    },
    gstin: {
      type: String,
      required: [true, "GSTIN is required"],
      trim: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please enter a valid GSTIN (15 characters)",
      ],
    },
    products: {
      type: [ProductSchema],
      default: [],
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
CustomerSchema.index({ userId: 1 });
CustomerSchema.index({ gstin: 1, userId: 1 }, { unique: true });

// Delete cached model to ensure schema is updated
if (mongoose.models.Customer) {
  delete mongoose.models.Customer;
}

const Customer: Model<ICustomer> = mongoose.model<ICustomer>(
  "Customer",
  CustomerSchema
);

export default Customer;
