package com.grabrentals.customer.dto;

import com.grabrentals.customer.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateRequest {

    private BookingStatus status;

    private String milestoneText;

    private Double startKm;

    private String startOdometerProofUrl;
}
