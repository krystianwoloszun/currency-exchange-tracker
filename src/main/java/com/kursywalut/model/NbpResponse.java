package com.kursywalut.model;

import lombok.Data;
import java.util.List;

@Data
public class NbpResponse {
    private String currency; //nazwa
    private String code; //np. USD, EUR
    private List<Rate> rates;
}
