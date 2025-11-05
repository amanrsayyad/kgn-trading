import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct {
  productName: string;
  productRate: number;
}

export interface ICustomer extends Document {
  name: string;
  gstin: string;
  taluka: string;
  district: string;
  products: IProduct[];
  consignors: string[];
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
      required: false,
      trim: true,
      uppercase: true,
      default: "",
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please enter a valid GSTIN (15 characters)",
      ],
    },
    taluka: {
      type: String,
      required: false,
      trim: true,
    },
    district: {
      type: String,
      required: false,
      trim: true,
    },
    products: {
      type: [ProductSchema],
      default: [],
    },
    consignors: {
      type: [String],
      default: [],
      validate: {
        validator: function (consignors: string[]) {
          return consignors.every((name) => name && name.trim().length > 0);
        },
        message: "Consignor names cannot be empty",
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

// Pre-save hook to validate GSTIN uniqueness
CustomerSchema.pre("save", { document: true, query: false }, async function () {
  if (this.isModified("gstin") && this.gstin) {
    const existingCustomer = await mongoose.models.Customer.findOne({
      gstin: this.gstin,
      userId: this.userId,
      _id: { $ne: this._id },
    });

    if (existingCustomer) {
      throw new Error("Customer with this GSTIN already exists");
    }
  }
});

// Index for faster queries
CustomerSchema.index({ userId: 1 });
// Regular index for gstin field
CustomerSchema.index({ gstin: 1, userId: 1 });

// Delete cached model to ensure schema is updated
if (mongoose.models.Customer) {
  delete mongoose.models.Customer;
}

const Customer: Model<ICustomer> = mongoose.model<ICustomer>(
  "Customer",
  CustomerSchema
);

export default Customer;
