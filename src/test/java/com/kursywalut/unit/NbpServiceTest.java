package com.kursywalut.unit;

import com.kursywalut.exception.NbpCodeNotFoundException;
import com.kursywalut.model.NbpResponse;
import com.kursywalut.model.Rate;
import com.kursywalut.service.NbpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
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
        rate.setCurrency("dolar amerykanski");
        rate.setCode("USD");
        rate.setMid(new BigDecimal("4.25"));
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
        rate.setCurrency("dolar amerykanski");
        rate.setCode("USD");
        rate.setMid(new BigDecimal("4.0"));

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
        rate.setCurrency("dolar amerykanski");
        rate.setCode("USD");
        rate.setMid(new BigDecimal("4.0"));
        NbpResponse response = new NbpResponse();
        response.setRates(List.of(rate));
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class))).thenReturn(response);

        BigDecimal amount = new BigDecimal("40");
        BigDecimal result = nbpService.convertFromPLN(amount, "USD");
        assertEquals(new BigDecimal("10.00"), result);
    }
}
