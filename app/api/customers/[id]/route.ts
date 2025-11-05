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

// PUT update customer
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
    const { name, gstin, taluka, district, products, consignors } =
      await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    // Check if customer exists and belongs to user
    const customer = await Customer.findOne({ _id: id, userId });
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if GSTIN is being changed to one that already exists (only if GSTIN provided)
    if (
      gstin &&
      gstin.trim() !== "" &&
      gstin.toUpperCase() !== customer.gstin
    ) {
      const existingCustomer = await Customer.findOne({
        gstin: gstin.toUpperCase(),
        userId,
        _id: { $ne: id },
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

    customer.name = name;
    customer.gstin = gstin && gstin.trim() !== "" ? gstin.toUpperCase() : "";
    customer.taluka = taluka || "";
    customer.district = district || "";
    customer.products = products || [];
    customer.consignors = consignors || [];
    await customer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Customer updated successfully",
        customer,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update customer error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating customer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE customer
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

    // Find and delete customer
    const customer = await Customer.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting customer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
