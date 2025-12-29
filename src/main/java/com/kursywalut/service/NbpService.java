package com.kursywalut.service;

import com.kursywalut.model.NbpResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class NbpService {

    private final RestTemplate restTemplate;

    @Value("${nbp.api.url}")
    private String nbpUrl;

    public BigDecimal getRate(String currencyCode) {
        NbpResponse response = getNbpResponse(currencyCode);
        return extractRate(response);
    }

    public BigDecimal extractRate(NbpResponse response) {
        return response.getRates().get(0).getMid();
    }

    public NbpResponse getNbpResponse(String code) {
        String url = nbpUrl + "/" + code + "/?format=json";
        return restTemplate.getForObject(url, NbpResponse.class);
    }

    public BigDecimal convert(BigDecimal amount, String currencyCode) {
        return amount.multiply(getRate(currencyCode));
    }
}
