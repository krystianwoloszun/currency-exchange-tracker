package com.kursywalut.validation;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class PasswordPolicyValidator {

    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("\\d");
    private static final Pattern SPECIAL_CHARACTER_PATTERN = Pattern.compile("[^A-Za-z0-9]");

    public PasswordValidationResult validate(String password) {
        List<String> errors = new ArrayList<>();
        String value = password == null ? "" : password;

        if (value.length() < 8) {
            errors.add("minimum 8 znaków");
        }
        if (!UPPERCASE_PATTERN.matcher(value).find()) {
            errors.add("przynajmniej 1 wielka litera");
        }
        if (!LOWERCASE_PATTERN.matcher(value).find()) {
            errors.add("przynajmniej 1 mała litera");
        }
        if (!DIGIT_PATTERN.matcher(value).find()) {
            errors.add("przynajmniej 1 cyfra");
        }
        if (!SPECIAL_CHARACTER_PATTERN.matcher(value).find()) {
            errors.add("przynajmniej 1 znak specjalny");
        }

        return new PasswordValidationResult(errors.isEmpty(), errors);
    }
}
