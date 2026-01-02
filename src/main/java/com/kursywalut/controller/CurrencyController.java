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
        if (code == null || code.isBlank() || code.length() != 3) {
            throw new IllegalArgumentException("Kod waluty musi mieć 3 znaki i nie może być pusty");
        }

        return nbpService.getRate(code.toUpperCase());
    }


    @GetMapping("/conversion")
    public BigDecimal convert(@RequestParam BigDecimal amount, @RequestParam String code, @RequestParam ConversionDirection direction) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Kwota musi być większa od zera");
        }

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Kod waluty nie może być pusty");
        }

        code = code.toUpperCase();

        switch (direction) {
            case TO_PLN -> {
                return nbpService.convertToPLN(amount, code);
            }
            case FROM_PLN -> {
                return nbpService.convertFromPLN(amount, code);
            }
            default -> throw new IllegalArgumentException("Niepoprawny kierunek konwersji");
        }
    }

    @GetMapping("/available")
    public List<Rate> availableCurrencies() {
        List<Rate> rates = nbpService.getAvailableCurrencies();
        if (rates.isEmpty()) {
            throw new RuntimeException("Brak dostępnych kursów walut z NBP");
        }
        return rates;
    }


}
