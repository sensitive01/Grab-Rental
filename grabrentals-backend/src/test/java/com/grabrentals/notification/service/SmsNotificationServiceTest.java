package com.grabrentals.notification.service;

import com.grabrentals.customer.entity.Booking;
import com.grabrentals.user.entity.User;
import com.grabrentals.vendor.entity.Vehicle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;

class SmsNotificationServiceTest {

    private SmsNotificationService smsService;

    @BeforeEach
    void setUp() {
        smsService = new SmsNotificationService();
        ReflectionTestUtils.setField(smsService, "enabled", true);
        ReflectionTestUtils.setField(smsService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(smsService, "apiUrl", "https://portal.weformsolution.com/sms/api/send-campaign");
        ReflectionTestUtils.setField(smsService, "senderId", "GRABRE");
        ReflectionTestUtils.setField(smsService, "templateTripStartId", "1777179499849482015");
        ReflectionTestUtils.setField(smsService, "templateBillingOtpId", "1777179499541921245");
        ReflectionTestUtils.setField(smsService, "templateCompletionId", "1777179499870166237");
        ReflectionTestUtils.setField(smsService, "templateConfirmationId", "1777179500140963463");
    }

    @Test
    @DisplayName("Format Indian phone numbers to 91XXXXXXXXXX correctly")
    void testFormatRecipient() {
        assertEquals("917760693359", smsService.formatRecipient("7760693359"));
        assertEquals("917760693359", smsService.formatRecipient("+917760693359"));
        assertEquals("917760693359", smsService.formatRecipient("917760693359"));
        assertEquals("917760693359", smsService.formatRecipient("07760693359"));
        assertEquals("917760693359", smsService.formatRecipient("+91 77606 93359"));
    }

    @Test
    @DisplayName("Verify configuration check reflects enabled state and api key")
    void testIsConfigured() {
        assertTrue(smsService.isConfigured());

        ReflectionTestUtils.setField(smsService, "enabled", false);
        assertFalse(smsService.isConfigured());

        ReflectionTestUtils.setField(smsService, "enabled", true);
        ReflectionTestUtils.setField(smsService, "apiKey", "");
        assertFalse(smsService.isConfigured());
    }

    @Test
    @DisplayName("Send Trip Start OTP returns future without throwing exceptions")
    void testSendTripStartOtp() {
        User user = User.builder()
                .name("Dilip")
                .phone("917760693359")
                .build();

        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber("ka01aa0611")
                .build();

        Booking booking = Booking.builder()
                .bookingReference("GR1001")
                .customer(user)
                .assignedVehicle(vehicle)
                .tripType("outstation")
                .dropCity("mysore")
                .build();

        CompletableFuture<Boolean> future = smsService.sendTripStartOtp(booking, 525856.0, "854856");
        assertNotNull(future);
    }

    @Test
    @DisplayName("Send Billing OTP returns future without throwing exceptions")
    void testSendBillingOtp() {
        User user = User.builder()
                .name("Dilip")
                .phone("917760693359")
                .build();

        Booking booking = Booking.builder()
                .bookingReference("GR1001")
                .customer(user)
                .build();

        CompletableFuture<Boolean> future = smsService.sendBillingOtp(booking, 25825.0, "582548");
        assertNotNull(future);
    }

    @Test
    @DisplayName("Send Booking Completion SMS returns future without throwing exceptions")
    void testSendBookingCompletionSms() {
        User user = User.builder()
                .name("Dilip")
                .phone("917760693359")
                .build();

        Booking booking = Booking.builder()
                .bookingReference("GR1001")
                .customer(user)
                .tripType("Outstation")
                .dropCity("Mysore")
                .build();

        CompletableFuture<Boolean> future = smsService.sendBookingCompletionSms(booking, new BigDecimal("25500.00"));
        assertNotNull(future);
    }

    @Test
    @DisplayName("Send Booking Confirmation SMS returns future without throwing exceptions")
    void testSendBookingConfirmationSms() {
        User user = User.builder()
                .name("Dilip")
                .phone("919743474558")
                .build();

        Booking booking = Booking.builder()
                .bookingReference("GR1001")
                .customer(user)
                .tripType("Outstation")
                .dropCity("Mysore")
                .build();

        CompletableFuture<Boolean> future = smsService.sendBookingConfirmationSms(booking);
        assertNotNull(future);
    }
}
