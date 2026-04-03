package com.kursywalut.service;

import com.kursywalut.exception.GoldPriceNotFoundException;
import com.kursywalut.exception.NbpUnavailableException;
import com.kursywalut.model.GoldPrice;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Getter
@Setter
public class GoldPriceService {

    private final RestTemplate restTemplate;

    @Value("${nbp.api.gold.url}")
    private String goldUrl;

    public List<GoldPrice> getCurrentGoldPrice() {
        return fetchGoldPrices(goldUrl + "?format=json");
    }

    public List<GoldPrice> getTodayGoldPrice() {
        return fetchGoldPrices(goldUrl + "/today?format=json");
    }

    public List<GoldPrice> getLatestGoldPrices(int topCount) {
        return fetchGoldPrices(goldUrl + "/last/" + topCount + "?format=json");
    }

    public List<GoldPrice> getGoldPriceByDate(LocalDate date) {
        return fetchGoldPrices(goldUrl + "/" + date + "?format=json");
    }

    public List<GoldPrice> getGoldPriceHistory(LocalDate startDate, LocalDate endDate) {
        return fetchGoldPrices(goldUrl + "/" + startDate + "/" + endDate + "?format=json");
    }

    private List<GoldPrice> fetchGoldPrices(String url) {
        try {
            GoldPrice[] response = restTemplate.getForObject(url, GoldPrice[].class);
            if (response == null || response.length == 0) {
                throw new NbpUnavailableException("NBP is temporarily unavailable");
            }
            return List.of(response);
        } catch (HttpClientErrorException.NotFound e) {
            throw new GoldPriceNotFoundException("Nie znaleziono cen zlota dla podanego zakresu");
        } catch (HttpClientErrorException | HttpServerErrorException | ResourceAccessException e) {
            throw new NbpUnavailableException("NBP is temporarily unavailable");
        }
    }
}
