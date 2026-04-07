package com.kursywalut.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rate {
    @JsonProperty("currency")
    private String currencyName; // nazwa waluty
    private String code;     // kod waluty (USD, EUR)
    @JsonProperty("mid")
    private BigDecimal midRate;  // kurs
    private LocalDate effectiveDate; // data kursu dla historii
}
