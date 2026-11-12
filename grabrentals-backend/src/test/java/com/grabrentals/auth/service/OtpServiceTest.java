package com.grabrentals.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grabrentals.auth.dto.SendOtpResponse;
import com.grabrentals.common.exception.InvalidCredentialsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class OtpServiceTest {

    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService(new ObjectMapper());
        ReflectionTestUtils.setField(otpService, "smsEnabled", false);
        ReflectionTestUtils.setField(otpService, "whatsappEnabled", false);
        ReflectionTestUtils.setField(otpService, "exposeDevOtp", true);
    }

    @Test
    void testFormatCountryRecipientNormalizesIndiaNumbers() {
        assertEquals("919345004690", otpService.formatCountryRecipient("9345004690"));
        assertEquals("919345004690", otpService.formatCountryRecipient("+919345004690"));
        assertEquals("919345004690", otpService.formatCountryRecipient("91 93450 04690"));
        assertEquals("919345004690", otpService.formatCountryRecipient("09345004690"));
    }

    @Test
    void testGenerateAndVerifyOtpFlow() {
        SendOtpResponse response = otpService.generateAndSendOtp("9345004690");
        assertNotNull(response);
        assertEquals("+919345004690", response.getPhone());
        assertNotNull(response.getDevOtp());
        assertEquals(6, response.getDevOtp().length());

        // Wrong OTP fails
        assertThrows(InvalidCredentialsException.class, () ->
                otpService.verifyOtp("9345004690", "000000")
        );

        // Correct OTP succeeds
        assertTrue(otpService.verifyOtp("9345004690", response.getDevOtp()));
    }
}

