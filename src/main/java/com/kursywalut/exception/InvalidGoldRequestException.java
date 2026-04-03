package com.kursywalut.exception;

public class InvalidGoldRequestException extends RuntimeException {
    public InvalidGoldRequestException(String message) {
        super(message);
    }
}
