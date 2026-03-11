package com.kursywalut.controller;

import com.kursywalut.exception.InvalidCurrencyRequestException;
import com.kursywalut.exception.NoAvailableCurrenciesException;
import com.kursywalut.model.ConversionDirection;
import com.kursywalut.model.Rate;
import com.kursywalut.service.NbpService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/currency")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CurrencyController {

    private final NbpService nbpService;

    @GetMapping("/{code:[A-Z]{3}}")
    public BigDecimal getRate(@PathVariable String code) {
        if (code == null || code.isBlank() || code.length() != 3) {
            throw new InvalidCurrencyRequestException("Kod waluty musi miec 3 znaki i nie moze byc pusty");
        }

        return nbpService.getRate(code.toUpperCase());
    }

    @GetMapping("/conversion")
    public BigDecimal convert(@RequestParam BigDecimal amount, @RequestParam String code, @RequestParam ConversionDirection direction) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidCurrencyRequestException("Kwota musi byc wieksza od zera");
        }

        if (code == null || code.isBlank()) {
            throw new InvalidCurrencyRequestException("Kod waluty nie moze byc pusty");
        }

        code = code.toUpperCase();

        return switch (direction) {
            case TO_PLN -> nbpService.convertToPLN(amount, code);
            case FROM_PLN -> nbpService.convertFromPLN(amount, code);
        };
    }

    @GetMapping("/available")
    public List<Rate> availableCurrencies() {
        List<Rate> rates = nbpService.getAvailableCurrencies();
        if (rates.isEmpty()) {
            throw new NoAvailableCurrenciesException("Brak dostepnych kursow walut z NBP");
        }
        return rates;
    }
}

