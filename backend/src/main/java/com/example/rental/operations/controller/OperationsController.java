package com.example.rental.operations.controller;

import com.example.rental.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/operations")
public class OperationsController {

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Operations dashboard", Map.of("role", "OPERATIONS")));
    }
}
