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

// GET - Fetch all vehicles
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const vehicles = await Vehicle.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        vehicles,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch vehicles",
      },
      { status: 500 }
    );
  }
}

// POST - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const vehicleData = { ...body, userId };

    const vehicle = await Vehicle.create(vehicleData);

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle created successfully",
        vehicle,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating vehicle:", error);

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
        message: error.message || "Failed to create vehicle",
      },
      { status: 500 }
    );
  }
}
