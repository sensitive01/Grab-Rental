package com.grabrentals.enquiry.service;

import com.grabrentals.enquiry.dto.EnquiryRequestDto;
import com.grabrentals.enquiry.dto.EnquiryResponseDto;
import com.grabrentals.enquiry.dto.UpdateEnquiryStatusDto;
import com.grabrentals.enquiry.entity.Enquiry;
import com.grabrentals.enquiry.repository.EnquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;

    @Transactional
    public EnquiryResponseDto createEnquiry(EnquiryRequestDto dto) {
        log.info("Received customer enquiry from {} ({})", dto.getName(), dto.getPhone());

        Enquiry enquiry = Enquiry.builder()
                .name(dto.getName().trim())
                .phone(dto.getPhone().trim())
                .requirements(dto.getRequirements().trim())
                .sourcePage(dto.getSourcePage() != null ? dto.getSourcePage().trim() : "/")
                .status("NEW")
                .build();

        Enquiry saved = enquiryRepository.save(enquiry);
        log.info("Enquiry #{} created successfully for {}", saved.getId(), saved.getName());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<EnquiryResponseDto> getAllEnquiries(String status) {
        List<Enquiry> list;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            list = enquiryRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        } else {
            list = enquiryRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EnquiryResponseDto getEnquiryById(Long id) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enquiry not found with ID: " + id));
        return mapToDto(enquiry);
    }

    @Transactional
    public EnquiryResponseDto updateEnquiryStatus(Long id, UpdateEnquiryStatusDto dto) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enquiry not found with ID: " + id));

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            enquiry.setStatus(dto.getStatus().toUpperCase().trim());
        }
        if (dto.getAdminNotes() != null) {
            enquiry.setAdminNotes(dto.getAdminNotes());
        }

        Enquiry saved = enquiryRepository.save(enquiry);
        log.info("Enquiry #{} status updated to {}", saved.getId(), saved.getStatus());
        return mapToDto(saved);
    }

    @Transactional
    public void deleteEnquiry(Long id) {
        if (!enquiryRepository.existsById(id)) {
            throw new IllegalArgumentException("Enquiry not found with ID: " + id);
        }
        enquiryRepository.deleteById(id);
        log.info("Enquiry #{} deleted", id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEnquiryStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", enquiryRepository.count());
        stats.put("new", enquiryRepository.countByStatus("NEW"));
        stats.put("contacted", enquiryRepository.countByStatus("CONTACTED"));
        stats.put("converted", enquiryRepository.countByStatus("CONVERTED"));
        stats.put("closed", enquiryRepository.countByStatus("CLOSED"));
        return stats;
    }

    private EnquiryResponseDto mapToDto(Enquiry e) {
        return EnquiryResponseDto.builder()
                .id(e.getId())
                .name(e.getName())
                .phone(e.getPhone())
                .requirements(e.getRequirements())
                .sourcePage(e.getSourcePage())
                .status(e.getStatus())
                .adminNotes(e.getAdminNotes())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
