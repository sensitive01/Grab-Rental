package com.grabrentals.enquiry.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.enquiry.dto.EnquiryRequestDto;
import com.grabrentals.enquiry.dto.EnquiryResponseDto;
import com.grabrentals.enquiry.service.EnquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enquiries")
@RequiredArgsConstructor
public class PublicEnquiryController {

    private final EnquiryService enquiryService;

    @PostMapping
    public ResponseEntity<ApiResponse<EnquiryResponseDto>> submitEnquiry(@Valid @RequestBody EnquiryRequestDto request) {
        EnquiryResponseDto created = enquiryService.createEnquiry(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you! Your enquiry has been received. Our team will contact you shortly.", created));
    }
}
