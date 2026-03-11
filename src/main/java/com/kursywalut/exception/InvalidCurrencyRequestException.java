package com.kursywalut.exception;

public class InvalidCurrencyRequestException extends RuntimeException {
    public InvalidCurrencyRequestException(String message) {
        super(message);
    }
}

