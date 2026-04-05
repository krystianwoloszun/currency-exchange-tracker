package com.kursywalut.controller;

import com.kursywalut.exception.InvalidGoldRequestException;
import com.kursywalut.model.GoldPrice;
import com.kursywalut.service.GoldPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/gold")
@RequiredArgsConstructor
public class GoldPriceController {

    private static final LocalDate GOLD_HISTORY_MIN_DATE = LocalDate.of(2013, 1, 2); //dane z nbp sa dostepne od 02.01.2013
    private static final long GOLD_HISTORY_MAX_DAYS = 93;
    private static final int GOLD_MAX_TOP_COUNT = 93;

    private final GoldPriceService goldPriceService;

    @GetMapping
    public List<GoldPrice> getCurrentGoldPrice() {
        return goldPriceService.getCurrentGoldPrice();
    }

    @GetMapping("/today")
    public List<GoldPrice> getTodayGoldPrice() {
        return goldPriceService.getTodayGoldPrice();
    }

    @GetMapping("/latest")
    public List<GoldPrice> getLatestGoldPrices(@RequestParam(defaultValue = "30") int topCount) {
        if (topCount <= 0) {
            throw new InvalidGoldRequestException("Liczba notowan musi byc wieksza od zera");
        }
        if (topCount > GOLD_MAX_TOP_COUNT) {
            throw new InvalidGoldRequestException("Liczba notowan dla zlota nie moze przekraczac 93");
        }

        return goldPriceService.getLatestGoldPrices(topCount);
    }

    @GetMapping("/{date:\\d{4}-\\d{2}-\\d{2}}")
    public List<GoldPrice> getGoldPriceByDate(@PathVariable LocalDate date) {
        validateDate(date);
        return goldPriceService.getGoldPriceByDate(date);
    }

    @GetMapping("/history")
    public List<GoldPrice> getGoldPriceHistory(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new InvalidGoldRequestException("Data poczatkowa nie moze byc pozniejsza niz data koncowa");
        }

        validateDate(startDate);
        validateDate(endDate);

        long requestedDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (requestedDays > GOLD_HISTORY_MAX_DAYS) {
            throw new InvalidGoldRequestException("Zakres dat dla cen zlota nie moze przekraczac 93 dni");
        }

        return goldPriceService.getGoldPriceHistory(startDate, endDate);
    }

    private void validateDate(LocalDate date) {
        if (date.isBefore(GOLD_HISTORY_MIN_DATE)) {
            throw new InvalidGoldRequestException("Historia cen zlota jest dostepna od 2013-01-02");
        }
    }
}
