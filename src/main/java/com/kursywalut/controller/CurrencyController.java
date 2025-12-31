package com.kursywalut.controller;

import com.kursywalut.model.ConversionDirection;
import com.kursywalut.model.Rate;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.kursywalut.service.NbpService;

import java.math.BigDecimal;
import java.util.List;

/* Obsługa HTTP */
@RestController
@RequestMapping("/api/currency")
@RequiredArgsConstructor
public class CurrencyController {

    private final NbpService nbpService;

    @GetMapping("/{code}")
    public BigDecimal getRate(@PathVariable String code) {
        return nbpService.getRate(code.toUpperCase());
    }

    @GetMapping("/convert")
    public BigDecimal convert(@RequestParam BigDecimal amount, @RequestParam String code, @RequestParam ConversionDirection direction) {
        return direction == ConversionDirection.TO_PLN ? nbpService.convertToPLN(amount, code) : nbpService.convertFromPLN(amount, code);
    }

    @GetMapping("/available")
    public List<Rate> availableCurrencies() {
        return nbpService.getAvailableCurrencies();
    }


}
