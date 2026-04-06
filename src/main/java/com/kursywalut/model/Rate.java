package com.kursywalut.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rate {
    private String currencyName; // nazwa waluty
    private String code;     // kod waluty (USD, EUR)
    private BigDecimal midRate;  // kurs
    private LocalDate effectiveDate; // data kursu dla historii
}
