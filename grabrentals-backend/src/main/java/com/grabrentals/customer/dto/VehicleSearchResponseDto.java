package com.grabrentals.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleSearchResponseDto {
    private String from;
    private String to;
    private List<String> stops;
    private String tripType;
    private Integer distanceKm;
    private String pickupDate;
    private String pickupTime;
    private List<PublicVehicleCardDto> vehicles;
}
