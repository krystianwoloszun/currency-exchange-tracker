package com.kursywalut.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.kursywalut.service.NbpService;

import java.math.BigDecimal;

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
    public BigDecimal convert(
            @RequestParam BigDecimal amount,
            @RequestParam String code
    ) {
        return nbpService.convert(amount, code.toUpperCase());
    }
}
