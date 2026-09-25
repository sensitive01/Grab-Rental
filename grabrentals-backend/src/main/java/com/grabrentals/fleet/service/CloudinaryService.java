package com.grabrentals.fleet.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.grabrentals.fleet.dto.CloudinarySignatureResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class CloudinaryService {

    @Value("${app.cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:demo}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:demo}")
    private String apiSecret;

    public CloudinarySignatureResponse generateUploadSignature(String customFolder) {
        long timestamp = Instant.now().getEpochSecond();
        String folder = (customFolder != null && !customFolder.isBlank()) ? customFolder : "grabrentals/vehicles";

        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("folder", folder);
        paramsToSign.put("timestamp", timestamp);

        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));

        String signature = cloudinary.apiSignRequest(paramsToSign, apiSecret);

        log.info("============================================================");
        log.info("[CLOUDINARY] Upload signature generated successfully");
        log.info("  Cloud Name: {}", cloudName);
        log.info("  Folder    : {}", folder);
        log.info("  Timestamp : {}", timestamp);
        log.info("  Signature : {}", signature);
        log.info("============================================================");

        return CloudinarySignatureResponse.builder()
                .signature(signature)
                .timestamp(timestamp)
                .apiKey(apiKey)
                .cloudName(cloudName)
                .folder(folder)
                .build();
    }

    public String uploadFile(MultipartFile file, String customFolder) {
        return uploadFile(file, customFolder, null);
    }

    public String uploadFile(MultipartFile file, String customFolder, String preset) {
        String folder = (customFolder != null && !customFolder.isBlank()) ? customFolder : "grabrentals/vehicles";
        try {
            log.info("============================================================");
            log.info("[CLOUDINARY UPLOAD] File upload initiated");
            log.info("  File Name   : {}", file.getOriginalFilename());
            log.info("  Content Type: {}", file.getContentType());
            log.info("  Size        : {} bytes ({} KB)", file.getSize(), file.getSize() / 1024);
            log.info("  Destination : {} [Cloud: {}]", folder, cloudName);
            if (preset != null && !preset.isBlank()) {
                log.info("  Preset Name : {}", preset);
            }
            log.info("============================================================");

            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));

            Map<String, Object> uploadParams = new HashMap<>();
            uploadParams.put("folder", folder);
            uploadParams.put("resource_type", "auto");
            if (preset != null && !preset.isBlank()) {
                uploadParams.put("upload_preset", preset);
            }

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            log.info("============================================================");
            log.info("[CLOUDINARY UPLOAD SUCCESS] Upload finished successfully!");
            log.info("  Public ID   : {}", publicId);
            log.info("  Secure URL  : {}", secureUrl);
            log.info("============================================================");

            return secureUrl;
        } catch (Exception ex) {
            log.error("============================================================");
            log.error("[CLOUDINARY UPLOAD ERROR] Failed to upload '{}': {}", file.getOriginalFilename(), ex.getMessage());
            log.error("============================================================", ex);
            throw new RuntimeException("Failed to upload file to Cloudinary: " + ex.getMessage(), ex);
        }
    }
}
