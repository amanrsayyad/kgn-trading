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

// GET all locations for user
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

    const locations = await Location.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        locations,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get locations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching locations",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create new location
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

    const { name } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Location name is required" },
        { status: 400 }
      );
    }

    const location = await Location.create({
      name,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Location created successfully",
        location,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create location error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
