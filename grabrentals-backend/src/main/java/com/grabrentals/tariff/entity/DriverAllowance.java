package com.grabrentals.tariff.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "driver_allowances",
    indexes = {
        @Index(name = "idx_da_model_city_shift", columnList = "model_name, city, state, shift_type, is_active")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DriverAllowance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // Car model name, e.g. "Maruti WagonR", "Swift Dzire", "Toyota Innova", or "ALL"
    @Column(name = "model_name", nullable = false, length = 150)
    @Builder.Default
    private String modelName = "ALL";

    // State name, e.g. "Tamil Nadu", "Karnataka", or "ALL"
    @Column(name = "state", nullable = false, length = 100)
    @Builder.Default
    private String state = "ALL";

    // City name, e.g. "Madurai", "Bangalore", "Coimbatore", or "ALL"
    @Column(name = "city", nullable = false, length = 100)
    @Builder.Default
    private String city = "ALL";

    // Shift type: "DAY", "NIGHT", or "ALL"
    @Column(name = "shift_type", nullable = false, length = 50)
    @Builder.Default
    private String shiftType = "ALL";

    // Allowance type: "FLAT" (₹ fixed amount) or "PERCENTAGE" (% rate of base fare)
    @Column(name = "allowance_type", nullable = false, length = 50)
    @Builder.Default
    private String allowanceType = "FLAT";

    // Allowance value: e.g. 500.00 for ₹500, or 10.00 for 10%
    @Column(name = "allowance_value", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal allowanceValue = BigDecimal.ZERO;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
