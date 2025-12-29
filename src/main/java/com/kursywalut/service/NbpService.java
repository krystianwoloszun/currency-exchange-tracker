package com.kursywalut.service;

import com.kursywalut.exception.NbpCodeNotFoundException;
import com.kursywalut.model.NbpResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;

/* Logika do NBP */
@Service
@RequiredArgsConstructor
public class NbpService {

    private final RestTemplate restTemplate;
    //Z application.properties
    @Value("${nbp.api.url}")
    private String nbpUrl;

    // Wyciąga kurs z obiektu NbpResponse
    public BigDecimal extractRate(NbpResponse response) {
        return response.getRates().getFirst().getMid();
    }

    // Pobiera cały JSON z NBP dla danej waluty
    public NbpResponse getNbpResponse(String code) {
        String url = nbpUrl + "/" + code + "/?format=json";
        try {
            return restTemplate.getForObject(url, NbpResponse.class);
        } catch (HttpClientErrorException e) {
            throw new NbpCodeNotFoundException("Nie znaleziono kursu dla tego kodu: " + code);
        }
    }


    // pobiera kurs
    public BigDecimal getRate(String currencyCode) {
        NbpResponse response = getNbpResponse(currencyCode);
        return extractRate(response);
    }

    //Przelicza z innej waluty na PLN
    public BigDecimal convertToPLN(BigDecimal amount, String currencyCode) {
        return amount.multiply(getRate(currencyCode));
    }

    //Przelicza z PLN na inna walute
    public BigDecimal convertFromPLN(BigDecimal amount, String currencyCode) {
        BigDecimal div = getRate(currencyCode);
        return amount.divide(div, 2, RoundingMode.HALF_UP);
    }

}
