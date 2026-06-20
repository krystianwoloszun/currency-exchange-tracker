package com.kursywalut.integration;

import com.kursywalut.exception.GoldPriceNotFoundException;
import com.kursywalut.model.GoldPrice;
import com.kursywalut.service.GoldPriceService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GoldPriceControllerIntegrationTest extends AbstractIntegrationTest {

    @MockBean
    private GoldPriceService goldPriceService;

    private GoldPrice gold(LocalDate date, String price) {
        return new GoldPrice(date, new BigDecimal(price));
    }

    @Test
    void getCurrentGoldPriceReturnsPrice() throws Exception {
        when(goldPriceService.getCurrentGoldPrice())
                .thenReturn(List.of(gold(LocalDate.of(2026, 6, 20), "412.35")));

        mockMvc.perform(get("/api/gold").cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].data").value("2026-06-20"))
                .andExpect(jsonPath("$[0].cena").value(412.35));
    }

    @Test
    void getTodayGoldPriceReturnsPrice() throws Exception {
        when(goldPriceService.getTodayGoldPrice())
                .thenReturn(List.of(gold(LocalDate.of(2026, 6, 20), "412.35")));

        mockMvc.perform(get("/api/gold/today").cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].cena").value(412.35));
    }

    @Test
    void getLatestGoldPricesReturnsRequestedCount() throws Exception {
        when(goldPriceService.getLatestGoldPrices(5))
                .thenReturn(List.of(gold(LocalDate.of(2026, 6, 20), "412.35")));

        mockMvc.perform(get("/api/gold/latest").param("topCount", "5").cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getLatestUsesDefaultCountWhenNotProvided() throws Exception {
        when(goldPriceService.getLatestGoldPrices(30))
                .thenReturn(List.of(gold(LocalDate.of(2026, 6, 20), "412.35")));

        mockMvc.perform(get("/api/gold/latest").cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    void getLatestRejectsNonPositiveCount() throws Exception {
        mockMvc.perform(get("/api/gold/latest").param("topCount", "0").cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_GOLD_REQUEST"));
    }

    @Test
    void getLatestRejectsCountAboveLimit() throws Exception {
        mockMvc.perform(get("/api/gold/latest").param("topCount", "94").cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_GOLD_REQUEST"));
    }

    @Test
    void getGoldPriceByDateReturnsPrice() throws Exception {
        when(goldPriceService.getGoldPriceByDate(LocalDate.of(2020, 1, 2)))
                .thenReturn(List.of(gold(LocalDate.of(2020, 1, 2), "201.50")));

        mockMvc.perform(get("/api/gold/2020-01-02").cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].data").value("2020-01-02"));
    }

    @Test
    void getGoldPriceByDateRejectsDateBeforeMinimum() throws Exception {
        mockMvc.perform(get("/api/gold/2010-01-01").cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_GOLD_REQUEST"));
    }

    @Test
    void getGoldPriceByDateReturns404WhenNbpHasNoData() throws Exception {
        when(goldPriceService.getGoldPriceByDate(LocalDate.of(2020, 1, 2)))
                .thenThrow(new GoldPriceNotFoundException("nope"));

        mockMvc.perform(get("/api/gold/2020-01-02").cookie(authCookie))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("GOLD_PRICE_NOT_FOUND"));
    }

    @Test
    void historyReturnsRange() throws Exception {
        when(goldPriceService.getLatestAvailableGoldDate()).thenReturn(LocalDate.of(2026, 6, 20));
        when(goldPriceService.getGoldPriceHistory(LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11)))
                .thenReturn(List.of(
                        gold(LocalDate.of(2026, 3, 10), "401.11"),
                        gold(LocalDate.of(2026, 3, 11), "402.22")));

        mockMvc.perform(get("/api/gold/history")
                        .param("startDate", "2026-03-10")
                        .param("endDate", "2026-03-11")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].cena").value(402.22));
    }

    @Test
    void historyRejectsStartAfterEnd() throws Exception {
        mockMvc.perform(get("/api/gold/history")
                        .param("startDate", "2026-03-11")
                        .param("endDate", "2026-03-10")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_GOLD_REQUEST"));
    }

    @Test
    void historyRejectsDateBeforeMinimum() throws Exception {
        mockMvc.perform(get("/api/gold/history")
                        .param("startDate", "2010-01-01")
                        .param("endDate", "2010-02-01")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_GOLD_REQUEST"));
    }

    @Test
    void historyRejectsRangeAfterLatestAvailableDate() throws Exception {
        when(goldPriceService.getLatestAvailableGoldDate()).thenReturn(LocalDate.of(2026, 6, 19));

        mockMvc.perform(get("/api/gold/history")
                        .param("startDate", "2030-01-01")
                        .param("endDate", "2030-01-05")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("FUTURE_DATE"));
    }

    @Test
    void historyRejectsRangeLongerThanLimit() throws Exception {
        when(goldPriceService.getLatestAvailableGoldDate()).thenReturn(LocalDate.of(2026, 6, 20));

        mockMvc.perform(get("/api/gold/history")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-05-01")
                        .cookie(authCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_GOLD_REQUEST"));
    }
}
