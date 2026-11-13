package com.grabrentals.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAddonItem {
    private String id;
    private String name;
    private String description;
    private String sacCode;
    private String packageQty;
    private BigDecimal price;
    private String emoji;
}

