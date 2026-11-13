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
        Font brandAccentFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(245, 158, 11)); // Amber-500
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
        brandPara.add(new Chunk("RENTAL", brandAccentFont));
        leftCell.addElement(brandPara);
        leftCell.addElement(new Paragraph("Grab Rental Technologies Pvt. Ltd.", subTitleFont));
        leftCell.addElement(new Paragraph("GSTIN: 29AABCG7890F1Z2 • Place of Supply: Karnataka (29)", subTitleFont));
        leftCell.addElement(new Paragraph("Helpline: +91 9071 100 200 • grabrentals2016@gmail.com", subTitleFont));
        headerTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph invTitle = new Paragraph("CONFIRMED DUTY VOUCHER", titleFont);
        invTitle.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(invTitle);

        Paragraph invDetails = new Paragraph();
        invDetails.setAlignment(Element.ALIGN_RIGHT);
        invDetails.add(new Chunk("Voucher No: INV-GRB1025\n", boldCellFont));
        invDetails.add(new Chunk("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) + "\n", subTitleFont));
        invDetails.add(new Chunk("Booking Ref: GRB1025\n", boldCellFont));
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
        itemsTable.setWidths(new float[]{8, 47, 15, 15, 15});

        String[] headers = {"#", "Service Description", "SAC Code", "Qty / Package", "Amount (INR)"};
        for (String h : headers) {
            PdfPCell hCell = new PdfPCell(new Phrase(h, tableHeaderFont));
            hCell.setBackgroundColor(new Color(241, 245, 249));
            hCell.setPadding(6);
            hCell.setBorderColor(new Color(203, 213, 225));
            itemsTable.addCell(hCell);
        }

        // Row 1: Base Fare
        itemsTable.addCell(new Phrase("1", cellFont));
        itemsTable.addCell(new Phrase("Intercity Chauffeur Car Rental Duty (Bengaluru Airport -> Mysore)", cellFont));
        itemsTable.addCell(new Phrase("9966", cellFont));
        itemsTable.addCell(new Phrase("1 Trip", cellFont));
        itemsTable.addCell(new Phrase("Rs 4,500.00", boldCellFont));

        // Row 2: Chauffeur Allowance
        itemsTable.addCell(new Phrase("2", cellFont));
        itemsTable.addCell(new Phrase("Commercial Chauffeur Duty Allowance & Highway Batta", cellFont));
        itemsTable.addCell(new Phrase("9966", cellFont));
        itemsTable.addCell(new Phrase("Included", cellFont));
        itemsTable.addCell(new Phrase("Rs 0.00", cellFont));

        // Row 3: Tolls
        itemsTable.addCell(new Phrase("3", cellFont));
        itemsTable.addCell(new Phrase("Expressway FASTag Tolls & Passenger Taxes", cellFont));
        itemsTable.addCell(new Phrase("9966", cellFont));
        itemsTable.addCell(new Phrase("Included", cellFont));
        itemsTable.addCell(new Phrase("Rs 0.00", cellFont));

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
        Paragraph footer = new Paragraph("\nThank you for choosing Grab Rental! This is a computer-generated document under the IT Act.\nHelpline: +91 9071 100 200 • www.grabrentals.in", subTitleFont);
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

