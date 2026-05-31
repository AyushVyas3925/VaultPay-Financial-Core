import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { store } from "@/lib/store";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/pdf/[id] - Secure PDF receipt generator
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const user = session.user as any;

    const { id } = await context.params;

    // Load invoice with ownership validation (Layer 3 Security)
    const invoice = store.getInvoice(id, user.role, user.clientId);
    if (!invoice) {
      // 404 to avoid document leakage
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Initialize jsPDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Color Palette
    const primaryColor = "#1e293b"; // Slate 800
    const secondaryColor = "#475569"; // Slate 600
    const accentColor = "#2563eb"; // Blue 600
    const lightBg = "#f8fafc"; // Slate 50
    const gridBorder = "#e2e8f0"; // Slate 200

    // Set Font Family & Sizes
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(primaryColor);

    // Company Header
    doc.text("NEXUS CORPORATE SERVICES", 20, 25);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor);
    doc.text("100 Broadway, 24th Floor, New York, NY 10005 | billing@nexus.com", 20, 31);

    // Divider Line
    doc.setDrawColor(gridBorder);
    doc.setLineWidth(0.5);
    doc.line(20, 36, 190, 36);

    // Title Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text("INVOICE RECEIPT", 20, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.number}`, 20, 55);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 61);
    doc.text(`Issued Date: ${invoice.issuedDate}`, 20, 67);
    doc.text(`Due Date: ${invoice.dueDate}`, 20, 73);

    // Client Info Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("BILLED TO:", 110, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(invoice.clientName, 110, 55);
    doc.text(invoice.clientEmail, 110, 61);
    if (invoice.paidAt) {
      doc.text(`Paid Date: ${invoice.paidAt}`, 110, 67);
    }

    // Line Items Header Table
    let currentY = 85;
    doc.setFillColor(lightBg);
    doc.rect(20, currentY, 170, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primaryColor);
    doc.text("Description", 23, currentY + 5);
    doc.text("Qty", 120, currentY + 5);
    doc.text("Rate", 140, currentY + 5);
    doc.text("Amount", 165, currentY + 5);

    // Line Items Data Rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor);
    
    invoice.lineItems.forEach((item) => {
      currentY += 10;
      doc.text(item.description, 23, currentY + 5);
      doc.text(String(item.quantity), 121, currentY + 5);
      doc.text(`$${item.rate.toFixed(2)}`, 141, currentY + 5);
      doc.text(`$${(item.quantity * item.rate).toFixed(2)}`, 166, currentY + 5);
      
      // Border line below row
      doc.line(20, currentY + 8, 190, currentY + 8);
    });

    // Summary Calculations Block
    currentY += 18;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor);
    doc.text("Subtotal:", 130, currentY);
    doc.text(`$${invoice.subtotal.toFixed(2)}`, 165, currentY);

    currentY += 6;
    doc.text("Tax (8.875% NY):", 130, currentY);
    doc.text(`$${invoice.tax.toFixed(2)}`, 165, currentY);

    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor);
    doc.setFontSize(11);
    doc.text("Total Paid / Due:", 130, currentY);
    doc.text(`$${invoice.total.toFixed(2)}`, 165, currentY);

    // Footer terms
    currentY += 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text("Thank you for choosing Nexus Corporate Services.", 20, currentY);
    doc.text("For questions regarding billing or compliance, contact support@nexus.com.", 20, currentY + 4);

    // Build PDF output buffer
    const pdfOutput = doc.output("arraybuffer");

    return new Response(pdfOutput, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`
      }
    });
  } catch (error: any) {
    console.error("PDF generation failed:", error);
    if (error.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
