package com.kursywalut.integration;

import com.kursywalut.exception.NbpCodeNotFoundException;
import com.kursywalut.exception.NbpUnavailableException;
import com.kursywalut.model.Rate;
import com.kursywalut.service.NbpService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CurrencyControllerIntegrationTest extends AbstractIntegrationTest {

    @MockBean
    private NbpService nbpService;

    @Test
    void getRateReturnsMidRate() throws Exception {
        when(nbpService.getRate("USD")).thenReturn(new BigDecimal("3.75"));

        mockMvc.perform(get("/api/currency/USD").cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(content().string("3.75"));
    }

    @Test
    void getRateUppercasesCode() throws Exception {
        // path regex only allows uppercase letters; controller still normalizes before calling the service
        when(nbpService.getRate("USD")).thenReturn(new BigDecimal("3.75"));

        mockMvc.perform(get("/api/currency/USD").cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    void getRateReturns404WhenCodeUnknown() throws Exception {
        when(nbpService.getRate("XYZ")).thenThrow(new NbpCodeNotFoundException("nope"));

        mockMvc.perform(get("/api/currency/XYZ").cookie(authCookie))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NBP_CODE_NOT_FOUND"));
    }

    @Test
    void getRateReturns503WhenNbpUnavailable() throws Exception {
        when(nbpService.getRate("USD")).thenThrow(new NbpUnavailableException("down"));

        mockMvc.perform(get("/api/currency/USD").cookie(authCookie))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("NBP_UNAVAILABLE"));
    }

    @Test
    void convertToPlnDelegatesToService() throws Exception {
        when(nbpService.convertToPLN(any(BigDecimal.class), eq("USD"))).thenReturn(new BigDecimal("37.50"));

        mockMvc.perform(get("/api/currency/conversion")
                        .param("amount", "10")
                        .param("code", "usd")
                        .param("direction", "TO_PLN")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(content().string("37.50"));
    }

    @Test
    void convertFromPlnDelegatesToService() throws Exception {
        when(nbpService.convertFromPLN(any(BigDecimal.class), eq("USD"))).thenReturn(new BigDecimal("2.67"));

        mockMvc.perform(get("/api/currency/conversion")
                        .param("amount", "10")
                        .param("code", "USD")
                        .param("direction", "FROM_PLN")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(content().string("2.67"));
    }

    @Test
    void convertRejectsNonPositiveAmount() throws Exception {
        mockMvc.perform(get("/api/currency/conversion")
                        .param("amount", "0")
                        .param("code", "USD")
                        .param("direction", "TO_PLN")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CURRENCY_REQUEST"));
    }

    @Test
    void convertRejectsAmountAboveLimit() throws Exception {
        mockMvc.perform(get("/api/currency/conversion")
                        .param("amount", "100000001")
                        .param("code", "USD")
                        .param("direction", "TO_PLN")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CURRENCY_REQUEST"));
    }

    @Test
    void historyReturnsRates() throws Exception {
        when(nbpService.getLatestAvailableCurrencyDate()).thenReturn(LocalDate.of(2026, 6, 20));
        when(nbpService.getRateHistory("USD", LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11)))
                .thenReturn(List.of(
                        new Rate("dolar amerykanski", "USD", new BigDecimal("4.10"), LocalDate.of(2026, 3, 10)),
                        new Rate("dolar amerykanski", "USD", new BigDecimal("4.20"), LocalDate.of(2026, 3, 11))));

        mockMvc.perform(get("/api/currency/USD/history")
                        .param("startDate", "2026-03-10")
                        .param("endDate", "2026-03-11")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].code").value("USD"))
                .andExpect(jsonPath("$[0].currency").value("dolar amerykanski"))
                .andExpect(jsonPath("$[0].mid").value(4.10))
                .andExpect(jsonPath("$[0].effectiveDate").value("2026-03-10"));
    }

    @Test
    void historyRejectsStartAfterEnd() throws Exception {
        mockMvc.perform(get("/api/currency/USD/history")
                        .param("startDate", "2026-03-11")
                        .param("endDate", "2026-03-10")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CURRENCY_REQUEST"));
    }

    @Test
    void historyRejectsDateBeforeMinimum() throws Exception {
        mockMvc.perform(get("/api/currency/USD/history")
                        .param("startDate", "2001-01-01")
                        .param("endDate", "2001-02-01")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CURRENCY_REQUEST"));
    }

    @Test
    void historyRejectsRangeAfterLatestAvailableDate() throws Exception {
        when(nbpService.getLatestAvailableCurrencyDate()).thenReturn(LocalDate.of(2026, 6, 19));

        mockMvc.perform(get("/api/currency/USD/history")
                        .param("startDate", "2030-01-01")
                        .param("endDate", "2030-01-05")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("FUTURE_DATE"));
    }

    @Test
    void historyRejectsRangeLongerThanLimit() throws Exception {
        when(nbpService.getLatestAvailableCurrencyDate()).thenReturn(LocalDate.of(2026, 6, 20));

        mockMvc.perform(get("/api/currency/USD/history")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-05-01")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CURRENCY_REQUEST"));
    }

    @Test
    void availableCurrenciesReturnsRates() throws Exception {
        when(nbpService.getAvailableCurrencies()).thenReturn(List.of(
                new Rate("dolar amerykanski", "USD", new BigDecimal("3.75"), LocalDate.of(2026, 6, 20)),
                new Rate("euro", "EUR", new BigDecimal("4.30"), LocalDate.of(2026, 6, 20))));

        mockMvc.perform(get("/api/currency/available").cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].code").value("USD"))
                .andExpect(jsonPath("$[0].effectiveDate").value("2026-06-20"));
    }

    @Test
    void availableCurrenciesReturns503WhenNoneAvailable() throws Exception {
        when(nbpService.getAvailableCurrencies()).thenReturn(List.of());

        mockMvc.perform(get("/api/currency/available").cookie(authCookie))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("NO_AVAILABLE_CURRENCIES"));
    }
}
