package com.grabrentals.vendor.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DriverStatus {
    AVAILABLE,
    ASSIGNED,
    ON_TRIP,
    BOOKED,
    OFF_DUTY,
    INACTIVE;

    @JsonCreator
    public static DriverStatus fromString(String val) {
        if (val == null || val.isBlank()) {
            return AVAILABLE;
        }
        String clean = val.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        try {
            return DriverStatus.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return AVAILABLE;
        }
    }
}
