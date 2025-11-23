import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppUser extends Document {
  name: string;
  mobile: string;
  gstin: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppUserSchema = new Schema<IAppUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      // Basic 10-digit mobile validation; adjust as needed
      match: [/^\d{10}$/u, "Mobile must be a 10 digit number"],
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure mobile is unique per user
AppUserSchema.index({ userId: 1, mobile: 1 }, { unique: true });

// In Next.js dev, models can be cached with an older schema.
// Force recompilation if a prior model exists so new fields (e.g., gstin) persist.
if (mongoose.models.AppUser) {
  // Available in Mongoose v8: safely delete existing model to recompile schema
  mongoose.deleteModel("AppUser");
}

const AppUser: Model<IAppUser> = mongoose.model<IAppUser>("AppUser", AppUserSchema);

export default AppUser;