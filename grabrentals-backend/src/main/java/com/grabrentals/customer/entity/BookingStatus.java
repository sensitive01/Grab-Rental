package com.grabrentals.customer.entity;

public enum BookingStatus {
    PENDING_ALLOCATION,
    ASSIGNED_TO_VENDOR,
    CONFIRMED,
    REASSIGN_REQUIRED,
    ON_THE_WAY,
    IN_TRANSIT,
    COMPLETED,
    CANCELLED
}
