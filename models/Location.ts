import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema<ILocation> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
      minlength: [2, "Location name must be at least 2 characters"],
      maxlength: [100, "Location name must not exceed 100 characters"],
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
LocationSchema.index({ userId: 1 });

// Delete cached model to ensure schema is updated
if (mongoose.models.Location) {
  delete mongoose.models.Location;
}

const Location: Model<ILocation> = mongoose.model<ILocation>(
  "Location",
  LocationSchema
);

export default Location;
