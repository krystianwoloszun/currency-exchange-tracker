package com.kursywalut.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class Rate {
    private String effectiveDate;
    private BigDecimal mid;
}
