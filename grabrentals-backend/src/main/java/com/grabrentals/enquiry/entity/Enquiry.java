package com.grabrentals.enquiry.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_enquiries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String requirements;

    @Column(name = "source_page", length = 120)
    private String sourcePage;

    /**
     * NEW, CONTACTED, CONVERTED, CLOSED
     */
    @Column(length = 32, nullable = false)
    @Builder.Default
    private String status = "NEW";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
