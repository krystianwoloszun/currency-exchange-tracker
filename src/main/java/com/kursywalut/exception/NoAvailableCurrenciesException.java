package com.kursywalut.exception;

public class NoAvailableCurrenciesException extends RuntimeException {
    public NoAvailableCurrenciesException(String message) {
        super(message);
    }
}

