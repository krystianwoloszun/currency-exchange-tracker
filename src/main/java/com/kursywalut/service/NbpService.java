package com.kursywalut.service;

import com.kursywalut.exception.NbpCodeNotFoundException;
import com.kursywalut.exception.NbpUnavailableException;
import com.kursywalut.model.NbpResponse;
import com.kursywalut.model.NbpTableResponse;
import com.kursywalut.model.Rate;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

// Logika do NBP
@Service
@RequiredArgsConstructor
@Getter
@Setter
public class NbpService {

    private final RestTemplate restTemplate;

    @Value("${nbp.api.rate.url}")
    private String rateUrl;

    @Value("${nbp.api.table.url}")
    private String tableUrl;

    public BigDecimal extractRate(NbpResponse response) {
        return response.getRates().getFirst().getMidRate();
    }

    public NbpResponse getNbpResponse(String code) {
        String url = rateUrl + "/" + code + "?format=json";
        try {
            return restTemplate.getForObject(url, NbpResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new NbpCodeNotFoundException("Nie znaleziono kursu dla kodu: " + code);
        } catch (HttpClientErrorException | HttpServerErrorException | ResourceAccessException e) {
            throw new NbpUnavailableException("NBP is temporarily unavailable");
        }
    }

    public NbpResponse getNbpHistoryResponse(String code, LocalDate startDate, LocalDate endDate) {
        String url = rateUrl + "/" + code + "/" + startDate + "/" + endDate + "?format=json";
        try {
            return restTemplate.getForObject(url, NbpResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new NbpCodeNotFoundException("Nie znaleziono kursu dla kodu: " + code);
        } catch (HttpClientErrorException | HttpServerErrorException | ResourceAccessException e) {
            throw new NbpUnavailableException("NBP is temporarily unavailable");
        }
    }

    public List<Rate> getAvailableCurrencies() {
        String url = tableUrl + "?format=json";

        NbpTableResponse[] response = restTemplate.getForObject(url, NbpTableResponse[].class);

        if (response == null || response.length == 0) {
            throw new RuntimeException("Brak danych z NBP");
        }

        NbpTableResponse table = response[0];
        LocalDate effectiveDate = LocalDate.parse(table.getEffectiveDate().trim());

        return table.getRates().stream()
                .map(rate -> new Rate(rate.getCurrencyName(), rate.getCode(), rate.getMidRate(), effectiveDate))
                .toList();
    }


    public BigDecimal getRate(String currencyCode) {
        return extractRate(getNbpResponse(currencyCode));
    }

    public List<Rate> getRateHistory(String currencyCode, LocalDate startDate, LocalDate endDate) {
        NbpResponse response = getNbpHistoryResponse(currencyCode, startDate, endDate);

        if (response == null || response.getRates() == null || response.getRates().isEmpty()) {
            throw new NbpUnavailableException("NBP is temporarily unavailable");
        }

        return response.getRates().stream()
                .map(rate -> new Rate(response.getCurrency(), response.getCode(), rate.getMidRate(), rate.getEffectiveDate()))
                .toList();
    }

    public BigDecimal convertToPLN(BigDecimal amount, String currencyCode) {
        return amount.multiply(getRate(currencyCode));
    }

    public BigDecimal convertFromPLN(BigDecimal amount, String currencyCode) {
        return amount.divide(getRate(currencyCode), 2, RoundingMode.HALF_UP);
    }
}
