package com.kursywalut.validation;

import java.util.List;

public record PasswordValidationResult(boolean valid, List<String> errors) {
}
