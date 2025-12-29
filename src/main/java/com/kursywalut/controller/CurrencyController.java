package com.kursywalut.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.kursywalut.service.NbpService;

import java.math.BigDecimal;

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

    @GetMapping("/converttopln")
    public BigDecimal convertToPLN(@RequestParam BigDecimal amount, @RequestParam String code) {
        return nbpService.convertToPLN(amount, code.toUpperCase());
    }
    @GetMapping("/convertfrompln")
    public BigDecimal convertFomPLN(@RequestParam BigDecimal amount, @RequestParam String code) {
        return nbpService.convertFromPLN(amount, code.toUpperCase());
    }
}
