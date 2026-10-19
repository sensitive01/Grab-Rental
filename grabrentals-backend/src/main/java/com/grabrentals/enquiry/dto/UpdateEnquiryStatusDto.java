package com.grabrentals.enquiry.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEnquiryStatusDto {

    @NotBlank(message = "Status is required")
    private String status;

    private String adminNotes;
}
