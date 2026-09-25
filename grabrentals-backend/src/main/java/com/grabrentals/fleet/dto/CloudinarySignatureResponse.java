package com.grabrentals.fleet.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudinarySignatureResponse {

    private String signature;
    private long timestamp;
    private String apiKey;
    private String cloudName;
    private String folder;
}
