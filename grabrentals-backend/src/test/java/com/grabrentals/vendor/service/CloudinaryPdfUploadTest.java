package com.grabrentals.vendor.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class CloudinaryPdfUploadTest {

    @Test
    @DisplayName("Verify CloudinaryService.uploadPdfBytes guarantees .pdf URL and application/pdf Content-Type")
    void testUploadPdfBytesGuaranteesPdfExtensionAndMimeType() throws Exception {
        CloudinaryService service = new CloudinaryService();
        ReflectionTestUtils.setField(service, "cloudName", "pkou5g9a");
        ReflectionTestUtils.setField(service, "apiKey", "734184659296959");
        ReflectionTestUtils.setField(service, "apiSecret", "6c9w5f9FcmOFiRrBURo47oO08Sg");

        byte[] samplePdf = "%PDF-1.5\n%GrabRentals Test Invoice\n%%EOF".getBytes(StandardCharsets.UTF_8);

        // Caller passes name WITHOUT .pdf and with special characters
        String inputFileName = "inv_GR-2026-TEST_" + System.currentTimeMillis();
        String uploadedUrl = service.uploadPdfBytes(samplePdf, inputFileName, "grabrentals/invoices");

        System.out.println("✅ [UPLOAD TEST RESULT] Uploaded URL: " + uploadedUrl);

        assertNotNull(uploadedUrl, "Uploaded URL should not be null");
        assertTrue(uploadedUrl.toLowerCase().endsWith(".pdf"), "URL must strictly end with .pdf for mobile WhatsApp: " + uploadedUrl);

        // Verify HTTP Content-Type from Cloudinary CDN
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        HttpResponse<Void> response = client.send(
                HttpRequest.newBuilder().uri(URI.create(uploadedUrl)).method("HEAD", HttpRequest.BodyPublishers.noBody()).build(),
                HttpResponse.BodyHandlers.discarding()
        );

        String contentType = response.headers().firstValue("content-type").orElse("");
        System.out.println("✅ [UPLOAD TEST RESULT] HTTP Status: " + response.statusCode());
        System.out.println("✅ [UPLOAD TEST RESULT] Content-Type: " + contentType);

        assertEquals(200, response.statusCode());
        assertTrue(contentType.toLowerCase().contains("application/pdf"),
                "Content-Type must be application/pdf so mobile WhatsApp does not treat it as BIN: " + contentType);
    }
}
