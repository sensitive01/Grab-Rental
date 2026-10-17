package com.grabrentals.promo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoPopupResponseDto {
    private Long id;
    private String imageUrl;
    private Boolean active;
    private LocalDateTime updatedAt;
}
