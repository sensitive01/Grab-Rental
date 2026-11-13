package com.grabrentals.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grabrentals.customer.entity.Booking;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
public class WhatsAppNotificationService {

    @Value("${app.whatsapp.enabled:false}")
    private boolean enabled;

    @Value("${app.whatsapp.api-url:}")
    private String apiUrl;

    @Value("${app.whatsapp.api-key:}")
    private String apiKey;

    @Value("${app.whatsapp.support-phone:9876543210}")
    private String supportPhone;

    @Value("${app.whatsapp.booking-confirmation-pdf-url:https://whatsappdata.s3.ap-south-1.amazonaws.com/userMedia/95c67d929b9fee3507244cbb024c0e73/invoice.pdf}")
    private String bookingConfirmationPdfUrl;

    @Value("${app.whatsapp.default-invoice-pdf-url:https://whatsappdata.s3.ap-south-1.amazonaws.com/userMedia/95c67d929b9fee3507244cbb024c0e73/invoice.pdf}")
    private String defaultInvoicePdfUrl;

    @Value("${app.document-base-url:https://api.grabrentals.in}")
    private String documentBaseUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public WhatsAppNotificationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    /**
     * Formats Indian recipient phone number into E.164 91XXXXXXXXXX format.
     */
    public String formatRecipientPhone(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            return "91" + digits;
        } else if (digits.length() == 12 && digits.startsWith("91")) {
            return digits;
        } else if (digits.length() > 10) {
            return "91" + digits.substring(digits.length() - 10);
        }
        return digits;
    }

    public String resolveRecipientPhone(Booking booking, String overridePhone) {
        if (overridePhone != null && !overridePhone.isBlank()) {
            return formatRecipientPhone(overridePhone);
        }
        if (booking != null) {
            if (booking.getPassengerPhone() != null && !booking.getPassengerPhone().isBlank()) {
                return formatRecipientPhone(booking.getPassengerPhone());
            }
            if (booking.getCustomer() != null && booking.getCustomer().getPhone() != null && !booking.getCustomer().getPhone().isBlank()) {
                return formatRecipientPhone(booking.getCustomer().getPhone());
            }
        }
        return "";
    }

    public String resolveCustomerName(Booking booking) {
        if (booking != null) {
            if (booking.getPassengerName() != null && !booking.getPassengerName().isBlank()) {
                return booking.getPassengerName();
            }
            if (booking.getCustomer() != null && booking.getCustomer().getName() != null && !booking.getCustomer().getName().isBlank()) {
                return booking.getCustomer().getName();
            }
        }
        return "Valued Customer";
    }

    public String resolveDocumentUrl(Booking booking, int scenario, String fallback) {
        if (booking != null && booking.getInvoicePdfUrl() != null && !booking.getInvoicePdfUrl().isBlank()) {
            String url = booking.getInvoicePdfUrl();
            // WhatsApp Mobile strictly requires URL to end with .pdf for native PDF document rendering
            if (url.toLowerCase().endsWith(".pdf") || url.toLowerCase().contains(".pdf?")) {
                return url;
            }
        }
        if (booking != null && booking.getBookingReference() != null && !booking.getBookingReference().isBlank()) {
            String base = (documentBaseUrl != null && !documentBaseUrl.isBlank()) ? documentBaseUrl : "https://api.grabrentals.in";
            return base.replaceAll("/+$", "") + "/api/public/bookings/" + booking.getBookingReference() + "/document.pdf?scenario=" + scenario;
        }
        return fallback;
    }

    /**
     * STAGE 1 BILL: Dispatched when customer books the trip / advance payment confirmed.
     * Meta Template: "booking_details"
     * Header Document: Booking_Confirmation.pdf
     * Param 1: Passenger Name (e.g., "Rahul")
     * Param 2: Booking Reference ID (e.g., "GRB1025")
     * Param 3: Pickup Location / City (e.g., "Bengaluru Airport")
     * Param 4: Drop Location / City (e.g., "Mysore")
     */
    public CompletableFuture<Boolean> sendBookingConfirmationBill(Booking booking, String recipientPhone) {
        if (booking == null) return CompletableFuture.completedFuture(false);

        String recipient = resolveRecipientPhone(booking, recipientPhone);
        if (recipient.isBlank()) {
            log.warn("⚠️ Cannot send WhatsApp booking confirmation: empty or invalid recipient phone for booking {}",
                    booking.getBookingReference());
            return CompletableFuture.completedFuture(false);
        }

        String customerName = resolveCustomerName(booking);
        String bookingRef = (booking.getBookingReference() != null && !booking.getBookingReference().isBlank())
                ? booking.getBookingReference()
                : "GRB1000";
        String pickup = (booking.getPickupCity() != null && !booking.getPickupCity().isBlank())
                ? booking.getPickupCity()
                : (booking.getPickupAddress() != null && !booking.getPickupAddress().isBlank() ? booking.getPickupAddress() : "Pickup Location");
        String drop = (booking.getDropCity() != null && !booking.getDropCity().isBlank())
                ? booking.getDropCity()
                : (booking.getDropAddress() != null && !booking.getDropAddress().isBlank() ? booking.getDropAddress() : (pickup + " (Local Package)"));

        String docUrl = resolveDocumentUrl(booking, 1, bookingConfirmationPdfUrl);

        List<Map<String, Object>> bodyParams = List.of(
                Map.of("type", "text", "text", customerName),
                Map.of("type", "text", "text", bookingRef),
                Map.of("type", "text", "text", pickup),
                Map.of("type", "text", "text", drop)
        );

        return dispatchTemplate(
                "booking_details",
                docUrl,
                "Booking_Confirmation.pdf",
                bodyParams,
                recipient,
                booking.getBookingReference(),
                "STAGE 1: BOOKING DETAILS BILL"
        );
    }

    /**
     * STAGE 2 BILL: Dispatched when trip finishes and is closed by chauffeur/vendor.
     * Meta Template: "invoice"
     * Header Document: GrabRentals_Invoice.pdf
     * Param 1: Passenger Name (e.g., "Ramesh Kumar")
     * Param 2: Route (e.g., "Mysore to Bangalore")
     * Param 3: Total Final Amount (e.g., "4500")
     */
    public CompletableFuture<Boolean> sendTripCompletionInvoice(Booking booking, String recipientPhone) {
        if (booking == null) return CompletableFuture.completedFuture(false);

        String recipient = resolveRecipientPhone(booking, recipientPhone);
        if (recipient.isBlank()) {
            log.warn("⚠️ Cannot send WhatsApp invoice: empty or invalid recipient phone for booking {}",
                    booking.getBookingReference());
            return CompletableFuture.completedFuture(false);
        }

        String customerName = resolveCustomerName(booking);
        String pickup = (booking.getPickupCity() != null && !booking.getPickupCity().isBlank()) ? booking.getPickupCity() : "Pickup";
        String drop = (booking.getDropCity() != null && !booking.getDropCity().isBlank()) ? booking.getDropCity() : "Drop";
        String route = pickup.equalsIgnoreCase(drop) ? (pickup + " (Local Rental)") : (pickup + " to " + drop);

        BigDecimal finalTotal = booking.getFinalTotalFare() != null ? booking.getFinalTotalFare() : (booking.getTotalFare() != null ? booking.getTotalFare() : BigDecimal.ZERO);
        String amountStr = String.valueOf(finalTotal.setScale(0, RoundingMode.HALF_UP).intValue());

        String docUrl = resolveDocumentUrl(booking, 3, defaultInvoicePdfUrl);

        List<Map<String, Object>> bodyParams = List.of(
                Map.of("type", "text", "text", customerName),
                Map.of("type", "text", "text", route),
                Map.of("type", "text", "text", amountStr)
        );

        return dispatchTemplate(
                "invoice",
                docUrl,
                "GrabRentals_Invoice.pdf",
                bodyParams,
                recipient,
                booking.getBookingReference(),
                "STAGE 2: FINAL TAX INVOICE"
        );
    }

    /**
     * SCENARIO 1: Initial Booking Estimate / Provisional Quotation
     * Dispatched when customer creates booking.
     * Meta Template: "booking_details"
     * Header Document: GrabRentals_Booking_Estimate.pdf
     */
    public CompletableFuture<Boolean> sendScenario1BookingEstimate(Booking booking, String recipientPhone) {
        if (booking == null) return CompletableFuture.completedFuture(false);

        String recipient = resolveRecipientPhone(booking, recipientPhone);
        if (recipient.isBlank()) {
            log.warn("⚠️ Cannot send Scenario 1 WhatsApp estimate: empty recipient phone for booking {}",
                    booking.getBookingReference());
            return CompletableFuture.completedFuture(false);
        }

        String customerName = resolveCustomerName(booking);
        String bookingRef = (booking.getBookingReference() != null && !booking.getBookingReference().isBlank())
                ? booking.getBookingReference()
                : "GRB1000";
        String pickup = (booking.getPickupCity() != null && !booking.getPickupCity().isBlank())
                ? booking.getPickupCity()
                : (booking.getPickupAddress() != null && !booking.getPickupAddress().isBlank() ? booking.getPickupAddress() : "Pickup Location");
        String drop = (booking.getDropCity() != null && !booking.getDropCity().isBlank())
                ? booking.getDropCity()
                : (booking.getDropAddress() != null && !booking.getDropAddress().isBlank() ? booking.getDropAddress() : (pickup + " (Local Rental)"));

        String docUrl = resolveDocumentUrl(booking, 1, bookingConfirmationPdfUrl);

        List<Map<String, Object>> bodyParams = List.of(
                Map.of("type", "text", "text", customerName),
                Map.of("type", "text", "text", bookingRef),
                Map.of("type", "text", "text", pickup),
                Map.of("type", "text", "text", drop)
        );

        return dispatchTemplate(
                "booking_details",
                docUrl,
                "GrabRentals_Booking_Estimate.pdf",
                bodyParams,
                recipient,
                booking.getBookingReference(),
                "SCENARIO 1: BOOKING ESTIMATE"
        );
    }

    /**
     * SCENARIO 2: Confirmed Booking Voucher & Duty Slip (NO OTP)
     * Dispatched when booking is confirmed / vendor accepts.
     * Meta Template: "booking_details"
     * Header Document: GrabRentals_Confirmed_Voucher.pdf
     * IMPORTANT: OTP is strictly excluded from all invoice documents & templates.
     */
    public CompletableFuture<Boolean> sendScenario2ConfirmedVoucher(Booking booking, String recipientPhone) {
        if (booking == null) return CompletableFuture.completedFuture(false);

        String recipient = resolveRecipientPhone(booking, recipientPhone);
        if (recipient.isBlank()) {
            log.warn("⚠️ Cannot send Scenario 2 WhatsApp confirmed voucher: empty recipient phone for booking {}",
                    booking.getBookingReference());
            return CompletableFuture.completedFuture(false);
        }

        String customerName = resolveCustomerName(booking);
        String bookingRef = (booking.getBookingReference() != null && !booking.getBookingReference().isBlank())
                ? booking.getBookingReference()
                : "GRB1000";
        String pickup = (booking.getPickupCity() != null && !booking.getPickupCity().isBlank())
                ? booking.getPickupCity()
                : (booking.getPickupAddress() != null && !booking.getPickupAddress().isBlank() ? booking.getPickupAddress() : "Pickup Location");
        String drop = (booking.getDropCity() != null && !booking.getDropCity().isBlank())
                ? booking.getDropCity()
                : (booking.getDropAddress() != null && !booking.getDropAddress().isBlank() ? booking.getDropAddress() : (pickup + " (Local Rental)"));

        String docUrl = resolveDocumentUrl(booking, 2, bookingConfirmationPdfUrl);

        List<Map<String, Object>> bodyParams = List.of(
                Map.of("type", "text", "text", customerName),
                Map.of("type", "text", "text", bookingRef),
                Map.of("type", "text", "text", pickup),
                Map.of("type", "text", "text", drop)
        );

        return dispatchTemplate(
                "booking_details",
                docUrl,
                "GrabRentals_Confirmed_Voucher.pdf",
                bodyParams,
                recipient,
                booking.getBookingReference(),
                "SCENARIO 2: CONFIRMED DUTY VOUCHER"
        );
    }

    /**
     * SCENARIO 3: Final Tax Invoice (SAC: 9966)
     * Dispatched when driver ends trip / closes duties.
     * Meta Template: "invoice"
     * Header Document: GrabRentals_Final_Invoice.pdf
     */
    public CompletableFuture<Boolean> sendScenario3FinalInvoice(Booking booking, String recipientPhone) {
        return sendTripCompletionInvoice(booking, recipientPhone);
    }

    /**
     * Router method for scenarios (1 = Estimate, 2 = Confirmed Voucher, 3 = Final Tax Invoice)
     */
    public CompletableFuture<Boolean> sendScenarioInvoice(Booking booking, int scenario, String recipientPhone) {
        return switch (scenario) {
            case 1 -> sendScenario1BookingEstimate(booking, recipientPhone);
            case 2 -> sendScenario2ConfirmedVoucher(booking, recipientPhone);
            case 3 -> sendScenario3FinalInvoice(booking, recipientPhone);
            default -> sendScenario1BookingEstimate(booking, recipientPhone);
        };
    }

    /**
     * Backward-compatible alias for sendTripCompletionInvoice.
     */
    public CompletableFuture<Boolean> sendInvoice(Booking booking, String recipientPhone) {
        return sendTripCompletionInvoice(booking, recipientPhone);
    }

    private CompletableFuture<Boolean> dispatchTemplate(
            String templateName,
            String documentLink,
            String documentFilename,
            List<Map<String, Object>> bodyParameters,
            String recipient,
            String bookingRef,
            String stageLabel
    ) {
        if (!enabled || apiKey == null || apiKey.isBlank() || apiUrl == null || apiUrl.isBlank()) {
            log.info("⚠️ WhatsApp dispatch skipped ({}): WhatsApp is disabled or credentials not configured.", stageLabel);
            return CompletableFuture.completedFuture(false);
        }

        try {
            Map<String, Object> headerDocument = Map.of(
                    "link", documentLink,
                    "filename", documentFilename
            );

            Map<String, Object> headerComponent = Map.of(
                    "type", "header",
                    "parameters", List.of(
                            Map.of("type", "document", "document", headerDocument)
                    )
            );

            Map<String, Object> bodyComponent = Map.of(
                    "type", "body",
                    "parameters", bodyParameters
            );

            Map<String, Object> template = Map.of(
                    "name", templateName,
                    "language", Map.of("code", "en"),
                    "components", List.of(headerComponent, bodyComponent)
            );

            Map<String, Object> payload = Map.of(
                    "messaging_product", "whatsapp",
                    "recipient_type", "individual",
                    "to", recipient,
                    "type", "template",
                    "template", template
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("apikey", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            log.info("🚀 [WHATSAPP DISPATCH: {}] Dispatched template '{}' ({}) for booking {} to {}",
                    stageLabel, templateName, documentFilename, bookingRef, recipient);

            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenApply(res -> {
                        if (res.statusCode() >= 200 && res.statusCode() < 300) {
                            log.info("✅ [WHATSAPP SUCCESS: {}] Template '{}' for booking {} successfully sent to {} (Status: {}, Body: {})",
                                    stageLabel, templateName, bookingRef, recipient, res.statusCode(), res.body());
                            return true;
                        } else {
                            log.warn("⚠️ [WHATSAPP REJECTED: {}] Template '{}' non-2xx for booking {} to {}: Status={}, Response={}",
                                    stageLabel, templateName, bookingRef, recipient, res.statusCode(), res.body());
                            return false;
                        }
                    })
                    .exceptionally(ex -> {
                        log.error("❌ [WHATSAPP EXCEPTION: {}] Failed to send template '{}' for booking {} to {}: {}",
                                stageLabel, templateName, bookingRef, recipient, ex.getMessage());
                        return false;
                    });
        } catch (Exception e) {
            log.error("❌ [WHATSAPP BUILD ERROR: {}] Could not construct payload for template '{}' (Booking {}): {}",
                    stageLabel, templateName, bookingRef, e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }
}
