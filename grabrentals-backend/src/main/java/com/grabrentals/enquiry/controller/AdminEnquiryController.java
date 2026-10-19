package com.grabrentals.enquiry.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.enquiry.dto.EnquiryResponseDto;
import com.grabrentals.enquiry.dto.UpdateEnquiryStatusDto;
import com.grabrentals.enquiry.service.EnquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/enquiries")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'OPERATIONS')")
public class AdminEnquiryController {

    private final EnquiryService enquiryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnquiryResponseDto>>> getAllEnquiries(
            @RequestParam(required = false) String status) {
        List<EnquiryResponseDto> list = enquiryService.getAllEnquiries(status);
        return ResponseEntity.ok(ApiResponse.success("Enquiries fetched successfully", list));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEnquiryStats() {
        Map<String, Object> stats = enquiryService.getEnquiryStats();
        return ResponseEntity.ok(ApiResponse.success("Enquiry statistics retrieved", stats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EnquiryResponseDto>> getEnquiryById(@PathVariable Long id) {
        EnquiryResponseDto dto = enquiryService.getEnquiryById(id);
        return ResponseEntity.ok(ApiResponse.success("Enquiry retrieved", dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EnquiryResponseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEnquiryStatusDto request) {
        EnquiryResponseDto updated = enquiryService.updateEnquiryStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Enquiry status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEnquiry(@PathVariable Long id) {
        enquiryService.deleteEnquiry(id);
        return ResponseEntity.ok(ApiResponse.success("Enquiry deleted successfully"));
    }
}
