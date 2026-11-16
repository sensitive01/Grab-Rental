package com.grabrentals.invoice.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.junit.jupiter.api.Assertions.*;

public class OpenPdfGenerationTest {

    @Test
    @DisplayName("OpenPDF generates authentic Grab Rentals Invoice PDF successfully")
    void testGenerateInvoicePdfWithOpenPdf() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // 1. Initialize Document
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, baos);
        document.open();

        // Fonts
        Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(15, 23, 42)); // Slate-900
        Font brandAccentFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(0, 130, 254)); // Customer Electric Blue (#0082fe)
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(30, 41, 59));
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(100, 116, 139));
        Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(51, 65, 85));
        Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 65, 85));
        Font boldCellFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));
        Font amountFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(180, 83, 9)); // Amber-700

        // 2. Header Table (Logo / Brand on left, Invoice Info on right)
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60, 40});

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        Paragraph brandPara = new Paragraph();
        brandPara.add(new Chunk("GRAB", brandFont));
        brandPara.add(new Chunk("RENTALS", brandAccentFont));
        leftCell.addElement(brandPara);
        leftCell.addElement(new Paragraph("Grab Rentals Technologies Pvt. Ltd.", subTitleFont));
        leftCell.addElement(new Paragraph("GSTIN: 29AABCG7890F1Z2 • Place of Supply: Karnataka (29)", subTitleFont));
        leftCell.addElement(new Paragraph("Helpline: +91 9071 100 200 • grabrentals2016@gmail.com", subTitleFont));
        headerTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph invTitle = new Paragraph("BOOKING CONFIRMATION", titleFont);
        invTitle.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(invTitle);

        Paragraph invDetails = new Paragraph();
        invDetails.setAlignment(Element.ALIGN_RIGHT);
        invDetails.add(new Chunk("Booking Ref: GRB1025\n", boldCellFont));
        invDetails.add(new Chunk("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) + "\n", subTitleFont));
        rightCell.addElement(invDetails);
        headerTable.addCell(rightCell);

        document.add(headerTable);
        document.add(new Paragraph(" "));

        // 3. Customer & Trip Itinerary Box
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{50, 50});

        PdfPCell custCell = new PdfPCell();
        custCell.setBackgroundColor(new Color(248, 250, 252));
        custCell.setPadding(10);
        custCell.setBorderColor(new Color(226, 232, 240));
        custCell.addElement(new Paragraph("CUSTOMER DETAILS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(148, 163, 184))));
        custCell.addElement(new Paragraph("Rahul", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK)));
        custCell.addElement(new Paragraph("Phone: +91 9345004690", cellFont));
        custCell.addElement(new Paragraph("Pickup: Bengaluru Airport, Terminal 1", cellFont));
        infoTable.addCell(custCell);

        PdfPCell tripCell = new PdfPCell();
        tripCell.setBackgroundColor(new Color(248, 250, 252));
        tripCell.setPadding(10);
        tripCell.setBorderColor(new Color(226, 232, 240));
        tripCell.addElement(new Paragraph("CONFIRMED FLEET & CHAUFFEUR (NO OTP REQUIRED)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(148, 163, 184))));
        tripCell.addElement(new Paragraph("Toyota Innova Crysta (KA-01-MJ-8899)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK)));
        tripCell.addElement(new Paragraph("Chauffeur: Ramesh Kumar (+91 9876543210)", cellFont));
        tripCell.addElement(new Paragraph("Route: Bengaluru Airport to Mysore", cellFont));
        infoTable.addCell(tripCell);

        document.add(infoTable);
        document.add(new Paragraph(" "));

        // 4. Line Items Table
        PdfPTable itemsTable = new PdfPTable(5);
        itemsTable.setWidthPercentage(100);
        itemsTable.setWidths(new float[]{8, 50, 14, 14, 14});

        String[] headers = {"S.No", "Service Description", "SAC Code", "Qty / Package", "Amount (INR)"};
        for (int i = 0; i < headers.length; i++) {
            PdfPCell hCell = new PdfPCell(new Phrase(headers[i], tableHeaderFont));
            hCell.setBackgroundColor(new Color(241, 245, 249));
            hCell.setPadding(6);
            hCell.setUseAscender(true);
            hCell.setUseDescender(true);
            hCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            hCell.setBorderColor(new Color(203, 213, 225));
            if (i != 1) {
                hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            }
            itemsTable.addCell(hCell);
        }

        // Helper to add centered rows
        java.util.function.Consumer<String[]> addRow = (vals) -> {
            PdfPCell c0 = new PdfPCell(new Phrase(vals[0], cellFont));
            c0.setHorizontalAlignment(Element.ALIGN_CENTER);
            c0.setVerticalAlignment(Element.ALIGN_MIDDLE);
            c0.setUseAscender(true);
            c0.setUseDescender(true);
            c0.setPadding(6);
            c0.setBorderColor(new Color(203, 213, 225));
            itemsTable.addCell(c0);

            PdfPCell c1 = new PdfPCell(new Phrase(vals[1], cellFont));
            c1.setVerticalAlignment(Element.ALIGN_MIDDLE);
            c1.setUseAscender(true);
            c1.setUseDescender(true);
            c1.setPadding(6);
            c1.setLeading(2.5f, 1.2f);
            c1.setBorderColor(new Color(203, 213, 225));
            itemsTable.addCell(c1);

            PdfPCell c2 = new PdfPCell(new Phrase(vals[2], cellFont));
            c2.setHorizontalAlignment(Element.ALIGN_CENTER);
            c2.setVerticalAlignment(Element.ALIGN_MIDDLE);
            c2.setUseAscender(true);
            c2.setUseDescender(true);
            c2.setPadding(6);
            c2.setBorderColor(new Color(203, 213, 225));
            itemsTable.addCell(c2);

            PdfPCell c3 = new PdfPCell(new Phrase(vals[3], cellFont));
            c3.setHorizontalAlignment(Element.ALIGN_CENTER);
            c3.setVerticalAlignment(Element.ALIGN_MIDDLE);
            c3.setUseAscender(true);
            c3.setUseDescender(true);
            c3.setPadding(6);
            c3.setBorderColor(new Color(203, 213, 225));
            itemsTable.addCell(c3);

            PdfPCell c4 = new PdfPCell(new Phrase(vals[4], boldCellFont));
            c4.setHorizontalAlignment(Element.ALIGN_CENTER);
            c4.setVerticalAlignment(Element.ALIGN_MIDDLE);
            c4.setUseAscender(true);
            c4.setUseDescender(true);
            c4.setPadding(6);
            c4.setBorderColor(new Color(203, 213, 225));
            itemsTable.addCell(c4);
        };

        // Row 1: Base Fare
        addRow.accept(new String[]{"1", "Intercity Chauffeur Car Rental Duty (Bengaluru Airport -> Mysore)", "9966", "1 Trip", "Rs 4,500.00"});
        // Row 2: Chauffeur Allowance
        addRow.accept(new String[]{"2", "Commercial Chauffeur Duty Allowance & Highway Batta", "9966", "Included", "Rs 0.00"});
        // Row 3: Tolls
        addRow.accept(new String[]{"3", "Expressway FASTag Tolls & Passenger Taxes", "9966", "Included", "Rs 0.00"});

        // Row Total
        PdfPCell totalLabelCell = new PdfPCell(new Phrase("Total", tableHeaderFont));
        totalLabelCell.setColspan(4);
        totalLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalLabelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        totalLabelCell.setUseAscender(true);
        totalLabelCell.setUseDescender(true);
        totalLabelCell.setPadding(6);
        totalLabelCell.setBackgroundColor(new Color(248, 250, 252));
        totalLabelCell.setBorderColor(new Color(203, 213, 225));
        itemsTable.addCell(totalLabelCell);

        PdfPCell totalValCell = new PdfPCell(new Phrase("Rs 4,500.00", boldCellFont));
        totalValCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        totalValCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        totalValCell.setUseAscender(true);
        totalValCell.setUseDescender(true);
        totalValCell.setPadding(6);
        totalValCell.setBackgroundColor(new Color(248, 250, 252));
        totalValCell.setBorderColor(new Color(203, 213, 225));
        itemsTable.addCell(totalValCell);

        document.add(itemsTable);
        document.add(new Paragraph(" "));

        // 5. Total & Balance Calculation Box
        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(100);
        totalTable.setWidths(new float[]{60, 40});

        PdfPCell termsCell = new PdfPCell();
        termsCell.setBorder(Rectangle.NO_BORDER);
        termsCell.addElement(new Paragraph("Payment Terms & Notes:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK)));
        termsCell.addElement(new Paragraph("• Advance paid online: Rs 1,000.00", subTitleFont));
        termsCell.addElement(new Paragraph("• Balance payable to chauffeur upon drop: Rs 3,500.00", subTitleFont));
        termsCell.addElement(new Paragraph("• Total tariff is all-inclusive of vehicle rental, fuel, chauffeur batta, and GST under SAC 9966.", subTitleFont));
        totalTable.addCell(termsCell);

        PdfPCell calcCell = new PdfPCell();
        calcCell.setBackgroundColor(new Color(248, 250, 252));
        calcCell.setPadding(8);
        calcCell.setBorderColor(new Color(226, 232, 240));
        calcCell.addElement(new Paragraph("Total Tariff: Rs 4,500.00", boldCellFont));
        calcCell.addElement(new Paragraph("Advance Paid: - Rs 1,000.00", FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(5, 150, 105))));
        calcCell.addElement(new Paragraph("Balance to Driver: Rs 3,500.00", amountFont));
        totalTable.addCell(calcCell);

        document.add(totalTable);

        // 6. Footer
        Paragraph footer = new Paragraph("\nThank you for choosing Grab Rentals! This is a computer-generated document under the IT Act.\nHelpline: +91 9071 100 200 • www.grabrentals.in", subTitleFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();

        // 7. Verification Assertions
        byte[] pdfBytes = baos.toByteArray();
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 1000, "PDF size should be at least 1 KB");

        // Verify PDF Magic Bytes (%PDF-)
        assertEquals('%', (char) pdfBytes[0]);
        assertEquals('P', (char) pdfBytes[1]);
        assertEquals('D', (char) pdfBytes[2]);
        assertEquals('F', (char) pdfBytes[3]);
        assertEquals('-', (char) pdfBytes[4]);

        // Write to target directory for physical inspection
        File outputDir = new File("target/generated-invoices");
        outputDir.mkdirs();
        File samplePdf = new File(outputDir, "test_generated_invoice_" + System.currentTimeMillis() + ".pdf");
        Files.write(samplePdf.toPath(), pdfBytes);

        System.out.println("==================================================================");
        System.out.println("✅ [OpenPDF SUCCESS] Original Grab Rentals PDF generated successfully!");
        System.out.println("  File Path : " + samplePdf.getAbsolutePath());
        System.out.println("  File Size : " + pdfBytes.length + " bytes (" + (pdfBytes.length / 1024) + " KB)");
        System.out.println("  PDF Magic : " + new String(pdfBytes, 0, 5));
        System.out.println("==================================================================");
    }
}

