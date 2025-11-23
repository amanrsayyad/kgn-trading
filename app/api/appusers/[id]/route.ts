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

// PUT update app user
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
    const { name, mobile, gstin } = await request.json();

    // Validate
    if (!name && !mobile && typeof gstin !== "string") {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    const appuser = await AppUser.findOne({ _id: id, userId });
    if (!appuser) {
      return NextResponse.json(
        { success: false, message: "App user not found" },
        { status: 404 }
      );
    }

    if (typeof name === "string") appuser.name = name;
    if (typeof mobile === "string") {
      // Check duplicate mobile per user, excluding current
      const dup = await AppUser.findOne({ userId, mobile, _id: { $ne: id } });
      if (dup) {
        return NextResponse.json(
          {
            success: false,
            message: "Another app user with this mobile already exists",
          },
          { status: 400 }
        );
      }
      appuser.mobile = mobile;
    }
    if (typeof gstin === "string") {
      appuser.gstin = gstin && gstin.trim() !== "" ? gstin.toUpperCase() : "";
    }

    await appuser.save();

    return NextResponse.json(
      { success: true, message: "App user updated successfully", appuser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update appuser error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating app user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE app user
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

    const deleted = await AppUser.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "App user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "App user deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete appuser error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting app user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}