import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import AppUser from "@/models/AppUser";

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

// GET all app users
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

    const appusers = await AppUser.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, appusers },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get appusers error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching app users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create new app user
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

    const { name, mobile, gstin } = await request.json();

    if (!name || !mobile) {
      return NextResponse.json(
        { success: false, message: "Name and mobile are required" },
        { status: 400 }
      );
    }

    // Check duplicate mobile per user
    const existing = await AppUser.findOne({ userId, mobile });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "App user with this mobile already exists" },
        { status: 400 }
      );
    }

    const appuser = await AppUser.create({
      name,
      mobile,
      gstin: gstin && gstin.trim() !== "" ? gstin.toUpperCase() : "",
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "App user created successfully",
        appuser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create appuser error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating app user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}