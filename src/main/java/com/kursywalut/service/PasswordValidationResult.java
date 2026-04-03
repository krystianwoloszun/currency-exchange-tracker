package com.kursywalut.service;

import java.util.List;

public record PasswordValidationResult(boolean valid, List<String> errors) {
}
