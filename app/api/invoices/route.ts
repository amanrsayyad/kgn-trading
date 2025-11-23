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

// GET all invoices with pagination
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

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get filter parameters
    const customerId = searchParams.get("customerId");
    const vehicle = searchParams.get("vehicle");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // Build filter query
    const filter: any = { userId };

    if (customerId) {
      filter.customerId = customerId;
    }

    console.log("Filter Query:", filter);
    console.log("Query Params:", { customerId, vehicle, fromDate, toDate });

    if (vehicle) {
      filter["rows.truckNo"] = vehicle;
    }

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) {
        filter.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    // Get total count for pagination
    const total = await Invoice.countDocuments(filter);

    console.log("Total matching invoices:", total);

    // Debug: Check all user invoices
    const allUserInvoices = await Invoice.find({ userId })
      .select("_id invoiceId customerId")
      .limit(5);
    console.log(
      "Sample user invoices:",
      JSON.stringify(allUserInvoices, null, 2)
    );

    // Fetch paginated invoices
    const invoices = await Invoice.find(filter)
      .populate("customerId", "name gstin")
      .populate("appUserId", "name gstin")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        invoices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get invoices error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching invoices",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create new invoice
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

    const invoiceData = await request.json();

    // Validate customer exists and belongs to user (if customerId is provided)
    let customerName = "";
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
    let appUserName = "";
    let appUserId = null;
    let appUserGstin = "";

    if (invoiceData.appUserId && invoiceData.appUserId.trim() !== "") {
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

    // Check if invoice ID already exists for this user
    const existingInvoice = await Invoice.findOne({
      invoiceId: invoiceData.invoiceId,
      userId,
    });

    if (existingInvoice) {
      return NextResponse.json(
        { success: false, message: "Invoice ID already exists" },
        { status: 400 }
      );
    }

    // Create invoice with customer/app user names
    const invoice = await Invoice.create({
      ...invoiceData,
      customerId,
      customerName,
      appUserId,
      appUserName,
      appUserGstin,
      userId,
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("customerId", "name gstin")
      .populate("appUserId", "name gstin");

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully",
        invoice: populatedInvoice,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating invoice",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
