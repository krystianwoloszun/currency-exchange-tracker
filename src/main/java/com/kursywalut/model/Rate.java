package com.kursywalut.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class Rate {
    private String currency; // nazwa waluty
    private String code;     // kod waluty (USD, EUR)
    private BigDecimal mid;  // kurs
}
