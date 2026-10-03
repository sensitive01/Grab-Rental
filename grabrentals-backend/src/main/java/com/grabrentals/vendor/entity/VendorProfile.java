package com.grabrentals.vendor.entity;

import com.grabrentals.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "fleet_profiles",
    indexes = {
        @Index(name = "idx_fleet_profiles_user_id", columnList = "user_id")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VendorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "trade_name")
    private String tradeName;

    @Column(name = "address")
    private String address;

    @Column(name = "gstin")
    private String gstin;

    @Column(name = "pan")
    private String pan;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "ifsc")
    private String ifsc;

    @Column(name = "branch")
    private String branch;

    @Column(name = "fleet_size")
    private Integer fleetSize;

    @Column(name = "gst_document_url")
    private String gstDocumentUrl;

    @Column(name = "pan_document_url")
    private String panDocumentUrl;

    @Column(name = "bank_proof_document_url")
    private String bankProofDocumentUrl;

    @Column(name = "business_proof_document_url")
    private String businessProofDocumentUrl;

    @Column(name = "id_proof_document_url")
    private String idProofDocumentUrl;

    @Column(name = "address_proof_document_url")
    private String addressProofDocumentUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
