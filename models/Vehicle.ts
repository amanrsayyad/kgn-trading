import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVehicle extends Document {
  vehicleNumber: string;
  capacity: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema: Schema<IVehicle> = new Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [0, "Capacity cannot be negative"],
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
VehicleSchema.index({ userId: 1 });
VehicleSchema.index({ vehicleNumber: 1, userId: 1 }, { unique: true });

// Delete cached model to ensure schema is updated
if (mongoose.models.Vehicle) {
  delete mongoose.models.Vehicle;
}

const Vehicle: Model<IVehicle> = mongoose.model<IVehicle>(
  "Vehicle",
  VehicleSchema
);

export default Vehicle;
