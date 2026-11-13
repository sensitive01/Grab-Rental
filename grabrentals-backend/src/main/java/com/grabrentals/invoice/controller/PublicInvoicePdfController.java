package com.grabrentals.invoice.controller;

import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.customer.repository.BookingRepository;
import com.grabrentals.invoice.service.InvoicePdfGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/public/bookings")
@RequiredArgsConstructor
public class PublicInvoicePdfController {

    private final BookingRepository bookingRepository;
    private final InvoicePdfGeneratorService pdfGeneratorService;

    @GetMapping(value = {"/{idOrRef}/document.pdf", "/{idOrRef}/invoice.pdf"}, produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getDocumentPdf(
            @PathVariable String idOrRef,
            @RequestParam(required = false) Integer scenario
    ) {
        Booking booking = findBooking(idOrRef);

        int resolvedScenario;
        if (scenario != null && scenario >= 1 && scenario <= 3) {
            resolvedScenario = scenario;
        } else if (booking.getStatus() == BookingStatus.COMPLETED) {
            resolvedScenario = 3;
        } else if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getAssignedVehicle() != null) {
            resolvedScenario = 2;
        } else {
            resolvedScenario = 1;
        }

        byte[] pdfBytes = pdfGeneratorService.generatePdf(booking, resolvedScenario);

        String bRef = booking.getBookingReference() != null ? booking.getBookingReference() : "booking";
        String typeLabel = switch (resolvedScenario) {
            case 1 -> "Estimate";
            case 2 -> "Voucher";
            case 3 -> "Invoice";
            default -> "Document";
        };
        String filename = "GrabRentals_" + typeLabel + "_" + bRef + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(pdfBytes);
    }

    private Booking findBooking(String idOrRef) {
        Booking booking = null;
        try {
            UUID id = UUID.fromString(idOrRef);
            booking = bookingRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(idOrRef).orElse(null);
        }

        if (booking == null) {
            throw new ResourceNotFoundException("Booking not found: " + idOrRef);
        }
        return booking;
    }
}

