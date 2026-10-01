package com.grabrentals.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {

    @NotBlank(message = "Trip type is required")
    private String tripType;

    @NotBlank(message = "Pickup city is required")
    private String pickupCity;

    private String dropCity;

    private String stops;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    private String dropAddress;

    @NotNull(message = "Pickup date and time is required")
    private LocalDateTime pickupDateTime;

    private LocalDateTime returnDateTime;

    @NotBlank(message = "Vehicle category is required")
    private String vehicleCategory;

    private Integer passengerCount;

    private String passengerName;

    private String passengerPhone;

    @NotNull(message = "Total fare is required")
    @Positive(message = "Total fare must be greater than zero")
    private BigDecimal totalFare;

    private BigDecimal advancePaid;

    private String paymentStatus;

    private String specialInstructions;
}
