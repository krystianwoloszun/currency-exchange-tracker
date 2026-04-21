package com.kursywalut.controller;

import com.kursywalut.exception.InvalidCurrencyRequestException;
import com.kursywalut.exception.NoAvailableCurrenciesException;
import com.kursywalut.model.ConversionDirection;
import com.kursywalut.model.Rate;
import com.kursywalut.service.NbpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/currency")
@RequiredArgsConstructor
public class CurrencyController {

    @Value("${app.nbp.currency.history.min-date}")
    private String currencyHistoryMinDateStr;

    @Value("${app.nbp.currency.history.max-days}")
    private long currencyHistoryMaxDays;

    private static final BigDecimal MAX_AMOUNT = new BigDecimal("100000000");

    private final NbpService nbpService;

    @GetMapping("/{code:[A-Z]{3}}")
    public BigDecimal getRate(@PathVariable String code) {
        if (code == null || code.isBlank() || code.length() != 3) {
            throw new InvalidCurrencyRequestException("Kod waluty musi miec 3 znaki i nie moze byc pusty");
        }

        return nbpService.getRate(code.toUpperCase());
    }

    @GetMapping("/{code:[A-Z]{3}}/history")
    public List<Rate> getRateHistory(@PathVariable String code, @RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        if (code == null || code.isBlank() || code.length() != 3) {
            throw new InvalidCurrencyRequestException("Kod waluty musi miec 3 znaki i nie moze byc pusty");
        }

        if (startDate.isAfter(endDate)) {
            throw new InvalidCurrencyRequestException("Data poczatkowa nie moze byc pozniejsza niz data koncowa");
        }

        LocalDate minDate = LocalDate.parse(currencyHistoryMinDateStr);
        if (startDate.isBefore(minDate) || endDate.isBefore(minDate)) {
            throw new InvalidCurrencyRequestException("Historia kursow walut jest dostepna od " + minDate);
        }

        long requestedDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (requestedDays > currencyHistoryMaxDays) {
            throw new InvalidCurrencyRequestException("Zakres dat dla historii kursow nie moze przekraczac " + currencyHistoryMaxDays + " dni");
        }

        return nbpService.getRateHistory(code.toUpperCase(), startDate, endDate);
    }

    @GetMapping("/conversion")
    public BigDecimal convert(@RequestParam BigDecimal amount, @RequestParam String code, @RequestParam ConversionDirection direction) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidCurrencyRequestException("Kwota musi byc wieksza od zera");
        }

        if (amount.compareTo(MAX_AMOUNT) > 0) {
            throw new InvalidCurrencyRequestException("Kwota nie może przekraczać 100 000 000.");
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
