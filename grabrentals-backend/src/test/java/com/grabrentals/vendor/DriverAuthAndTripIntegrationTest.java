package com.grabrentals.vendor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grabrentals.auth.dto.SendOtpRequest;
import com.grabrentals.auth.dto.VerifyOtpRequest;
import com.grabrentals.user.entity.Role;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.entity.UserStatus;
import com.grabrentals.user.repository.UserRepository;
import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.vendor.entity.DriverStatus;
import com.grabrentals.vendor.repository.DriverRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "app.otp.expose-dev-otp=true")
@AutoConfigureMockMvc
public class DriverAuthAndTripIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    private User testFleetOwner;
    private Driver testDriver;

    @BeforeEach
    void setUp() {
        driverRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create a Fleet Vendor User
        testFleetOwner = userRepository.save(User.builder()
                .name("Rao Travels")
                .businessName("Rao Travels Fleet Ltd")
                .email("rao@travels.com")
                .phone("+919111222333")
                .password("$2a$10$abcdefghijklmnopqrstuvwxyz123456")
                .role(Role.FLEET)
                .status(UserStatus.ACTIVE)
                .build());

        // 2. Register a Chauffeur under this fleet vendor with a unique phone
        testDriver = driverRepository.save(Driver.builder()
                .user(testFleetOwner)
                .name("Ramesh Kumar")
                .phone("9876543210")
                .licenseNumber("DL-04-2015-1234567")
                .licenseExpiry(LocalDate.now().plusYears(3))
                .status(DriverStatus.AVAILABLE)
                .experienceYears(8)
                .build());
    }

    @Test
    @DisplayName("Chauffeur flow: Send OTP -> Verify OTP as DRIVER -> Access driver endpoints")
    void testDriverLoginAndAccessFlow() throws Exception {
        // Step 1: Chauffeur requests OTP using their registered phone number
        SendOtpRequest sendReq = SendOtpRequest.builder()
                .phone("9876543210")
                .purpose("LOGIN")
                .build();

        MvcResult sendRes = mockMvc.perform(post("/api/auth/otp/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.userExists", is(true)))
                .andExpect(jsonPath("$.data.existingRole", is("DRIVER")))
                .andReturn();

        JsonNode sendNode = objectMapper.readTree(sendRes.getResponse().getContentAsString());
        String devOtp = sendNode.path("data").path("devOtp").asText();
        assertNotNull(devOtp, "devOtp should be present in local/test profile");

        // Step 2: Verify OTP
        VerifyOtpRequest verifyReq = VerifyOtpRequest.builder()
                .phone("9876543210")
                .otp(devOtp)
                .build();

        MvcResult verifyRes = mockMvc.perform(post("/api/auth/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.user.role", is("DRIVER")))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        JsonNode verifyNode = objectMapper.readTree(verifyRes.getResponse().getContentAsString());
        String token = verifyNode.path("data").path("accessToken").asText();

        // Step 3: Fetch Driver Profile via /api/driver/trips/profile
        mockMvc.perform(get("/api/driver/trips/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Ramesh Kumar")))
                .andExpect(jsonPath("$.data.phone", is("+919876543210")))
                .andExpect(jsonPath("$.data.fleetBusinessName", is("Rao Travels Fleet Ltd")));

        // Step 4: Fetch Driver Trips via /api/driver/trips
        mockMvc.perform(get("/api/driver/trips")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", isA(Iterable.class)));
    }
}
