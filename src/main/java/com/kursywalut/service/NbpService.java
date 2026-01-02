package com.kursywalut.service;

import com.kursywalut.exception.NbpCodeNotFoundException;
import com.kursywalut.model.NbpResponse;
import com.kursywalut.model.NbpTableResponse;
import com.kursywalut.model.Rate;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/* Logika do NBP */
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

    // Wyciąga kurs z obiektu NbpResponse
    public BigDecimal extractRate(NbpResponse response) {
        return response.getRates().getFirst().getMid();
    }

    // Pobiera cały JSON z NBP dla jednej waluty
    public NbpResponse getNbpResponse(String code) {
        String url = rateUrl + "/" + code + "?format=json";
        try {
            return restTemplate.getForObject(url, NbpResponse.class);
        } catch (HttpClientErrorException e) {
            throw new NbpCodeNotFoundException("Nie znaleziono kursu dla kodu: " + code);
        }
    }

    // Lista walut
    public List<Rate> getAvailableCurrencies() {
        String url = tableUrl + "?format=json";

        NbpTableResponse[] response = restTemplate.getForObject(url, NbpTableResponse[].class);

        if (response == null || response.length == 0) {
            throw new RuntimeException("Brak danych z NBP");
        }

        return response[0].getRates();
    }


    // Kurs jednej waluty
    public BigDecimal getRate(String currencyCode) {
        return extractRate(getNbpResponse(currencyCode));
    }

    // Waluta → PLN
    public BigDecimal convertToPLN(BigDecimal amount, String currencyCode) {
        return amount.multiply(getRate(currencyCode));
    }

    // PLN → Waluta
    public BigDecimal convertFromPLN(BigDecimal amount, String currencyCode) {
        return amount.divide(getRate(currencyCode), 2, RoundingMode.HALF_UP);
    }
}
