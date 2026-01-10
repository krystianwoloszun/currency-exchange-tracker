//package com.kursywalut.integration;
//////////poprawic
//import com.kursywalut.model.Rate;
//import org.junit.jupiter.api.Test;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.web.client.TestRestTemplate;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//
//import java.math.BigDecimal;
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
//public class CurrencyIntegrationTest {
//
//    @Autowired
//    private TestRestTemplate restTemplate;
//
//    @Test
//    void testAvailableCurrenciesEndpoint() {
//        ResponseEntity<Rate[]> response = restTemplate.getForEntity("/api/currency/available", Rate[].class);
//
//        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
//        Rate[] rates = response.getBody();
//        assertThat(rates).isNotNull();
//        assertThat(rates.length).isGreaterThan(0);
//
//        // Sprawdzenie przykładowej waluty
//        Rate firstRate = rates[0];
//        assertThat(firstRate.getCode()).isNotEmpty();
//        assertThat(firstRate.getMid()).isGreaterThan(BigDecimal.ZERO);
//        assertThat(firstRate.getCurrency()).isNotEmpty();
//    }
//}
