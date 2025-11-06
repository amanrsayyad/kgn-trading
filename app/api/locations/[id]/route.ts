import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";

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

// PUT update location
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
    const { name } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Location name is required" },
        { status: 400 }
      );
    }

    // Check if location exists and belongs to user
    const location = await Location.findOne({ _id: id, userId });
    if (!location) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    location.name = name;
    await location.save();

    return NextResponse.json(
      {
        success: true,
        message: "Location updated successfully",
        location,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update location error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE location
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

    // Find and delete location
    const location = await Location.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!location) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Location deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete location error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
