import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Helper function to get user ID from token
function getUserIdFromToken(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// PUT - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const vehicle = await Vehicle.findOne({ _id: id, userId });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Update vehicle
    Object.assign(vehicle, body);
    await vehicle.save();

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle updated successfully",
        vehicle,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating vehicle:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle number already exists",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update vehicle",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const vehicle = await Vehicle.findOneAndDelete({ _id: id, userId });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete vehicle",
      },
      { status: 500 }
    );
  }
}
