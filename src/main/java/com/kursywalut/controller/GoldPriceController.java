package com.kursywalut.controller;

import com.kursywalut.exception.InvalidGoldRequestException;
import com.kursywalut.model.GoldPrice;
import com.kursywalut.service.GoldPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.nbp.gold.history.min-date}")
    private String goldHistoryMinDateStr;

    @Value("${app.nbp.gold.history.max-days}")
    private long goldHistoryMaxDays;

    @Value("${app.nbp.gold.max-top-count}")
    private int goldMaxTopCount;

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
        if (topCount > goldMaxTopCount) {
            throw new InvalidGoldRequestException("Liczba notowan dla zlota nie moze przekraczac " + goldMaxTopCount);
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
        if (requestedDays > goldHistoryMaxDays) {
            throw new InvalidGoldRequestException("Zakres dat dla cen zlota nie moze przekraczac " + goldHistoryMaxDays + " dni");
        }

        return goldPriceService.getGoldPriceHistory(startDate, endDate);
    }

    private void validateDate(LocalDate date) {
        LocalDate minDate = LocalDate.parse(goldHistoryMinDateStr);
        if (date.isBefore(minDate)) {
            throw new InvalidGoldRequestException("Historia cen zlota jest dostepna od " + minDate);
        }
    }
}
