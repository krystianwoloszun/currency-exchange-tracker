package com.kursywalut.unit;

import com.kursywalut.exception.GoldPriceNotFoundException;
import com.kursywalut.model.GoldPrice;
import com.kursywalut.service.GoldPriceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GoldPriceServiceTest {

    private RestTemplate restTemplate;
    private GoldPriceService goldPriceService;

    @BeforeEach
    void setup() {
        restTemplate = mock(RestTemplate.class);
        goldPriceService = new GoldPriceService(restTemplate);
        goldPriceService.setGoldUrl("http://fake-gold-url");
    }

    @Test
    void testGetCurrentGoldPriceSuccess() {
        GoldPrice goldPrice = new GoldPrice(LocalDate.of(2026, 4, 1), new BigDecimal("412.35"));
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class))).thenReturn(new GoldPrice[]{goldPrice});

        List<GoldPrice> result = goldPriceService.getCurrentGoldPrice();

        assertEquals(1, result.size());
        assertEquals(new BigDecimal("412.35"), result.getFirst().getPrice());
    }

    @Test
    void testGetGoldPriceByDateNotFound() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenThrow(HttpClientErrorException.NotFound.class);

        assertThrows(GoldPriceNotFoundException.class, () -> goldPriceService.getGoldPriceByDate(LocalDate.of(2026, 4, 1)));
    }

    @Test
    void testGetGoldPriceHistorySuccess() {
        GoldPrice first = new GoldPrice(LocalDate.of(2026, 3, 10), new BigDecimal("401.11"));
        GoldPrice second = new GoldPrice(LocalDate.of(2026, 3, 11), new BigDecimal("402.22"));

        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class))).thenReturn(new GoldPrice[]{first, second});

        List<GoldPrice> result = goldPriceService.getGoldPriceHistory(LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11));

        assertEquals(2, result.size());
        assertEquals(LocalDate.of(2026, 3, 10), result.get(0).getDate());
        assertEquals(new BigDecimal("402.22"), result.get(1).getPrice());
    }
}
