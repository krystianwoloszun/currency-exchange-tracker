package com.kursywalut.unit;

import com.kursywalut.exception.GoldPriceNotFoundException;
import com.kursywalut.exception.NbpUnavailableException;
import com.kursywalut.model.GoldPrice;
import com.kursywalut.service.GoldPriceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
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

class GoldPriceServiceTest {

    private RestTemplate restTemplate;
    private GoldPriceService goldPriceService;

    @BeforeEach
    void setup() {
        restTemplate = mock(RestTemplate.class);
        goldPriceService = new GoldPriceService(restTemplate);
        goldPriceService.setGoldUrl("http://nbp/cenyzlota");
    }

    private GoldPrice gold(LocalDate date, String price) {
        return new GoldPrice(date, new BigDecimal(price));
    }

    private String capturedUrl() {
        ArgumentCaptor<String> url = ArgumentCaptor.forClass(String.class);
        verify(restTemplate).getForObject(url.capture(), eq(GoldPrice[].class));
        return url.getValue();
    }

    @Test
    void getCurrentGoldPriceReturnsPrices() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenReturn(new GoldPrice[]{gold(LocalDate.of(2026, 6, 20), "412.35")});

        List<GoldPrice> result = goldPriceService.getCurrentGoldPrice();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getPrice()).isEqualByComparingTo("412.35");
        assertThat(capturedUrl()).isEqualTo("http://nbp/cenyzlota?format=json");
    }

    @Test
    void getCurrentGoldPriceThrowsUnavailableWhenEmpty() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenReturn(new GoldPrice[]{});

        assertThatThrownBy(() -> goldPriceService.getCurrentGoldPrice())
                .isInstanceOf(NbpUnavailableException.class);
    }

    @Test
    void getTodayGoldPriceUsesTodayEndpoint() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenReturn(new GoldPrice[]{gold(LocalDate.of(2026, 6, 20), "412.35")});

        goldPriceService.getTodayGoldPrice();

        assertThat(capturedUrl()).isEqualTo("http://nbp/cenyzlota/today?format=json");
    }

    @Test
    void getLatestGoldPricesUsesLastEndpointWithCount() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenReturn(new GoldPrice[]{gold(LocalDate.of(2026, 6, 20), "412.35")});

        goldPriceService.getLatestGoldPrices(5);

        assertThat(capturedUrl()).isEqualTo("http://nbp/cenyzlota/last/5?format=json");
    }

    @Test
    void getGoldPriceByDateMapsNotFoundToDomainException() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenThrow(HttpClientErrorException.NotFound.class);

        assertThatThrownBy(() -> goldPriceService.getGoldPriceByDate(LocalDate.of(2026, 4, 1)))
                .isInstanceOf(GoldPriceNotFoundException.class);
    }

    @Test
    void getGoldPriceHistoryReturnsRange() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenReturn(new GoldPrice[]{
                        gold(LocalDate.of(2026, 3, 10), "401.11"),
                        gold(LocalDate.of(2026, 3, 11), "402.22")});

        List<GoldPrice> result = goldPriceService.getGoldPriceHistory(
                LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11));

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDate()).isEqualTo(LocalDate.of(2026, 3, 10));
        assertThat(result.get(1).getPrice()).isEqualByComparingTo("402.22");
        assertThat(capturedUrl())
                .isEqualTo("http://nbp/cenyzlota/2026-03-10/2026-03-11?format=json");
    }

    @Test
    void getGoldPriceHistoryMapsServerErrorToUnavailable() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenThrow(HttpServerErrorException.create(
                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                        "error", org.springframework.http.HttpHeaders.EMPTY, new byte[0], null));

        assertThatThrownBy(() -> goldPriceService.getGoldPriceHistory(
                LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 11)))
                .isInstanceOf(NbpUnavailableException.class);
    }

    @Test
    void getLatestAvailableGoldDateReturnsDateOfFirstPrice() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenReturn(new GoldPrice[]{gold(LocalDate.of(2026, 6, 20), "412.35")});

        assertThat(goldPriceService.getLatestAvailableGoldDate()).isEqualTo(LocalDate.of(2026, 6, 20));
    }

    @Test
    void getLatestAvailableGoldDateThrowsWhenEmpty() {
        when(restTemplate.getForObject(anyString(), eq(GoldPrice[].class)))
                .thenReturn(new GoldPrice[]{});

        assertThatThrownBy(() -> goldPriceService.getLatestAvailableGoldDate())
                .isInstanceOf(NbpUnavailableException.class);
    }
}
