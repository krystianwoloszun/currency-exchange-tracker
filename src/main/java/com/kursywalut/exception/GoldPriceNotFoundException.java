package com.kursywalut.exception;

public class GoldPriceNotFoundException extends RuntimeException {
    public GoldPriceNotFoundException(String message) {
        super(message);
    }
}
