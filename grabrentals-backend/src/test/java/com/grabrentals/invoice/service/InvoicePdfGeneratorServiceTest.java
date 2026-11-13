package com.grabrentals.invoice.service;

import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.user.entity.User;
import com.grabrentals.vendor.entity.Vehicle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class InvoicePdfGeneratorServiceTest {

    private InvoicePdfGeneratorService service;
    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        service = new InvoicePdfGeneratorService();

        User customer = User.builder()
                .name("Arun Kumar")
                .phone("+919876543210")
                .email("arun@example.com")
                .build();

        Vehicle vehicle = Vehicle.builder()
                .model("Toyota Innova Crysta")
                .vehicleNumber("KA-01-MJ-5678")
                .build();

        Driver driver = Driver.builder()
                .name("Suresh Raina")
                .phone("+919845012345")
                .build();

        sampleBooking = Booking.builder()
                .bookingReference("GRB-8921")
                .customer(customer)
                .passengerName("Arun Kumar")
                .passengerPhone("+919876543210")
                .pickupCity("Bangalore")
                .dropCity("Mysore")
                .tripType("ROUND_TRIP")
                .vehicleCategory("PRIME_SEDAN")
                .assignedVehicle(vehicle)
                .assignedDriver(driver)
                .pickupDateTime(LocalDateTime.now())
                .totalFare(new BigDecimal("5250.00"))
                .advancePaid(new BigDecimal("1000.00"))
                .dueAmount(new BigDecimal("4250.00"))
                .tollCharges(new BigDecimal("180.00"))
                .parkingCharges(new BigDecimal("50.00"))
                .driverAllowanceCharges(new BigDecimal("300.00"))
                .startKm(12450.0)
                .endKm(12790.0)
                .actualKm(340.0)
                .extraKm(40.0)
                .extraKmRate(new BigDecimal("14.00"))
                .extraKmCharge(new BigDecimal("560.00"))
                .status(BookingStatus.CONFIRMED)
                .build();
    }

    @Test
    @DisplayName("Scenario 1: Generate Booking Estimate PDF")
    void testScenario1EstimatePdf() {
        byte[] pdf = service.generatePdf(sampleBooking, 1);
        assertNotNull(pdf);
        assertTrue(pdf.length > 1000);
        // Verify PDF Header
        assertEquals('%', (char) pdf[0]);
        assertEquals('P', (char) pdf[1]);
        assertEquals('D', (char) pdf[2]);
        assertEquals('F', (char) pdf[3]);
        assertEquals('-', (char) pdf[4]);
    }

    @Test
    @DisplayName("Scenario 2: Generate Confirmed Duty Voucher PDF (No OTP)")
    void testScenario2ConfirmedVoucherPdf() {
        byte[] pdf = service.generatePdf(sampleBooking, 2);
        assertNotNull(pdf);
        assertTrue(pdf.length > 1000);
        assertEquals('%', (char) pdf[0]);
        assertEquals('P', (char) pdf[1]);
        assertEquals('D', (char) pdf[2]);
        assertEquals('F', (char) pdf[3]);
        assertEquals('-', (char) pdf[4]);
    }

    @Test
    @DisplayName("Scenario 3: Generate Final Tax Invoice PDF (SAC 9966)")
    void testScenario3FinalTaxInvoicePdf() {
        sampleBooking.setStatus(BookingStatus.COMPLETED);
        sampleBooking.setFinalTotalFare(new BigDecimal("6340.00"));
        sampleBooking.setFinalGst(new BigDecimal("302.00"));
        sampleBooking.setDueAmount(BigDecimal.ZERO);

        byte[] pdf = service.generatePdf(sampleBooking, 3);
        assertNotNull(pdf);
        assertTrue(pdf.length > 1000);
        assertEquals('%', (char) pdf[0]);
        assertEquals('P', (char) pdf[1]);
        assertEquals('D', (char) pdf[2]);
        assertEquals('F', (char) pdf[3]);
        assertEquals('-', (char) pdf[4]);
    }

    @Test
    @DisplayName("Verify Dynamic Customer Add-ons Extraction & PDF Generation for GR-2026-BAS8A")
    void testCustomerAddonsExtractionAndPdfGeneration() {
        Booking customBooking = Booking.builder()
                .bookingReference("GR-2026-BAS8A")
                .passengerName("Bharath Kumar")
                .passengerPhone("+919876543210")
                .pickupCity("Chennai")
                .dropCity("Bengaluru")
                .tripType("ONE_WAY")
                .vehicleCategory("SEDAN")
                .totalFare(new BigDecimal("6029.00"))
                .finalTotalFare(new BigDecimal("6029.00"))
                .advancePaid(new BigDecimal("5901.00"))
                .dueAmount(new BigDecimal("128.00"))
                .extraKm(6.0)
                .extraKmRate(new BigDecimal("12.00"))
                .extraKmCharge(new BigDecimal("72.00"))
                .tollCharges(new BigDecimal("50.00"))
                .specialInstructions("Vehicle: Sedan | BaseFare: ₹4152 | DriverAllowance: ₹415 | Taxes: ₹251 | Language Chauffeur (English) (₹199) | Luggage Carrier Added (₹249)")
                .status(BookingStatus.COMPLETED)
                .build();

        var addons = com.grabrentals.customer.dto.BookingResponse.extractAddons(customBooking);
        assertEquals(2, addons.size());
        assertEquals("language_chauffeur", addons.get(0).getId());
        assertEquals(new BigDecimal("199"), addons.get(0).getPrice());
        assertEquals("luggage_carrier", addons.get(1).getId());
        assertEquals(new BigDecimal("249"), addons.get(1).getPrice());

        // Generate PDF across all 3 scenarios
        for (int scenario = 1; scenario <= 3; scenario++) {
            byte[] pdfBytes = service.generatePdf(customBooking, scenario);
            assertNotNull(pdfBytes);
            assertTrue(pdfBytes.length > 1000);
            assertEquals("%PDF-", new String(pdfBytes, 0, 5));
        }
    }
}
