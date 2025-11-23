import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
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

// PUT update invoice
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
    const invoiceData = await request.json();

    // Check if invoice exists and belongs to user
    const invoice = await Invoice.findOne({ _id: id, userId });
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    // Validate customer exists and belongs to user (if customerId is provided)
    let customerName = invoiceData.customerName || "";
    let customerId = null;

    if (invoiceData.customerId && invoiceData.customerId.trim() !== "") {
      const customer = await Customer.findOne({
        _id: invoiceData.customerId,
        userId,
      });

      if (!customer) {
        return NextResponse.json(
          { success: false, message: "Customer not found" },
          { status: 404 }
        );
      }

      customerName = customer.name;
      customerId = customer._id;
    }

    // Validate app user exists and belongs to user (if appUserId is provided)
    let appUserName = invoiceData.appUserName || "";
    let appUserId = null;
    let appUserGstin = invoiceData.appUserGstin || "";

    if (invoiceData.appUserId && invoiceData.appUserId.trim && invoiceData.appUserId.trim() !== "") {
      const appUser = await AppUser.findOne({
        _id: invoiceData.appUserId,
        userId,
      });

      if (!appUser) {
        return NextResponse.json(
          { success: false, message: "App User not found" },
          { status: 404 }
        );
      }

      appUserName = appUser.name;
      appUserId = appUser._id;
      appUserGstin = appUser.gstin || "";
    }

    // Check if invoice ID is being changed to one that already exists
    if (invoiceData.invoiceId !== invoice.invoiceId) {
      const existingInvoice = await Invoice.findOne({
        invoiceId: invoiceData.invoiceId,
        userId,
        _id: { $ne: id },
      });

      if (existingInvoice) {
        return NextResponse.json(
          { success: false, message: "Invoice ID already exists" },
          { status: 400 }
        );
      }
    }

    // Update invoice
    const updateData: any = {
      ...invoiceData,
      customerId,
      customerName,
      appUserId,
      appUserName,
      appUserGstin,
    };

    // Set default status if empty
    if (!updateData.status || updateData.status.trim() === "") {
      updateData.status = "Unpaid";
    }

    Object.assign(invoice, updateData);
    await invoice.save();

    const populatedInvoice = await Invoice.findById(id)
      .populate("customerId", "name gstin")
      .populate("appUserId", "name gstin");

    return NextResponse.json(
      {
        success: true,
        message: "Invoice updated successfully",
        invoice: populatedInvoice,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update invoice error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating invoice",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE invoice
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

    // Find and delete invoice
    const invoice = await Invoice.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invoice deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete invoice error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting invoice",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
