package com.grabrentals.payment.dto;

import com.grabrentals.payment.entity.UpiConfig;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpiConfigDto {

    private Long id;

    @NotBlank(message = "UPI ID (VPA) is required (e.g. grabrentals@bank)")
    private String upiId;

    @NotBlank(message = "Payee/Business Name is required")
    private String payeeName;

    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String qrNote;
    private String instructions;
    private Boolean active;
    private LocalDateTime updatedAt;

    public static UpiConfigDto fromEntity(UpiConfig entity) {
        if (entity == null) return null;
        return UpiConfigDto.builder()
                .id(entity.getId())
                .upiId(entity.getUpiId())
                .payeeName(entity.getPayeeName())
                .bankName(entity.getBankName())
                .accountNumber(entity.getAccountNumber())
                .ifscCode(entity.getIfscCode())
                .qrNote(entity.getQrNote())
                .instructions(entity.getInstructions())
                .active(entity.getActive())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
