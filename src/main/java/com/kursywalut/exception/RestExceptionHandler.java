package com.kursywalut.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class RestExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);

    private ApiErrorResponse body(HttpStatus status, String code, String message, HttpServletRequest request) {
        return new ApiErrorResponse(
                Instant.now(),
                status.value(),
                code,
                message,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleUsernameAlreadyExists(UsernameAlreadyExistsException ex, HttpServletRequest request) {
        log.warn("Username already exists: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body(HttpStatus.CONFLICT, "USERNAME_EXISTS", ex.getMessage(), request));
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidPassword(InvalidPasswordException ex, HttpServletRequest request) {
        log.warn("Invalid password: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body(HttpStatus.BAD_REQUEST, "INVALID_PASSWORD", ex.getMessage(), request));
    }

    @ExceptionHandler(NbpCodeNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNbpCodeNotFound(NbpCodeNotFoundException ex, HttpServletRequest request) {
        log.warn("NBP code not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body(HttpStatus.NOT_FOUND, "NBP_CODE_NOT_FOUND", ex.getMessage(), request));
    }

    @ExceptionHandler(GoldPriceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleGoldPriceNotFound(GoldPriceNotFoundException ex, HttpServletRequest request) {
        log.warn("Gold price not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body(HttpStatus.NOT_FOUND, "GOLD_PRICE_NOT_FOUND", ex.getMessage(), request));
    }

    @ExceptionHandler(NbpUnavailableException.class)
    public ResponseEntity<ApiErrorResponse> handleNbpUnavailable(NbpUnavailableException ex, HttpServletRequest request) {
        log.warn("NBP unavailable: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body(HttpStatus.SERVICE_UNAVAILABLE, "NBP_UNAVAILABLE", ex.getMessage(), request));
    }

    @ExceptionHandler(InvalidCurrencyRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCurrencyRequest(InvalidCurrencyRequestException ex, HttpServletRequest request) {
        log.warn("Invalid currency request: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body(HttpStatus.BAD_REQUEST, "INVALID_CURRENCY_REQUEST", ex.getMessage(), request));
    }

    @ExceptionHandler(InvalidGoldRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidGoldRequest(InvalidGoldRequestException ex, HttpServletRequest request) {
        log.warn("Invalid gold request: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body(HttpStatus.BAD_REQUEST, "INVALID_GOLD_REQUEST", ex.getMessage(), request));
    }

    @ExceptionHandler(NoAvailableCurrenciesException.class)
    public ResponseEntity<ApiErrorResponse> handleNoAvailableCurrencies(NoAvailableCurrenciesException ex, HttpServletRequest request) {
        log.warn("No available currencies: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body(HttpStatus.SERVICE_UNAVAILABLE, "NO_AVAILABLE_CURRENCIES", ex.getMessage(), request));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unhandled error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Internal server error", request));
    }
}
