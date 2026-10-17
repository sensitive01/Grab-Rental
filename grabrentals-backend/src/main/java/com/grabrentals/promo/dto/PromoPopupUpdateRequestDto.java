package com.grabrentals.promo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoPopupUpdateRequestDto {
    private String imageUrl;
    private Boolean active;
}
