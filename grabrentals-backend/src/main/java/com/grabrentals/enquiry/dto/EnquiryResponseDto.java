package com.grabrentals.enquiry.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnquiryResponseDto {
    private Long id;
    private String name;
    private String phone;
    private String requirements;
    private String sourcePage;
    private String status;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
