package com.grabrentals.customer.dto;

import com.grabrentals.customer.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String milestoneText;
}
