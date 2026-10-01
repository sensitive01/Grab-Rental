package com.grabrentals.customer.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAssignRequest {

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    private UUID vendorId;
}
