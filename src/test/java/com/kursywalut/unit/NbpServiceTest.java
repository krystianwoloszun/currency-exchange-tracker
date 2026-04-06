package com.kursywalut.unit;

import com.kursywalut.exception.NbpCodeNotFoundException;
import com.kursywalut.model.NbpResponse;
import com.kursywalut.model.Rate;
import com.kursywalut.service.NbpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NbpServiceTest{

    private RestTemplate restTemplate;
    private NbpService nbpService;

    @BeforeEach
    void setup() {
        restTemplate = mock(RestTemplate.class);
        nbpService = new NbpService(restTemplate);
        nbpService.setRateUrl("http://fake-url");
        nbpService.setTableUrl("http://fake-table-url");
    }

    @Test
    void testGetRate_success() {
        Rate rate = new Rate();
        rate.setCurrencyName("dolar amerykanski");
        rate.setCode("USD");
        rate.setMidRate(new BigDecimal("4.25"));
        NbpResponse response = new NbpResponse();
        response.setRates(List.of(rate));
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class))).thenReturn(response);

        BigDecimal result = nbpService.getRate("USD");
        assertEquals(new BigDecimal("4.25"), result);
    }

    @Test
    void testGetRate_notFound() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenThrow(HttpClientErrorException.NotFound.class);

        assertThrows(NbpCodeNotFoundException.class, () -> nbpService.getRate("XXX"));
    }

    @Test
    void testConvertToPLN() {
        Rate rate = new Rate();
        rate.setCurrencyName("dolar amerykanski");
        rate.setCode("USD");
        rate.setMidRate(new BigDecimal("4.0"));

        NbpResponse response = new NbpResponse();
        response.setRates(List.of(rate));
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class))).thenReturn(response);

        BigDecimal amount = new BigDecimal("10");
        BigDecimal result = nbpService.convertToPLN(amount, "USD");
        assertEquals(new BigDecimal("40.0"), result);
    }

    @Test
    void testConvertFromPLN() {
        Rate rate = new Rate();
        rate.setCurrencyName("dolar amerykanski");
        rate.setCode("USD");
        rate.setMidRate(new BigDecimal("4.0"));
        NbpResponse response = new NbpResponse();
        response.setRates(List.of(rate));
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class))).thenReturn(response);

        BigDecimal amount = new BigDecimal("40");
        BigDecimal result = nbpService.convertFromPLN(amount, "USD");
        assertEquals(new BigDecimal("10.00"), result);
    }

    @Test
    void testGetRateHistory_success() {
        Rate rate1 = new Rate();
        rate1.setMidRate(new BigDecimal("4.10"));
        rate1.setEffectiveDate(LocalDate.of(2026, 3, 10));

        Rate rate2 = new Rate();
        rate2.setMidRate(new BigDecimal("4.20"));
        rate2.setEffectiveDate(LocalDate.of(2026, 3, 11));

        NbpResponse response = new NbpResponse();
        response.setCurrency("dolar amerykanski");
        response.setCode("USD");
        response.setRates(List.of(rate1, rate2));

        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class))).thenReturn(response);

        List<Rate> result = nbpService.getRateHistory("USD", LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11));

        assertEquals(2, result.size());
        assertEquals("USD", result.get(0).getCode());
        assertEquals("dolar amerykanski", result.get(0).getCurrencyName());
        assertEquals(new BigDecimal("4.10"), result.get(0).getMidRate());
        assertEquals(LocalDate.of(2026, 3, 10), result.get(0).getEffectiveDate());
        assertEquals(LocalDate.of(2026, 3, 11), result.get(1).getEffectiveDate());
    }
}
