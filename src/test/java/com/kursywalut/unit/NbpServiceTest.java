package com.kursywalut.unit;

import com.kursywalut.exception.NbpCodeNotFoundException;
import com.kursywalut.exception.NbpUnavailableException;
import com.kursywalut.model.NbpResponse;
import com.kursywalut.model.NbpTableResponse;
import com.kursywalut.model.Rate;
import com.kursywalut.service.NbpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NbpServiceTest {

    private RestTemplate restTemplate;
    private NbpService nbpService;

    @BeforeEach
    void setup() {
        restTemplate = mock(RestTemplate.class);
        nbpService = new NbpService(restTemplate);
        nbpService.setRateUrl("http://nbp/rates/A");
        nbpService.setTableUrl("http://nbp/tables/A");
    }

    private NbpResponse rateResponse(String code, String currency, List<Rate> rates) {
        NbpResponse response = new NbpResponse();
        response.setCode(code);
        response.setCurrency(currency);
        response.setRates(rates);
        return response;
    }

    private Rate rate(BigDecimal mid, LocalDate effectiveDate) {
        Rate rate = new Rate();
        rate.setMidRate(mid);
        rate.setEffectiveDate(effectiveDate);
        return rate;
    }

    @Test
    void getRateReturnsMidRate() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenReturn(rateResponse("USD", "dolar amerykanski", List.of(rate(new BigDecimal("4.25"), null))));

        assertThat(nbpService.getRate("USD")).isEqualByComparingTo("4.25");
    }

    @Test
    void getRateBuildsExpectedUrl() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenReturn(rateResponse("USD", "dolar", List.of(rate(new BigDecimal("4.0"), null))));

        nbpService.getRate("USD");

        ArgumentCaptor<String> url = ArgumentCaptor.forClass(String.class);
        verify(restTemplate).getForObject(url.capture(), eq(NbpResponse.class));
        assertThat(url.getValue()).isEqualTo("http://nbp/rates/A/USD?format=json");
    }

    @Test
    void getRateMapsNotFoundToDomainException() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenThrow(HttpClientErrorException.NotFound.class);

        assertThatThrownBy(() -> nbpService.getRate("XXX"))
                .isInstanceOf(NbpCodeNotFoundException.class);
    }

    @Test
    void getRateMapsConnectionFailureToUnavailable() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenThrow(new ResourceAccessException("connection refused"));

        assertThatThrownBy(() -> nbpService.getRate("USD"))
                .isInstanceOf(NbpUnavailableException.class);
    }

    @Test
    void convertToPlnMultipliesByRate() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenReturn(rateResponse("USD", "dolar", List.of(rate(new BigDecimal("4.0"), null))));

        assertThat(nbpService.convertToPLN(new BigDecimal("10"), "USD")).isEqualByComparingTo("40.0");
    }

    @Test
    void convertFromPlnDividesAndRoundsHalfUp() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenReturn(rateResponse("USD", "dolar", List.of(rate(new BigDecimal("3.0"), null))));

        // 10 / 3 = 3.333... -> 3.33
        assertThat(nbpService.convertFromPLN(new BigDecimal("10"), "USD")).isEqualByComparingTo("3.33");
    }

    @Test
    void getRateHistoryMapsEachRateWithCurrencyMetadata() {
        NbpResponse response = rateResponse("USD", "dolar amerykanski", List.of(
                rate(new BigDecimal("4.10"), LocalDate.of(2026, 3, 10)),
                rate(new BigDecimal("4.20"), LocalDate.of(2026, 3, 11))));
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class))).thenReturn(response);

        List<Rate> result = nbpService.getRateHistory("USD", LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11));

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCode()).isEqualTo("USD");
        assertThat(result.get(0).getCurrencyName()).isEqualTo("dolar amerykanski");
        assertThat(result.get(0).getMidRate()).isEqualByComparingTo("4.10");
        assertThat(result.get(0).getEffectiveDate()).isEqualTo(LocalDate.of(2026, 3, 10));
        assertThat(result.get(1).getEffectiveDate()).isEqualTo(LocalDate.of(2026, 3, 11));
    }

    @Test
    void getRateHistoryThrowsUnavailableOnEmptyResponse() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenReturn(rateResponse("USD", "dolar", List.of()));

        assertThatThrownBy(() -> nbpService.getRateHistory("USD", LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11)))
                .isInstanceOf(NbpUnavailableException.class);
    }

    @Test
    void getRateHistoryMapsNotFoundToDomainException() {
        when(restTemplate.getForObject(anyString(), eq(NbpResponse.class)))
                .thenThrow(HttpClientErrorException.NotFound.class);

        assertThatThrownBy(() -> nbpService.getRateHistory("XXX", LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11)))
                .isInstanceOf(NbpCodeNotFoundException.class);
    }

    @Test
    void getAvailableCurrenciesMapsTableRatesWithEffectiveDate() {
        NbpTableResponse table = new NbpTableResponse();
        table.setEffectiveDate("2026-06-20");
        table.setRates(List.of(
                new Rate("dolar amerykanski", "USD", new BigDecimal("3.75"), null),
                new Rate("euro", "EUR", new BigDecimal("4.30"), null)));
        when(restTemplate.getForObject(anyString(), eq(NbpTableResponse[].class)))
                .thenReturn(new NbpTableResponse[]{table});

        List<Rate> result = nbpService.getAvailableCurrencies();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCode()).isEqualTo("USD");
        assertThat(result.get(0).getEffectiveDate()).isEqualTo(LocalDate.of(2026, 6, 20));
        assertThat(result.get(1).getCode()).isEqualTo("EUR");
    }

    @Test
    void getAvailableCurrenciesThrowsWhenNbpReturnsNothing() {
        when(restTemplate.getForObject(anyString(), eq(NbpTableResponse[].class)))
                .thenReturn(new NbpTableResponse[]{});

        assertThatThrownBy(() -> nbpService.getAvailableCurrencies())
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getLatestAvailableCurrencyDateReturnsEffectiveDateOfFirstRate() {
        NbpTableResponse table = new NbpTableResponse();
        table.setEffectiveDate("2026-06-20");
        table.setRates(List.of(new Rate("dolar", "USD", new BigDecimal("3.75"), null)));
        when(restTemplate.getForObject(anyString(), eq(NbpTableResponse[].class)))
                .thenReturn(new NbpTableResponse[]{table});

        assertThat(nbpService.getLatestAvailableCurrencyDate()).isEqualTo(LocalDate.of(2026, 6, 20));
    }
}
