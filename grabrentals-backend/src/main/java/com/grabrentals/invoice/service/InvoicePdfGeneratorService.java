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
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

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
            Color brandPrimary = new Color(0, 130, 254); // Customer Electric Blue (#0082fe)
            Color amber700 = new Color(180, 83, 9);
            Color emerald700 = new Color(4, 120, 87);
            Color lightBg = new Color(248, 250, 252);
            Color borderColor = new Color(226, 232, 240);

            // Fonts
            Font brandDarkFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, slate900);
            Font brandAccentFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, brandPrimary);
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

            String docTitle = switch (scenario) {
                case 1 -> "PROVISIONAL BOOKING ESTIMATE";
                case 2 -> "BOOKING CONFIRMATION VOUCHER";
                default -> "OFFICIAL TAX INVOICE (SAC: 9966)";
            };

            // 1. Header (Brand Logo Left, Document Details Right)
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{58, 42});

            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            Paragraph brandPara = new Paragraph();
            brandPara.add(new Chunk("GRAB", brandDarkFont));
            brandPara.add(new Chunk("RENTALS", brandAccentFont));
            leftHeader.addElement(brandPara);
            leftHeader.addElement(new Paragraph("Grab Rentals Technologies Pvt. Ltd.", normalFont));
            leftHeader.addElement(new Paragraph("GSTIN: 29AABCG7890F1Z2 • Place of Supply: Karnataka (29)", metaFont));
            leftHeader.addElement(new Paragraph("Helpline: +91 9071 100 200 • Email: grabrentals2016@gmail.com", metaFont));
            headerTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph docTitlePara = new Paragraph(docTitle, docTitleFont);
            docTitlePara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(docTitlePara);

            Paragraph refPara = new Paragraph();
            refPara.setAlignment(Element.ALIGN_RIGHT);
            refPara.add(new Chunk("Booking Ref: " + bRef + "\n", normalBoldFont));
            refPara.add(new Chunk("Date: " + LocalDateTime.now().format(DATE_FORMATTER) + "\n", metaFont));
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
                tripCell.addElement(new Paragraph(cleanCity(pickupCity) + " to " + cleanCity(dropCity) + " (" + tripType + ")", normalBoldFont));
                tripCell.addElement(new Paragraph("Vehicle Category: " + formatCategoryName(booking.getVehicleCategory()), normalFont));
                tripCell.addElement(new Paragraph("Note: Fleet & chauffeur will be appointed upon confirmation.", metaFont));
            } else {
                tripCell.addElement(new Paragraph("ASSIGNED VEHICLE & CHAUFFEUR (DUTY DISPATCH)", smallLabelFont));
                boolean hasAssignedVehicle = (booking.getAssignedVehicle() != null
                        && booking.getAssignedVehicle().getVehicleNumber() != null
                        && !booking.getAssignedVehicle().getVehicleNumber().isBlank())
                        || (booking.getManualVehicleNumber() != null && !booking.getManualVehicleNumber().isBlank());
                boolean hasAssignedDriver = (booking.getAssignedDriver() != null
                        && booking.getAssignedDriver().getName() != null
                        && !booking.getAssignedDriver().getName().isBlank())
                        || (booking.getManualDriverName() != null && !booking.getManualDriverName().isBlank());

                String vModel = resolveVehicleDisplayName(booking);
                String vNum = (booking.getAssignedVehicle() != null && booking.getAssignedVehicle().getVehicleNumber() != null)
                        ? booking.getAssignedVehicle().getVehicleNumber()
                        : (booking.getManualVehicleNumber() != null && !booking.getManualVehicleNumber().isBlank()
                            ? booking.getManualVehicleNumber()
                            : "________________________ (To Be Filled)");
                String dName = (booking.getAssignedDriver() != null && booking.getAssignedDriver().getName() != null)
                        ? booking.getAssignedDriver().getName()
                        : (booking.getManualDriverName() != null && !booking.getManualDriverName().isBlank()
                            ? booking.getManualDriverName()
                            : "________________________ (To Be Filled)");
                String dPhone = (booking.getAssignedDriver() != null && booking.getAssignedDriver().getPhone() != null)
                        ? booking.getAssignedDriver().getPhone()
                        : (booking.getManualDriverPhone() != null && !booking.getManualDriverPhone().isBlank()
                            ? booking.getManualDriverPhone()
                            : (hasAssignedDriver ? "+91 Contact on File" : "________________________"));

                tripCell.addElement(new Paragraph(vModel + (hasAssignedVehicle ? (" (" + vNum + ")") : ""), normalBoldFont));
                if (!hasAssignedVehicle) {
                    tripCell.addElement(new Paragraph("Vehicle Reg No: " + vNum, normalFont));
                }
                tripCell.addElement(new Paragraph("Chauffeur: " + dName + (hasAssignedDriver ? (" (" + dPhone + ")") : ""), normalFont));
                if (!hasAssignedDriver) {
                    tripCell.addElement(new Paragraph("Chauffeur Mobile: " + dPhone, normalFont));
                }
                tripCell.addElement(new Paragraph("Route: " + cleanCity(pickupCity) + " to " + cleanCity(dropCity), metaFont));
            }
            infoTable.addCell(tripCell);
            document.add(infoTable);
            document.add(new Paragraph(" "));

            // 3. Scenario 2 (Confirmed Specifications) & Scenario 3 (Final Odometer Telemetry)
            if (scenario == 2) {
                PdfPTable specTable = new PdfPTable(4);
                specTable.setWidthPercentage(100);
                specTable.setWidths(new float[]{25, 25, 25, 25});

                String tripTypeDisplay = (booking.getTripType() != null ? booking.getTripType() : "ONE_WAY").replace("_", " ");
                Integer pkgKm = resolveBookedDistanceKm(booking);
                String pkgVal = (pkgKm != null && pkgKm > 0) ? (pkgKm + " KM Included") : "Confirmed Route";
                String pickupTimeVal = booking.getPickupDateTime() != null
                        ? booking.getPickupDateTime().format(DATE_TIME_FORMATTER)
                        : "Scheduled";
                BigDecimal rate = resolveExtraKmRate(booking);
                String extraRateVal = (rate != null) ? ("Rs " + rate.intValue() + "/KM") : "Standard Tariff";

                addTelemetryCell(specTable, "SERVICE TYPE", tripTypeDisplay, borderColor, lightBg);
                addTelemetryCell(specTable, "INCLUDED PACKAGE", pkgVal, borderColor, lightBg);
                addTelemetryCell(specTable, "PICKUP SCHEDULE", pickupTimeVal, borderColor, lightBg);
                addTelemetryCell(specTable, "EXTRA KM RATE", extraRateVal, borderColor, lightBg);

                document.add(specTable);
                document.add(new Paragraph(" "));
            } else if (scenario == 3) {
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
            itemsTable.setWidths(new float[]{8, 50, 14, 14, 14});

            String[] tableHeaders = {"S.No", "Service Description", "SAC Code", "Package / Qty", "Amount (INR)"};
            for (int i = 0; i < tableHeaders.length; i++) {
                PdfPCell hCell = new PdfPCell(new Phrase(tableHeaders[i], tableHeadFont));
                hCell.setBackgroundColor(new Color(241, 245, 249));
                hCell.setPadding(6);
                hCell.setUseAscender(true);
                hCell.setUseDescender(true);
                hCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                hCell.setBorderColor(borderColor);
                if (i != 1) {
                    hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                }
                itemsTable.addCell(hCell);
            }

            int sNo = 1;

            // Row 1: Base Rental Duty (Package minus customer addons)
            addTableRow(itemsTable, String.valueOf(sNo++), "Intercity Chauffeur Passenger Rental (" + cleanCity(pickupCity) + " to " + cleanCity(dropCity) + ")", "9966", "1 Trip", "Rs " + formatCurrency(baseRentalFare), normalFont, normalFont, metaFont, normalFont, normalBoldFont, borderColor);

            // Customer Selected Add-ons (Visible across ALL Scenarios 1, 2, 3)
            for (BookingAddonItem a : addons) {
                addTableRow(itemsTable, String.valueOf(sNo++), a.getName() + " - " + a.getDescription(), a.getSacCode() != null ? a.getSacCode() : "9966", a.getPackageQty() != null ? a.getPackageQty() : "1 Unit", "Rs " + formatCurrency(a.getPrice() != null ? a.getPrice() : BigDecimal.ZERO), normalFont, normalFont, metaFont, normalFont, normalBoldFont, borderColor);
            }

            // Post-Trip Extras (Strictly Scenario 3 ONLY)
            if (scenario == 3) {
                if (extraKmCharge.compareTo(BigDecimal.ZERO) > 0) {
                    addTableRow(itemsTable, String.valueOf(sNo++), "Extra Distance Traveled Beyond Package (" + (booking.getExtraKm() != null ? booking.getExtraKm() : 0) + " KM)", "9966", (booking.getExtraKm() != null ? booking.getExtraKm() : 0) + " KM", "Rs " + formatCurrency(extraKmCharge), normalFont, normalFont, metaFont, normalFont, normalBoldFont, borderColor);
                }
                if (tolls.compareTo(BigDecimal.ZERO) > 0) {
                    addTableRow(itemsTable, String.valueOf(sNo++), "Highway Express Tolls & FASTag Receipts", "9966", "Actuals", "Rs " + formatCurrency(tolls), normalFont, normalFont, metaFont, normalFont, normalBoldFont, borderColor);
                }
                if (parking.compareTo(BigDecimal.ZERO) > 0) {
                    addTableRow(itemsTable, String.valueOf(sNo++), "Airport & Station Parking Charges", "9966", "Actuals", "Rs " + formatCurrency(parking), normalFont, normalFont, metaFont, normalFont, normalBoldFont, borderColor);
                }
                if (allowance.compareTo(BigDecimal.ZERO) > 0) {
                    addTableRow(itemsTable, String.valueOf(sNo++), "Chauffeur Night / Extra Duty Allowance", "9966", "Actuals", "Rs " + formatCurrency(allowance), normalFont, normalFont, metaFont, normalFont, normalBoldFont, borderColor);
                }
                if (other.compareTo(BigDecimal.ZERO) > 0) {
                    addTableRow(itemsTable, String.valueOf(sNo++), "Other Verified Expenses" + (booking.getOtherChargesNotes() != null ? " (" + booking.getOtherChargesNotes() + ")" : ""), "9966", "Actuals", "Rs " + formatCurrency(other), normalFont, normalFont, metaFont, normalFont, normalBoldFont, borderColor);
                }
                if (extrasGst.compareTo(BigDecimal.ZERO) > 0) {
                    addTableRow(itemsTable, String.valueOf(sNo++), "Applicable GST on Additional Trip Extras (5%)", "9966", "5%", "Rs " + formatCurrency(extrasGst), normalFont, normalFont, metaFont, normalFont, normalBoldFont, borderColor);
                }
            }

            // Dedicated Row Total at the end of the itemized table
            PdfPCell totalLabelCell = new PdfPCell(new Phrase("Total", tableHeadFont));
            totalLabelCell.setColspan(4);
            totalLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            totalLabelCell.setUseAscender(true);
            totalLabelCell.setUseDescender(true);
            totalLabelCell.setPadding(6);
            totalLabelCell.setBackgroundColor(new Color(248, 250, 252));
            totalLabelCell.setBorderColor(borderColor);
            itemsTable.addCell(totalLabelCell);

            PdfPCell totalValCell = new PdfPCell(new Phrase("Rs " + formatCurrency(totalFare), normalBoldFont));
            totalValCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            totalValCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            totalValCell.setUseAscender(true);
            totalValCell.setUseDescender(true);
            totalValCell.setPadding(6);
            totalValCell.setBackgroundColor(new Color(248, 250, 252));
            totalValCell.setBorderColor(borderColor);
            itemsTable.addCell(totalValCell);

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

            // 6. Signatures (Scenario 2: Duty Slip / Trip Sheet)
            if (scenario == 2) {
                PdfPTable sigTable = new PdfPTable(2);
                sigTable.setWidthPercentage(100);
                sigTable.setWidths(new float[]{50, 50});

                PdfPCell custSigCell = new PdfPCell();
                custSigCell.setBorder(Rectangle.NO_BORDER);
                custSigCell.setPaddingTop(12);
                custSigCell.addElement(new Paragraph("Customer / Passenger Signature: _______________________", metaFont));
                sigTable.addCell(custSigCell);

                PdfPCell driverSigCell = new PdfPCell();
                driverSigCell.setBorder(Rectangle.NO_BORDER);
                driverSigCell.setPaddingTop(12);
                driverSigCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                Paragraph dSigP = new Paragraph("Chauffeur Signature: _______________________", metaFont);
                dSigP.setAlignment(Element.ALIGN_RIGHT);
                driverSigCell.addElement(dSigP);
                sigTable.addCell(driverSigCell);

                document.add(sigTable);
            }

            // 7. Footer
            Paragraph footer = new Paragraph(
                    "\nThank you for choosing Grab Rentals! This is a computer-generated document under the Information Technology Act.\nHelpline: +91 9071 100 200 • www.grabrentals.in • grabrentals2016@gmail.com",
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

    private void addTableRow(PdfPTable table, String sNo, String desc, String sac, String qty, String amount,
                             Font sNoFont, Font descFont, Font sacFont, Font qtyFont, Font amountFont, Color borderColor) {
        PdfPCell c0 = new PdfPCell(new Phrase(sNo, sNoFont));
        c0.setHorizontalAlignment(Element.ALIGN_CENTER);
        c0.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c0.setUseAscender(true);
        c0.setUseDescender(true);
        c0.setPadding(6);
        c0.setBorderColor(borderColor);
        table.addCell(c0);

        PdfPCell c1 = new PdfPCell(new Phrase(desc, descFont));
        c1.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c1.setUseAscender(true);
        c1.setUseDescender(true);
        c1.setPadding(6);
        c1.setLeading(2.5f, 1.2f);
        c1.setBorderColor(borderColor);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(sac, sacFont));
        c2.setHorizontalAlignment(Element.ALIGN_CENTER);
        c2.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c2.setUseAscender(true);
        c2.setUseDescender(true);
        c2.setPadding(6);
        c2.setBorderColor(borderColor);
        table.addCell(c2);

        PdfPCell c3 = new PdfPCell(new Phrase(qty, qtyFont));
        c3.setHorizontalAlignment(Element.ALIGN_CENTER);
        c3.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c3.setUseAscender(true);
        c3.setUseDescender(true);
        c3.setPadding(6);
        c3.setBorderColor(borderColor);
        table.addCell(c3);

        PdfPCell c4 = new PdfPCell(new Phrase(amount, amountFont));
        c4.setHorizontalAlignment(Element.ALIGN_CENTER);
        c4.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c4.setUseAscender(true);
        c4.setUseDescender(true);
        c4.setPadding(6);
        c4.setBorderColor(borderColor);
        table.addCell(c4);
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

    private String cleanCity(String city) {
        if (city == null || city.isBlank()) return "";
        // Remove parenthesized notes like (City Center / Main Landmark)
        String cleaned = city.replaceAll("\\s*\\([^)]*\\)", "");
        // Split on comma or dash or slash
        String[] parts = cleaned.split("[,\\-/]");
        if (parts.length > 0 && !parts[0].trim().isBlank()) {
            return parts[0].trim();
        }
        return city.trim();
    }

    private String resolveVehicleDisplayName(Booking booking) {
        String rawModel = null;
        if (booking.getAssignedVehicle() != null && booking.getAssignedVehicle().getModel() != null) {
            rawModel = booking.getAssignedVehicle().getModel().trim();
        } else if (booking.getManualVehicleModel() != null && !booking.getManualVehicleModel().isBlank()) {
            rawModel = booking.getManualVehicleModel().trim();
        }

        String category = booking.getVehicleCategory() != null ? booking.getVehicleCategory().trim() : null;
        if (category == null && booking.getAssignedVehicle() != null && booking.getAssignedVehicle().getVehicleType() != null) {
            category = booking.getAssignedVehicle().getVehicleType().trim();
        }

        boolean isGeneric = rawModel == null || rawModel.isBlank()
                || rawModel.equalsIgnoreCase("Commercial Vehicle")
                || rawModel.equalsIgnoreCase("Commercial Fleet")
                || rawModel.equalsIgnoreCase("Commercial AC Fleet")
                || rawModel.equalsIgnoreCase("Commercial")
                || rawModel.equalsIgnoreCase("Fleet")
                || rawModel.equalsIgnoreCase("Vehicle")
                || rawModel.equalsIgnoreCase("Cab")
                || rawModel.equalsIgnoreCase("Car");

        if (!isGeneric) {
            return rawModel;
        }

        return formatCategoryName(category);
    }

    private String formatCategoryName(String cat) {
        if (cat == null || cat.isBlank()) return "AC Cab";
        String upper = cat.toUpperCase();
        if (upper.contains("SUV_6") || upper.equals("SUV-6") || upper.equals("SUV6")) return "SUV (6 Seater)";
        if (upper.contains("SUV_7") || upper.equals("SUV-7") || upper.equals("SUV7")) return "SUV (7 Seater)";
        if (upper.contains("SUV")) return "SUV (6 Seater)";
        if (upper.contains("SEDAN")) return "Sedan (Dzire / Etios)";
        if (upper.contains("INNOVA")) return "Innova Crysta";
        if (upper.contains("HATCHBACK")) return "Hatchback (WagonR / Swift)";
        if (upper.contains("TEMPO") || upper.contains("TRAVELLER")) return "Tempo Traveller";
        return cat.replace("_", " ");
    }

    private Integer resolveBookedDistanceKm(Booking booking) {
        if (booking.getActualKm() != null && booking.getActualKm() > 0) {
            return (int) Math.round(booking.getActualKm());
        }
        if (booking.getSpecialInstructions() != null) {
            java.util.regex.Matcher mDist = java.util.regex.Pattern.compile("Distance:\\s*(\\d+(\\.\\d+)?)\\s*km", java.util.regex.Pattern.CASE_INSENSITIVE)
                    .matcher(booking.getSpecialInstructions());
            if (mDist.find()) {
                try {
                    return (int) Math.round(Double.parseDouble(mDist.group(1)));
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private BigDecimal resolveExtraKmRate(Booking booking) {
        if (booking.getExtraKmRate() != null && booking.getExtraKmRate().compareTo(BigDecimal.ZERO) > 0) {
            return booking.getExtraKmRate();
        }
        if (booking.getSpecialInstructions() != null) {
            java.util.regex.Matcher mRate = java.util.regex.Pattern.compile("Rate:\\s*₹?(\\d+(\\.\\d+)?)", java.util.regex.Pattern.CASE_INSENSITIVE)
                    .matcher(booking.getSpecialInstructions());
            if (mRate.find()) {
                try {
                    return new BigDecimal(mRate.group(1));
                } catch (Exception ignored) {}
            }
        }
        return null;
    }
}
