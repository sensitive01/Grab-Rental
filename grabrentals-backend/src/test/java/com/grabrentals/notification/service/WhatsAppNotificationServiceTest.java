package com.grabrentals.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grabrentals.customer.entity.Booking;
import com.grabrentals.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;

class WhatsAppNotificationServiceTest {

    private WhatsAppNotificationService whatsAppService;

    @BeforeEach
    void setUp() {
        whatsAppService = new WhatsAppNotificationService(new ObjectMapper());
    }

    @Test
    @DisplayName("Format recipient phone numbers to 91XXXXXXXXXX correctly")
    void testFormatRecipientPhone() {
        assertEquals("919345004690", whatsAppService.formatRecipientPhone("9345004690"));
        assertEquals("919345004690", whatsAppService.formatRecipientPhone("+919345004690"));
        assertEquals("919345004690", whatsAppService.formatRecipientPhone("919345004690"));
        assertEquals("919345004690", whatsAppService.formatRecipientPhone("09345004690"));
        assertEquals("919345004690", whatsAppService.formatRecipientPhone("+91 93450 04690"));
    }

    @Test
    @DisplayName("Resolve customer name and recipient phone from booking fallback cascade")
    void testResolveRecipientAndName() {
        User customer = User.builder()
                .id(UUID.randomUUID())
                .name("Arun Kumar")
                .phone("9876543210")
                .build();

        Booking bookingWithPassenger = Booking.builder()
                .bookingReference("GBR-TEST-001")
                .passengerName("Rahul")
                .passengerPhone("9345004690")
                .customer(customer)
                .pickupCity("Bengaluru Airport")
                .dropCity("Mysore")
                .totalFare(new BigDecimal("4500.00"))
                .build();

        assertEquals("919345004690", whatsAppService.resolveRecipientPhone(bookingWithPassenger, null));
        assertEquals("Rahul", whatsAppService.resolveCustomerName(bookingWithPassenger));

        Booking bookingWithoutPassenger = Booking.builder()
                .bookingReference("GBR-TEST-002")
                .customer(customer)
                .totalFare(new BigDecimal("4500.00"))
                .build();

        assertEquals("919876543210", whatsAppService.resolveRecipientPhone(bookingWithoutPassenger, null));
        assertEquals("Arun Kumar", whatsAppService.resolveCustomerName(bookingWithoutPassenger));
    }

    @Test
    @DisplayName("Stage 1: sendBookingConfirmationBill dispatches booking_details template safely")
    void testStage1BookingDetailsTemplateSafeExecution() {
        Booking booking = Booking.builder()
                .bookingReference("GRB1025")
                .passengerName("Rahul")
                .passengerPhone("9345004690")
                .pickupCity("Bengaluru Airport")
                .dropCity("Mysore")
                .pickupDateTime(LocalDateTime.of(2026, 11, 15, 8, 30))
                .totalFare(new BigDecimal("4500.00"))
                .build();

        CompletableFuture<Boolean> future = whatsAppService.sendBookingConfirmationBill(booking, null);
        assertNotNull(future);
        assertFalse(future.join()); // false because enabled=false in unconfigured test instance
    }

    @Test
    @DisplayName("Stage 2: sendTripCompletionInvoice dispatches invoice template safely")
    void testStage2InvoiceTemplateSafeExecution() {
        Booking booking = Booking.builder()
                .bookingReference("GRB1025")
                .invoiceNumber("INV-GRB1025")
                .passengerName("Rahul")
                .passengerPhone("9345004690")
                .pickupCity("Bengaluru Airport")
                .dropCity("Mysore")
                .finalTotalFare(new BigDecimal("4760.00"))
                .build();

        CompletableFuture<Boolean> future = whatsAppService.sendTripCompletionInvoice(booking, null);
        assertNotNull(future);
        assertFalse(future.join()); // false because enabled=false in unconfigured test instance
    }

    @Test
    @DisplayName("Scenario Invoicing: Dispatches Scenarios 1, 2, and 3 without throwing")
    void testScenarioInvoicingSafeExecution() {
        Booking booking = Booking.builder()
                .bookingReference("GRB1025")
                .invoiceNumber("INV-GRB1025")
                .passengerName("Rahul")
                .passengerPhone("9345004690")
                .pickupCity("Bengaluru Airport")
                .dropCity("Mysore")
                .totalFare(new BigDecimal("4500.00"))
                .finalTotalFare(new BigDecimal("4760.00"))
                .build();

        CompletableFuture<Boolean> s1 = whatsAppService.sendScenario1BookingEstimate(booking, null);
        assertNotNull(s1);
        assertFalse(s1.join());

        CompletableFuture<Boolean> s2 = whatsAppService.sendScenario2ConfirmedVoucher(booking, null);
        assertNotNull(s2);
        assertFalse(s2.join());

        CompletableFuture<Boolean> s3 = whatsAppService.sendScenario3FinalInvoice(booking, null);
        assertNotNull(s3);
        assertFalse(s3.join());

        CompletableFuture<Boolean> sRouter = whatsAppService.sendScenarioInvoice(booking, 2, null);
        assertNotNull(sRouter);
        assertFalse(sRouter.join());
    }
}
