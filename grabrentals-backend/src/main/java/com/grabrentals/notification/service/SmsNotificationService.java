package com.grabrentals.notification.service;

import com.grabrentals.customer.entity.Booking;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
public class SmsNotificationService {

    @Value("${app.sms.enabled:false}")
    private boolean enabled;

    @Value("${app.sms.api-url:https://portal.weformsolution.com/sms/api/send-campaign}")
    private String apiUrl;

    @Value("${app.sms.api-key:}")
    private String apiKey;

    @Value("${app.sms.sender-id:}")
    private String senderId;

    @Value("${app.sms.template-trip-start-id:}")
    private String templateTripStartId;

    @Value("${app.sms.campaign-trip-start:}")
    private String campaignTripStart;

    @Value("${app.sms.template-billing-otp-id:}")
    private String templateBillingOtpId;

    @Value("${app.sms.campaign-billing-otp:}")
    private String campaignBillingOtp;

    @Value("${app.sms.template-completion-id:}")
    private String templateCompletionId;

    @Value("${app.sms.campaign-completion:}")
    private String campaignCompletion;

    @Value("${app.sms.template-confirmation-id:}")
    private String templateConfirmationId;

    @Value("${app.sms.campaign-confirmation:}")
    private String campaignConfirmation;

    private final HttpClient httpClient;

    public SmsNotificationService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Dispatch Trip Start OTP via WeFormSolution DLT SMS API
     * DLT Pattern: Dear {#alp#} Your cab {#alp#} for the {#alp#} to {#alp#} is arrived with meter reading as {#num#} Check the opening km in the cab odometer and share the OTP {#num#} to start your trip. Happy Journey, Team Grab Rentals India
     */
    public CompletableFuture<Boolean> sendTripStartOtp(Booking booking, Double openingKm, String otp) {
        if (!isConfigured()) {
            log.info("[SMS] SMS service is disabled or credentials not configured. Skipping Trip Start OTP.");
            return CompletableFuture.completedFuture(false);
        }

        String phone = getRecipientPhone(booking);
        String recipient = formatRecipient(phone);
        if (recipient.isBlank()) {
            log.warn("[SMS] Cannot send Trip Start OTP: recipient phone is empty for booking {}", booking != null ? booking.getBookingReference() : "null");
            return CompletableFuture.completedFuture(false);
        }

        String customerName = sanitizeAlphanumeric(getCustomerName(booking), "Customer");
        String vehicleNumber = sanitizeAlphanumeric(getVehicleNumber(booking), "Cab");
        String serviceType = sanitizeAlphanumeric(getServiceType(booking), "outstation");
        String destination = sanitizeAlphanumeric(getDestinationCity(booking), "destination");
        long meterReading = Math.round(openingKm != null ? openingKm : 0);
        String startOtp = otp != null ? otp.trim() : "000000";

        String message = String.format(
                "Dear %s Your cab %s for the %s to %s is arrived with meter reading as %d Check the opening km in the cab odometer and share the OTP %s to start your trip. Happy Journey, Team Grab Rentals India",
                customerName, vehicleNumber, serviceType, destination, meterReading, startOtp
        );

        return dispatchSms(recipient, message, templateTripStartId, campaignTripStart, "Trip Start OTP", booking != null ? booking.getBookingReference() : "");
    }

    /**
     * Dispatch Billing OTP via WeFormSolution DLT SMS API
     * DLT Pattern: Dear {#alp#}, Kindly check the closing km {#num#} in the vehicle odometer before sharing this Billing OTP. Your OTP to complete the trip is {#num#} Thank you for your business, Team Grab Rentals India.
     */
    public CompletableFuture<Boolean> sendBillingOtp(Booking booking, Double closingKm, String otp) {
        if (!isConfigured()) {
            log.info("[SMS] SMS service is disabled or credentials not configured. Skipping Billing OTP.");
            return CompletableFuture.completedFuture(false);
        }

        String phone = getRecipientPhone(booking);
        String recipient = formatRecipient(phone);
        if (recipient.isBlank()) {
            log.warn("[SMS] Cannot send Billing OTP: recipient phone is empty for booking {}", booking != null ? booking.getBookingReference() : "null");
            return CompletableFuture.completedFuture(false);
        }

        String customerName = sanitizeAlphanumeric(getCustomerName(booking), "Customer");
        long meterReading = Math.round(closingKm != null ? closingKm : 0);
        String billingOtp = otp != null ? otp.trim() : "000000";

        String message = String.format(
                "Dear %s, Kindly check the closing km %d in the vehicle odometer before sharing this Billing OTP. Your OTP to complete the trip is %s Thank you for your business, Team Grab Rentals India.",
                customerName, meterReading, billingOtp
        );

        return dispatchSms(recipient, message, templateBillingOtpId, campaignBillingOtp, "Billing OTP", booking != null ? booking.getBookingReference() : "");
    }

    /**
     * Dispatch Booking Completion SMS via WeFormSolution DLT SMS API
     * DLT Pattern: Dear {#alp#} Your booking {#alp#} for the {#alp#} to {#alp#} is completed successfully. Your total amount for the trip is {#num#} See you Soon! Team Grab Rentals India
     */
    public CompletableFuture<Boolean> sendBookingCompletionSms(Booking booking, BigDecimal totalAmount) {
        if (!isConfigured()) {
            log.info("[SMS] SMS service is disabled or credentials not configured. Skipping Booking Completion SMS.");
            return CompletableFuture.completedFuture(false);
        }

        String phone = getRecipientPhone(booking);
        String recipient = formatRecipient(phone);
        if (recipient.isBlank()) {
            log.warn("[SMS] Cannot send Completion SMS: recipient phone is empty for booking {}", booking != null ? booking.getBookingReference() : "null");
            return CompletableFuture.completedFuture(false);
        }

        String customerName = sanitizeAlphanumeric(getCustomerName(booking), "Customer");
        String bookingRef = sanitizeAlphanumeric(booking != null && booking.getBookingReference() != null ? booking.getBookingReference() : "GR", "GR");
        String serviceType = sanitizeAlphanumeric(getServiceType(booking), "Outstation");
        String destination = sanitizeAlphanumeric(getDestinationCity(booking), "Destination");
        long totalAmt = Math.round(totalAmount != null ? totalAmount.doubleValue() : 0.0);

        String message = String.format(
                "Dear %s Your booking %s for the %s to %s is completed successfully. Your total amount for the trip is %d See you Soon! Team Grab Rentals India",
                customerName, bookingRef, serviceType, destination, totalAmt
        );

        return dispatchSms(recipient, message, templateCompletionId, campaignCompletion, "Booking Completion", bookingRef);
    }

    /**
     * Dispatch Booking Confirmation SMS via WeFormSolution DLT SMS API
     * DLT Pattern: Dear {#alp#} Your booking {#alp#} for the {#alp#} to {#alp#} is confirmed. Cab details and driver details will be shared shortly. Regards, Team Grab Rentals India
     */
    public CompletableFuture<Boolean> sendBookingConfirmationSms(Booking booking) {
        if (!isConfigured()) {
            log.info("[SMS] SMS service is disabled or credentials not configured. Skipping Booking Confirmation SMS.");
            return CompletableFuture.completedFuture(false);
        }

        String phone = getRecipientPhone(booking);
        String recipient = formatRecipient(phone);
        if (recipient.isBlank()) {
            log.warn("[SMS] Cannot send Confirmation SMS: recipient phone is empty for booking {}", booking != null ? booking.getBookingReference() : "null");
            return CompletableFuture.completedFuture(false);
        }

        String customerName = sanitizeAlphanumeric(getCustomerName(booking), "Customer");
        String bookingRef = sanitizeAlphanumeric(booking != null && booking.getBookingReference() != null ? booking.getBookingReference() : "GR", "GR");
        String serviceType = sanitizeAlphanumeric(getServiceType(booking), "Outstation");
        String destination = sanitizeAlphanumeric(getDestinationCity(booking), "Destination");

        String message = String.format(
                "Dear %s Your booking %s for the %s to %s is confirmed. Cab details and driver details will be shared shortly. Regards, Team Grab Rentals India",
                customerName, bookingRef, serviceType, destination
        );

        return dispatchSms(recipient, message, templateConfirmationId, campaignConfirmation, "Booking Confirmation", bookingRef);
    }

    private CompletableFuture<Boolean> dispatchSms(String recipient, String message, String templateId, String campaignName, String context, String ref) {
        try {
            String query = String.format(
                    "api_key=%s&sender_id=%s&template_id=%s&dcs=0&priority=0&number=%s&message=%s&campaign_name=%s",
                    encodeParam(apiKey),
                    encodeParam(senderId),
                    encodeParam(templateId),
                    encodeParam(recipient),
                    encodeParam(message),
                    encodeParam(campaignName)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl + "?" + query))
                    .GET()
                    .timeout(Duration.ofSeconds(10))
                    .build();

            log.info("[SMS] Submitting {} for booking '{}' to {} via template '{}'", context, ref, recipient, templateId);

            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenApply(res -> {
                        if (res.statusCode() >= 200 && res.statusCode() < 300) {
                            log.info("✅ [SMS] {} successfully submitted for booking '{}' to {} (Status: {}, Body: {})",
                                    context, ref, recipient, res.statusCode(), res.body());
                            return true;
                        } else {
                            log.warn("⚠️ [SMS] {} API returned non-2xx for booking '{}' to {} (Status: {}, Body: {})",
                                    context, ref, recipient, res.statusCode(), res.body());
                            return false;
                        }
                    })
                    .exceptionally(ex -> {
                        log.error("❌ [SMS] Failed to send {} for booking '{}' to {}: {}", context, ref, recipient, ex.getMessage());
                        return false;
                    });
        } catch (Exception e) {
            log.error("❌ [SMS] Error building {} request for booking '{}': {}", context, ref, e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }

    public boolean isConfigured() {
        return enabled && apiKey != null && !apiKey.isBlank() && apiUrl != null && !apiUrl.isBlank()
                && senderId != null && !senderId.isBlank();
    }

    public String formatRecipient(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            return "91" + digits;
        }
        if (digits.length() == 11 && digits.startsWith("0")) {
            return "91" + digits.substring(1);
        }
        if (digits.length() == 12 && digits.startsWith("91")) {
            return digits;
        }
        return digits;
    }

    private String encodeParam(String value) {
        if (value == null) return "";
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String getRecipientPhone(Booking booking) {
        if (booking == null) return "";
        if (booking.getPassengerPhone() != null && !booking.getPassengerPhone().isBlank()) {
            return booking.getPassengerPhone();
        }
        if (booking.getCustomer() != null && booking.getCustomer().getPhone() != null && !booking.getCustomer().getPhone().isBlank()) {
            return booking.getCustomer().getPhone();
        }
        return "";
    }

    private String getCustomerName(Booking booking) {
        if (booking == null) return "Guest";
        if (booking.getPassengerName() != null && !booking.getPassengerName().isBlank()) {
            return booking.getPassengerName();
        }
        if (booking.getCustomer() != null && booking.getCustomer().getName() != null && !booking.getCustomer().getName().isBlank()) {
            return booking.getCustomer().getName();
        }
        return "Guest";
    }

    private String getVehicleNumber(Booking booking) {
        if (booking == null) return "Cab";
        if (booking.getAssignedVehicle() != null && booking.getAssignedVehicle().getVehicleNumber() != null && !booking.getAssignedVehicle().getVehicleNumber().isBlank()) {
            return booking.getAssignedVehicle().getVehicleNumber();
        }
        if (booking.getManualVehicleNumber() != null && !booking.getManualVehicleNumber().isBlank()) {
            return booking.getManualVehicleNumber();
        }
        return "Cab";
    }

    private String getServiceType(Booking booking) {
        if (booking == null || booking.getTripType() == null || booking.getTripType().isBlank()) {
            return "outstation";
        }
        return booking.getTripType().toLowerCase();
    }

    private String getDestinationCity(Booking booking) {
        if (booking == null) return "Destination";
        if (booking.getDropCity() != null && !booking.getDropCity().isBlank()) {
            return booking.getDropCity();
        }
        String to = booking.getDropAddress();
        if (to == null || to.isBlank()) return "Destination";
        String[] parts = to.split(",");
        return parts[0].trim();
    }

    private String sanitizeAlphanumeric(String input, String fallback) {
        if (input == null || input.isBlank()) return fallback;
        // Keep letters, digits, and basic spaces
        String clean = input.replaceAll("[^a-zA-Z0-9 ]", "").trim();
        return clean.isBlank() ? fallback : clean;
    }
}
