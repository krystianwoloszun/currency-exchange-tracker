package com.kursywalut.integration;

import com.kursywalut.model.GoldPrice;
import com.kursywalut.service.GoldPriceService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityIntegrationTest extends AbstractIntegrationTest {

    @MockBean
    private GoldPriceService goldPriceService;

    @Test
    void protectedEndpointRejectsRequestWithoutToken() throws Exception {
        mockMvc.perform(get("/api/gold"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void protectedEndpointRejectsInvalidToken() throws Exception {
        mockMvc.perform(get("/api/gold").cookie(new Cookie("authToken", "garbage-token")))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void protectedEndpointRejectsTokenForDeletedUser() throws Exception {
        Cookie ghostCookie = new Cookie("authToken", jwtUtil.generateToken("deleted-user"));

        mockMvc.perform(get("/api/gold").cookie(ghostCookie))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void protectedEndpointAcceptsValidTokenForExistingUser() throws Exception {
        when(goldPriceService.getCurrentGoldPrice())
                .thenReturn(List.of(new GoldPrice(LocalDate.of(2026, 6, 20), new BigDecimal("412.35"))));

        mockMvc.perform(get("/api/gold").cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    void bearerTokenInAuthorizationHeaderIsAccepted() throws Exception {
        when(goldPriceService.getCurrentGoldPrice())
                .thenReturn(List.of(new GoldPrice(LocalDate.of(2026, 6, 20), new BigDecimal("412.35"))));

        mockMvc.perform(get("/api/gold").header("Authorization", "Bearer " + jwtUtil.generateToken(AUTH_USERNAME)))
                .andExpect(status().isOk());
    }

    @Test
    void corsPreflightAllowsConfiguredLocalhostOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "http://localhost:5174")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5174"));
    }
}
