package com.grabrentals.auth;

import com.grabrentals.auth.dto.CustomerRegisterRequest;
import com.grabrentals.auth.dto.FleetRegisterRequest;
import com.grabrentals.auth.dto.LoginRequest;
import com.grabrentals.user.dto.UpdateUserStatusRequest;
import com.grabrentals.user.entity.Role;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.entity.UserStatus;
import com.grabrentals.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Customer registration creates user with CUSTOMER role and ACTIVE status")
    void testCustomerRegistrationSuccess() throws Exception {
        CustomerRegisterRequest request = CustomerRegisterRequest.builder()
                .name("Alice Customer")
                .email("alice@example.com")
                .phone("+919988776655")
                .password("Password@123")
                .build();

        mockMvc.perform(post("/api/auth/register/customer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("alice@example.com")))
                .andExpect(jsonPath("$.data.role", is("CUSTOMER")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));

        User user = userRepository.findByEmail("alice@example.com").orElseThrow();
        assertEquals(Role.CUSTOMER, user.getRole());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertTrue(passwordEncoder.matches("Password@123", user.getPassword()));
    }

    @Test
    @DisplayName("2. Fleet registration creates user with FLEET role and PENDING status")
    void testFleetRegistrationPendingStatus() throws Exception {
        FleetRegisterRequest request = FleetRegisterRequest.builder()
                .name("Bob Transports")
                .email("bob@transports.com")
                .phone("+919988776644")
                .password("Password@123")
                .businessName("Bob Luxury Cabs Pvt Ltd")
                .build();

        mockMvc.perform(post("/api/auth/register/fleet")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("bob@transports.com")))
                .andExpect(jsonPath("$.data.role", is("FLEET")))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.businessName", is("Bob Luxury Cabs Pvt Ltd")));

        User user = userRepository.findByEmail("bob@transports.com").orElseThrow();
        assertEquals(Role.FLEET, user.getRole());
        assertEquals(UserStatus.PENDING, user.getStatus());
    }

    @Test
    @DisplayName("3. Duplicate email registration is rejected with 409 Conflict")
    void testDuplicateEmailRegistrationRejected() throws Exception {
        userRepository.save(User.builder()
                .name("Existing User")
                .email("duplicate@example.com")
                .phone("+919000000001")
                .password(passwordEncoder.encode("Pass@123"))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build());

        CustomerRegisterRequest request = CustomerRegisterRequest.builder()
                .name("New User")
                .email("duplicate@example.com")
                .phone("+919000000002")
                .password("Password@123")
                .build();

        mockMvc.perform(post("/api/auth/register/customer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Email already in use")));
    }

    @Test
    @DisplayName("4. Login success returns valid JWT token and user summary")
    void testLoginSuccess() throws Exception {
        userRepository.save(User.builder()
                .name("Active Customer")
                .email("customer@example.com")
                .phone("+919111111111")
                .password(passwordEncoder.encode("Secret@123"))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("customer@example.com")
                .password("Secret@123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.data.user.email", is("customer@example.com")))
                .andExpect(jsonPath("$.data.user.role", is("CUSTOMER")));
    }

    @Test
    @DisplayName("5. Invalid password results in 401 Unauthorized")
    void testLoginInvalidPassword() throws Exception {
        userRepository.save(User.builder()
                .name("Test User")
                .email("test@example.com")
                .phone("+919222222222")
                .password(passwordEncoder.encode("CorrectPassword@123"))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("WrongPassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid credentials")));
    }

    @Test
    @DisplayName("6. Blocked user login is rejected with 403 Forbidden")
    void testBlockedUserLoginRejected() throws Exception {
        userRepository.save(User.builder()
                .name("Blocked User")
                .email("blocked@example.com")
                .phone("+919333333333")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.CUSTOMER)
                .status(UserStatus.BLOCKED)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("blocked@example.com")
                .password("Password@123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("blocked")));
    }

    @Test
    @DisplayName("7. Pending fleet user login is rejected with 403 Forbidden")
    void testPendingFleetUserLoginRejected() throws Exception {
        userRepository.save(User.builder()
                .name("Pending Fleet")
                .email("fleet@example.com")
                .phone("+919444444444")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.FLEET)
                .status(UserStatus.PENDING)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("fleet@example.com")
                .password("Password@123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("pending")));
    }

    @Test
    @DisplayName("8. Authenticated user can fetch their profile via /api/auth/me")
    void testGetMeEndpoint() throws Exception {
        userRepository.save(User.builder()
                .name("Profile Customer")
                .email("profile@example.com")
                .phone("+919555555555")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build());

        String token = obtainToken("profile@example.com", "Password@123");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("profile@example.com")))
                .andExpect(jsonPath("$.data.name", is("Profile Customer")));
    }

    @Test
    @DisplayName("9. CUSTOMER authorization: 200 on /api/customer/dashboard, 403 on /api/admin/dashboard")
    void testCustomerRoleAuthorization() throws Exception {
        userRepository.save(User.builder()
                .name("Customer Role")
                .email("cust@example.com")
                .phone("+919666666666")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build());

        String token = obtainToken("cust@example.com", "Password@123");

        // Allowed
        mockMvc.perform(get("/api/customer/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is("CUSTOMER")));

        // Forbidden
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("10. FLEET authorization: 200 on /api/fleet/dashboard, 403 on /api/customer/dashboard")
    void testFleetRoleAuthorization() throws Exception {
        userRepository.save(User.builder()
                .name("Approved Fleet Partner")
                .email("approvedfleet@example.com")
                .phone("+919777777777")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.FLEET)
                .status(UserStatus.ACTIVE)
                .build());

        String token = obtainToken("approvedfleet@example.com", "Password@123");

        // Allowed
        mockMvc.perform(get("/api/fleet/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is("FLEET")));

        // Forbidden
        mockMvc.perform(get("/api/customer/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("11. OPERATIONS authorization: 200 on /api/operations/dashboard, 403 on /api/admin/dashboard")
    void testOperationsRoleAuthorization() throws Exception {
        userRepository.save(User.builder()
                .name("Operations Staff")
                .email("ops@example.com")
                .phone("+919888888888")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.OPERATIONS)
                .status(UserStatus.ACTIVE)
                .build());

        String token = obtainToken("ops@example.com", "Password@123");

        // Allowed
        mockMvc.perform(get("/api/operations/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is("OPERATIONS")));

        // Forbidden
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("12. ADMIN authorization: 200 on /api/admin/dashboard and can approve PENDING fleet user")
    void testAdminAuthorizationAndFleetApprovalFlow() throws Exception {
        // Create Admin
        userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@rental.com")
                .phone("+919999999999")
                .password(passwordEncoder.encode("AdminPass@123"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        // Create Pending Fleet
        User pendingFleet = userRepository.save(User.builder()
                .name("Pending Transport")
                .email("pending@transport.com")
                .phone("+919888888889")
                .password(passwordEncoder.encode("FleetPass@123"))
                .businessName("Pending Cabs")
                .role(Role.FLEET)
                .status(UserStatus.PENDING)
                .build());

        String adminToken = obtainToken("admin@rental.com", "AdminPass@123");

        // Verify Admin Access
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is("ADMIN")));

        // Admin approves Fleet user: status -> ACTIVE
        UpdateUserStatusRequest statusRequest = new UpdateUserStatusRequest(UserStatus.ACTIVE);
        mockMvc.perform(patch("/api/admin/users/" + pendingFleet.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));

        // Fleet can now log in successfully
        String fleetToken = obtainToken("pending@transport.com", "FleetPass@123");
        assertNotNull(fleetToken);

        // Fleet can now access /api/fleet/dashboard
        mockMvc.perform(get("/api/fleet/dashboard")
                        .header("Authorization", "Bearer " + fleetToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is("FLEET")));
    }

    @Test
    @DisplayName("13. Customer OTP flow: sends OTP, auto-creates customer on verify, and updates profile")
    void testOtpSendAndVerifyAndUpdateProfile() throws Exception {
        // Step 1: Send OTP to 10-digit mobile
        com.grabrentals.auth.dto.SendOtpRequest sendRequest = new com.grabrentals.auth.dto.SendOtpRequest("9876543210");
        MvcResult sendResult = mockMvc.perform(post("/api/auth/otp/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sendRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.devOtp").isNotEmpty())
                .andReturn();

        JsonNode sendJson = objectMapper.readTree(sendResult.getResponse().getContentAsString());
        String devOtp = sendJson.path("data").path("devOtp").asText();

        // Step 2: Verify OTP
        com.grabrentals.auth.dto.VerifyOtpRequest verifyRequest = new com.grabrentals.auth.dto.VerifyOtpRequest("9876543210", devOtp);
        MvcResult verifyResult = mockMvc.perform(post("/api/auth/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.role", is("CUSTOMER")))
                .andReturn();

        JsonNode verifyJson = objectMapper.readTree(verifyResult.getResponse().getContentAsString());
        String token = verifyJson.path("data").path("accessToken").asText();

        // Step 3: Get profile via /api/customer/profile
        mockMvc.perform(get("/api/customer/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phone", is("+919876543210")));

        // Step 4: Update personal details via PUT /api/customer/profile
        com.grabrentals.customer.dto.CustomerProfileUpdateRequest profileUpdate = com.grabrentals.customer.dto.CustomerProfileUpdateRequest.builder()
                .name("Vikram Malhotra")
                .email("vikram@gmail.com")
                .alternatePhone("+919811223344")
                .city("Mumbai")
                .address("Bandra West, Luxury High Street")
                .build();

        mockMvc.perform(put("/api/customer/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Vikram Malhotra")))
                .andExpect(jsonPath("$.data.email", is("vikram@gmail.com")))
                .andExpect(jsonPath("$.data.city", is("Mumbai")))
                .andExpect(jsonPath("$.data.address", is("Bandra West, Luxury High Street")));
    }

    private String obtainToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("accessToken").asText();
    }
}
