import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";

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

// GET all customers
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

    const customers = await Customer.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        customers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get customers error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching customers",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create new customer
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

    const { name, gstin, taluka, district, address, products, consignors } =
      await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    // Check if customer with same GSTIN already exists for this user (only if GSTIN provided)
    if (gstin && gstin.trim() !== "") {
      const existingCustomer = await Customer.findOne({
        gstin: gstin.toUpperCase(),
        userId,
      });
      if (existingCustomer) {
        return NextResponse.json(
          {
            success: false,
            message: "Customer with this GSTIN already exists",
          },
          { status: 400 }
        );
      }
    }

    const customer = await Customer.create({
      name,
      gstin: gstin && gstin.trim() !== "" ? gstin.toUpperCase() : "",
      taluka: taluka || "",
      district: district || "",
      address: address || "",
      products: products || [],
      consignors: consignors || [],
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        customer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating customer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
