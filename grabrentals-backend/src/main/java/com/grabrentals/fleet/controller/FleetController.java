package com.grabrentals.fleet.controller;

import com.grabrentals.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/fleet")
public class FleetController {

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Fleet dashboard", Map.of("role", "FLEET")));
    }
}
