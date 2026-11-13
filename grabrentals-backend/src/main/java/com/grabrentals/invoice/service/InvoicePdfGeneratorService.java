package com.grabrentals.invoice.service;

import com.grabrentals.customer.dto.BookingAddonItem;
import com.grabrentals.customer.dto.BookingResponse;
import com.grabrentals.customer.entity.Booking;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class InvoicePdfGeneratorService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    /**
     * Generates an authentic A4 PDF document for the given booking and scenario.
     * Scenario 1: Initial Booking Estimate Bill
     * Scenario 2: Confirmed Duty Voucher & Slip (Strictly NO OTP)
     * Scenario 3: Final Settlement Tax Invoice (SAC 9966)
     */
    public byte[] generatePdf(Booking booking, int scenario) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking entity cannot be null for PDF generation");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Color Palette
            Color slate900 = new Color(15, 23, 42);
            Color slate700 = new Color(51, 65, 85);
            Color slate500 = new Color(100, 116, 139);
            Color slate400 = new Color(148, 163, 184);
            Color amber500 = new Color(245, 158, 11);
            Color amber700 = new Color(180, 83, 9);
            Color emerald700 = new Color(4, 120, 87);
            Color lightBg = new Color(248, 250, 252);
            Color borderColor = new Color(226, 232, 240);

            // Fonts
            Font brandDarkFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, slate900);
            Font brandAmberFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, amber500);
            Font docTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, slate900);
            Font smallLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, slate400);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 8, slate700);
            Font normalBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, slate900);
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 8, slate500);
            Font tableHeadFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, slate700);
            Font finalAmountFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, amber700);

            String bRef = booking.getBookingReference() != null ? booking.getBookingReference() : "GRB1025";
            String invNum = booking.getInvoiceNumber() != null ? booking.getInvoiceNumber() : ("INV-" + bRef.replaceAll("[^A-Za-z0-9]", ""));
            String customerName = resolveCustomerName(booking);
            String customerPhone = resolveCustomerPhone(booking);
            String pickupCity = booking.getPickupCity() != null ? booking.getPickupCity() : "Origin";
            String dropCity = booking.getDropCity() != null ? booking.getDropCity() : "Destination";
            String tripType = (booking.getTripType() != null ? booking.getTripType() : "ONE_WAY").replace("_", " ");

            // Extract customer addons
            java.util.List<BookingAddonItem> addons = BookingResponse.extractAddons(booking);
            BigDecimal addonsTotal = BigDecimal.ZERO;
            for (BookingAddonItem a : addons) {
                if (a.getPrice() != null) {
                    addonsTotal = addonsTotal.add(a.getPrice());
                }
            }

            // Calculate post-trip extras (for Scenario 3 only)
            BigDecimal extraKmCharge = (booking.getExtraKmCharge() != null && booking.getExtraKmCharge().compareTo(BigDecimal.ZERO) > 0)
                    ? booking.getExtraKmCharge() : BigDecimal.ZERO;
            BigDecimal tolls = (booking.getTollCharges() != null && booking.getTollCharges().compareTo(BigDecimal.ZERO) > 0)
                    ? booking.getTollCharges() : BigDecimal.ZERO;
            BigDecimal permits = (booking.getPermitCharges() != null && booking.getPermitCharges().compareTo(BigDecimal.ZERO) > 0)
                    ? booking.getPermitCharges() : BigDecimal.ZERO;
            BigDecimal parking = (booking.getParkingCharges() != null && booking.getParkingCharges().compareTo(BigDecimal.ZERO) > 0)
                    ? booking.getParkingCharges() : BigDecimal.ZERO;
            BigDecimal allowance = (booking.getDriverAllowanceCharges() != null && booking.getDriverAllowanceCharges().compareTo(BigDecimal.ZERO) > 0)
                    ? booking.getDriverAllowanceCharges() : BigDecimal.ZERO;
            BigDecimal other = (booking.getOtherCharges() != null && booking.getOtherCharges().compareTo(BigDecimal.ZERO) > 0)
                    ? booking.getOtherCharges() : BigDecimal.ZERO;

            BigDecimal totalExtrasBeforeGst = extraKmCharge.add(tolls).add(permits).add(parking).add(allowance).add(other);
            BigDecimal extrasGst = totalExtrasBeforeGst.multiply(new BigDecimal("0.05")).setScale(0, RoundingMode.HALF_UP);
            BigDecimal tripClosingExtrasTotal = totalExtrasBeforeGst.add(extrasGst);

            // In Scenario 1 & 2: Trip hasn't finished yet. Only initial booked fare is considered.
            // In Scenario 3: Final total fare includes trip closing extras.
            BigDecimal initialBookedFare;
            if (booking.getFinalTotalFare() != null && tripClosingExtrasTotal.compareTo(BigDecimal.ZERO) > 0) {
                initialBookedFare = booking.getFinalTotalFare().subtract(tripClosingExtrasTotal).max(BigDecimal.ZERO);
            } else if (booking.getTotalFare() != null) {
                initialBookedFare = booking.getTotalFare();
            } else {
                initialBookedFare = new BigDecimal("4500");
            }

            BigDecimal totalFare = (scenario == 3 && booking.getFinalTotalFare() != null)
                    ? booking.getFinalTotalFare()
                    : (scenario == 3 && tripClosingExtrasTotal.compareTo(BigDecimal.ZERO) > 0)
                        ? initialBookedFare.add(tripClosingExtrasTotal)
                        : initialBookedFare;

            BigDecimal baseRentalFare = initialBookedFare.subtract(addonsTotal).max(BigDecimal.ZERO);

            BigDecimal advancePaid = booking.getAdvancePaid() != null ? booking.getAdvancePaid() : BigDecimal.ZERO;
            BigDecimal balanceDue = (scenario == 3)
                    ? BigDecimal.ZERO
                    : totalFare.subtract(advancePaid).max(BigDecimal.ZERO);

            String docTitle;
            String docBadge;
            Color badgeBgColor;
            switch (scenario) {
                case 1 -> {
                    docTitle = "PROVISIONAL BOOKING ESTIMATE";
                    docBadge = "SCENARIO 1: BOOKING CREATED";
                    badgeBgColor = new Color(239, 246, 255);
                }
                case 2 -> {
                    docTitle = "BOOKING CONFIRMATION & DUTY SLIP";
                    docBadge = "SCENARIO 2: BOOKING CONFIRMED (NO OTP)";
                    badgeBgColor = new Color(250, 245, 255);
                }
                default -> {
                    docTitle = "OFFICIAL TAX INVOICE (SAC: 9966)";
                    docBadge = "SCENARIO 3: TRIP COMPLETED & SETTLED";
                    badgeBgColor = new Color(236, 253, 245);
                }
            }

            // 1. Header (Brand Logo Left, Document Details Right)
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{58, 42});

            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            Paragraph brandPara = new Paragraph();
            brandPara.add(new Chunk("GRAB", brandDarkFont));
            brandPara.add(new Chunk("RENTAL", brandAmberFont));
            leftHeader.addElement(brandPara);
            leftHeader.addElement(new Paragraph("Grab Rental Technologies Pvt. Ltd.", normalFont));
            leftHeader.addElement(new Paragraph("GSTIN: 29AABCG7890F1Z2 • Place of Supply: Karnataka (29)", metaFont));
            leftHeader.addElement(new Paragraph("Helpline: +91 9071 100 200 • Email: grabrentals2016@gmail.com", metaFont));
            headerTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph docTitlePara = new Paragraph(docTitle, docTitleFont);
            docTitlePara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(docTitlePara);

            Paragraph badgePara = new Paragraph(docBadge, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, slate700));
            badgePara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(badgePara);

            Paragraph refPara = new Paragraph();
            refPara.setAlignment(Element.ALIGN_RIGHT);
            refPara.add(new Chunk("Doc No: " + invNum + "\n", normalBoldFont));
            refPara.add(new Chunk("Date: " + LocalDateTime.now().format(DATE_FORMATTER) + "\n", metaFont));
            refPara.add(new Chunk("Booking Ref: " + bRef + "\n", normalBoldFont));
            rightHeader.addElement(refPara);
            headerTable.addCell(rightHeader);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // 2. Customer & Itinerary Details Box
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50, 50});

            PdfPCell custCell = new PdfPCell();
            custCell.setBackgroundColor(lightBg);
            custCell.setPadding(8);
            custCell.setBorderColor(borderColor);
            custCell.addElement(new Paragraph("BILLED TO (PASSENGER)", smallLabelFont));
            custCell.addElement(new Paragraph(customerName, normalBoldFont));
            custCell.addElement(new Paragraph("Phone: " + customerPhone, normalFont));
            custCell.addElement(new Paragraph("Pickup: " + (booking.getPickupAddress() != null ? booking.getPickupAddress() : pickupCity), metaFont));
            infoTable.addCell(custCell);

            PdfPCell tripCell = new PdfPCell();
            tripCell.setBackgroundColor(lightBg);
            tripCell.setPadding(8);
            tripCell.setBorderColor(borderColor);

            if (scenario == 1) {
                tripCell.addElement(new Paragraph("REQUESTED FLEET & ROUTE", smallLabelFont));
                tripCell.addElement(new Paragraph(pickupCity + " ➔ " + dropCity + " (" + tripType + ")", normalBoldFont));
                tripCell.addElement(new Paragraph("Vehicle Category: " + (booking.getVehicleCategory() != null ? booking.getVehicleCategory() : "AC Cab"), normalFont));
                tripCell.addElement(new Paragraph("Note: Fleet & chauffeur will be appointed upon confirmation.", metaFont));
            } else {
                tripCell.addElement(new Paragraph("CONFIRMED FLEET & CHAUFFEUR (NO OTP)", smallLabelFont));
                String vModel = (booking.getAssignedVehicle() != null && booking.getAssignedVehicle().getModel() != null)
                        ? booking.getAssignedVehicle().getModel()
                        : (booking.getVehicleCategory() != null ? booking.getVehicleCategory() : "Commercial AC Fleet");
                String vNum = (booking.getAssignedVehicle() != null && booking.getAssignedVehicle().getVehicleNumber() != null)
                        ? booking.getAssignedVehicle().getVehicleNumber()
                        : "Assigned Cab";
                String dName = (booking.getAssignedDriver() != null && booking.getAssignedDriver().getName() != null)
                        ? booking.getAssignedDriver().getName()
                        : "Appointed Chauffeur";
                String dPhone = (booking.getAssignedDriver() != null && booking.getAssignedDriver().getPhone() != null)
                        ? booking.getAssignedDriver().getPhone()
                        : "+91 Contact on File";

                tripCell.addElement(new Paragraph(vModel + " (" + vNum + ")", normalBoldFont));
                tripCell.addElement(new Paragraph("Chauffeur: " + dName + " (" + dPhone + ")", normalFont));
                tripCell.addElement(new Paragraph("Route: " + pickupCity + " ➔ " + dropCity, metaFont));
            }
            infoTable.addCell(tripCell);
            document.add(infoTable);
            document.add(new Paragraph(" "));

            // 3. Scenario 3 Odometer Telemetry Strip (if Scenario 3)
            if (scenario == 3) {
                PdfPTable odoTable = new PdfPTable(4);
                odoTable.setWidthPercentage(100);
                odoTable.setWidths(new float[]{25, 25, 25, 25});

                addTelemetryCell(odoTable, "START READING", (booking.getStartKm() != null ? booking.getStartKm() + " KM" : "—"), borderColor, lightBg);
                addTelemetryCell(odoTable, "END READING", (booking.getEndKm() != null ? booking.getEndKm() + " KM" : "—"), borderColor, lightBg);
                addTelemetryCell(odoTable, "ACTUAL DISTANCE", (booking.getActualKm() != null ? booking.getActualKm() + " KM" : "—"), borderColor, lightBg);
                addTelemetryCell(odoTable, "EXTRA DISTANCE", (booking.getExtraKm() != null && booking.getExtraKm() > 0 ? booking.getExtraKm() + " KM" : "0 KM"), borderColor, lightBg);

                document.add(odoTable);
                document.add(new Paragraph(" "));
            }

            // 4. Itemized Charges Table
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{6, 50, 14, 15, 15});

            String[] tableHeaders = {"#", "Service Description", "SAC Code", "Package / Qty", "Amount (INR)"};
            for (String h : tableHeaders) {
                PdfPCell hCell = new PdfPCell(new Phrase(h, tableHeadFont));
                hCell.setBackgroundColor(new Color(241, 245, 249));
                hCell.setPadding(6);
                hCell.setBorderColor(borderColor);
                itemsTable.addCell(hCell);
            }

            int rowNum = 1;

            // Row 1: Base Rental Duty (Package minus customer addons)
            itemsTable.addCell(new Phrase(String.valueOf(rowNum++), normalFont));
            itemsTable.addCell(new Phrase("Intercity Chauffeur Passenger Rental (" + pickupCity + " to " + dropCity + ")", normalFont));
            itemsTable.addCell(new Phrase("9966", metaFont));
            itemsTable.addCell(new Phrase("1 Trip", normalFont));
            itemsTable.addCell(new Phrase("Rs " + formatCurrency(baseRentalFare), normalBoldFont));

            // Customer Selected Add-ons (Visible across ALL Scenarios 1, 2, 3)
            for (BookingAddonItem a : addons) {
                itemsTable.addCell(new Phrase(String.valueOf(rowNum++), normalFont));
                itemsTable.addCell(new Phrase(a.getName() + " - " + a.getDescription(), normalFont));
                itemsTable.addCell(new Phrase(a.getSacCode() != null ? a.getSacCode() : "9966", metaFont));
                itemsTable.addCell(new Phrase(a.getPackageQty() != null ? a.getPackageQty() : "1 Unit", normalFont));
                itemsTable.addCell(new Phrase("Rs " + formatCurrency(a.getPrice() != null ? a.getPrice() : BigDecimal.ZERO), normalBoldFont));
            }

            // Post-Trip Extras (Strictly Scenario 3 ONLY)
            if (scenario == 3) {
                if (extraKmCharge.compareTo(BigDecimal.ZERO) > 0) {
                    itemsTable.addCell(new Phrase(String.valueOf(rowNum++), normalFont));
                    itemsTable.addCell(new Phrase("Extra Distance Traveled Beyond Package (" + (booking.getExtraKm() != null ? booking.getExtraKm() : 0) + " KM)", normalFont));
                    itemsTable.addCell(new Phrase("9966", metaFont));
                    itemsTable.addCell(new Phrase((booking.getExtraKm() != null ? booking.getExtraKm() : 0) + " KM", normalFont));
                    itemsTable.addCell(new Phrase("Rs " + formatCurrency(extraKmCharge), normalBoldFont));
                }
                if (tolls.compareTo(BigDecimal.ZERO) > 0) {
                    itemsTable.addCell(new Phrase(String.valueOf(rowNum++), normalFont));
                    itemsTable.addCell(new Phrase("Highway Express Tolls & FASTag Receipts", normalFont));
                    itemsTable.addCell(new Phrase("9966", metaFont));
                    itemsTable.addCell(new Phrase("Actuals", normalFont));
                    itemsTable.addCell(new Phrase("Rs " + formatCurrency(tolls), normalBoldFont));
                }
                if (parking.compareTo(BigDecimal.ZERO) > 0) {
                    itemsTable.addCell(new Phrase(String.valueOf(rowNum++), normalFont));
                    itemsTable.addCell(new Phrase("Airport & Station Parking Charges", normalFont));
                    itemsTable.addCell(new Phrase("9966", metaFont));
                    itemsTable.addCell(new Phrase("Actuals", normalFont));
                    itemsTable.addCell(new Phrase("Rs " + formatCurrency(parking), normalBoldFont));
                }
                if (allowance.compareTo(BigDecimal.ZERO) > 0) {
                    itemsTable.addCell(new Phrase(String.valueOf(rowNum++), normalFont));
                    itemsTable.addCell(new Phrase("Chauffeur Night / Extra Duty Allowance", normalFont));
                    itemsTable.addCell(new Phrase("9966", metaFont));
                    itemsTable.addCell(new Phrase("Actuals", normalFont));
                    itemsTable.addCell(new Phrase("Rs " + formatCurrency(allowance), normalBoldFont));
                }
                if (other.compareTo(BigDecimal.ZERO) > 0) {
                    itemsTable.addCell(new Phrase(String.valueOf(rowNum++), normalFont));
                    itemsTable.addCell(new Phrase("Other Verified Expenses" + (booking.getOtherChargesNotes() != null ? " (" + booking.getOtherChargesNotes() + ")" : ""), normalFont));
                    itemsTable.addCell(new Phrase("9966", metaFont));
                    itemsTable.addCell(new Phrase("Actuals", normalFont));
                    itemsTable.addCell(new Phrase("Rs " + formatCurrency(other), normalBoldFont));
                }
                if (extrasGst.compareTo(BigDecimal.ZERO) > 0) {
                    itemsTable.addCell(new Phrase(String.valueOf(rowNum++), normalFont));
                    itemsTable.addCell(new Phrase("Applicable GST on Additional Trip Extras (5%)", normalFont));
                    itemsTable.addCell(new Phrase("9966", metaFont));
                    itemsTable.addCell(new Phrase("5%", normalFont));
                    itemsTable.addCell(new Phrase("Rs " + formatCurrency(extrasGst), normalBoldFont));
                }
            }

            document.add(itemsTable);
            document.add(new Paragraph(" "));

            // 5. Total & Settlements Calculation Box
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(100);
            totalTable.setWidths(new float[]{60, 40});

            PdfPCell paymentNotesCell = new PdfPCell();
            paymentNotesCell.setBorder(Rectangle.NO_BORDER);
            paymentNotesCell.addElement(new Paragraph("PAYMENT METHOD & TERMS:", smallLabelFont));
            paymentNotesCell.addElement(new Paragraph("• Advance Paid Online: Rs " + formatCurrency(advancePaid) + " (" + (booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "Advance Paid") + ")", normalFont));
            if (scenario == 3) {
                paymentNotesCell.addElement(new Paragraph("• Trip completed and fully settled. Outstanding balance: Rs 0.00", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, emerald700)));
            } else if (balanceDue.compareTo(BigDecimal.ZERO) > 0) {
                paymentNotesCell.addElement(new Paragraph("• Balance Due to Chauffeur: Rs " + formatCurrency(balanceDue) + " (Payable upon drop)", normalFont));
            } else {
                paymentNotesCell.addElement(new Paragraph("• Fully paid online. Zero cash required during journey.", normalFont));
            }
            paymentNotesCell.addElement(new Paragraph("• Tariff includes vehicle rental, fuel, chauffeur allowance, and GST under SAC 9966.", metaFont));
            totalTable.addCell(paymentNotesCell);

            PdfPCell calcCell = new PdfPCell();
            calcCell.setBackgroundColor(lightBg);
            calcCell.setPadding(8);
            calcCell.setBorderColor(borderColor);
            calcCell.addElement(new Paragraph("Gross Fare: Rs " + formatCurrency(totalFare), normalBoldFont));
            calcCell.addElement(new Paragraph("Advance Paid: - Rs " + formatCurrency(advancePaid), FontFactory.getFont(FontFactory.HELVETICA, 8, emerald700)));
            if (scenario == 3 && totalFare.compareTo(advancePaid) > 0) {
                calcCell.addElement(new Paragraph("Paid at Drop: - Rs " + formatCurrency(totalFare.subtract(advancePaid)), FontFactory.getFont(FontFactory.HELVETICA, 8, emerald700)));
            }
            Paragraph balLine = new Paragraph();
            balLine.add(new Chunk(scenario == 3 ? "Final Settled Balance: Rs 0.00" : ("Balance to Driver: Rs " + formatCurrency(balanceDue)), finalAmountFont));
            calcCell.addElement(balLine);
            totalTable.addCell(calcCell);

            document.add(totalTable);

            // 6. Footer
            Paragraph footer = new Paragraph(
                    "\nThank you for choosing Grab Rental! This is a computer-generated document under the Information Technology Act.\nHelpline: +91 9071 100 200 • www.grabrentals.in • grabrentals2016@gmail.com",
                    metaFont
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF for booking {} (scenario {}): {}", booking.getBookingReference(), scenario, e.getMessage(), e);
            throw new RuntimeException("Error generating booking PDF: " + e.getMessage(), e);
        }
    }

    private void addTelemetryCell(PdfPTable table, String label, String value, Color borderColor, Color bg) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setBorderColor(borderColor);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        Paragraph pLabel = new Paragraph(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, new Color(148, 163, 184)));
        pLabel.setAlignment(Element.ALIGN_CENTER);
        Paragraph pVal = new Paragraph(value, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK));
        pVal.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pLabel);
        cell.addElement(pVal);
        table.addCell(cell);
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0.00";
        return amount.setScale(2, RoundingMode.HALF_UP).toString();
    }

    private String resolveCustomerName(Booking booking) {
        if (booking.getPassengerName() != null && !booking.getPassengerName().isBlank()) {
            return booking.getPassengerName();
        }
        if (booking.getCustomer() != null && booking.getCustomer().getName() != null && !booking.getCustomer().getName().isBlank()) {
            return booking.getCustomer().getName();
        }
        return "Valued Passenger";
    }

    private String resolveCustomerPhone(Booking booking) {
        if (booking.getPassengerPhone() != null && !booking.getPassengerPhone().isBlank()) {
            return booking.getPassengerPhone();
        }
        if (booking.getCustomer() != null && booking.getCustomer().getPhone() != null && !booking.getCustomer().getPhone().isBlank()) {
            return booking.getCustomer().getPhone();
        }
        return "+91 Contact on File";
    }
}
