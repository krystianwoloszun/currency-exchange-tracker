package com.kursywalut.unit;

import com.kursywalut.validation.PasswordPolicyValidator;
import com.kursywalut.validation.PasswordValidationResult;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordPolicyValidatorTest {

    private final PasswordPolicyValidator validator = new PasswordPolicyValidator();

    @Test
    void acceptsPasswordMeetingAllRules() {
        PasswordValidationResult result = validator.validate("Secret123!");

        assertThat(result.valid()).isTrue();
        assertThat(result.errors()).isEmpty();
    }

    @Test
    void rejectsTooShortPassword() {
        PasswordValidationResult result = validator.validate("Ab1!");

        assertThat(result.valid()).isFalse();
        assertThat(result.errors()).contains("minimum 8 znaków");
    }

    @Test
    void rejectsPasswordWithoutUppercase() {
        PasswordValidationResult result = validator.validate("secret123!");

        assertThat(result.valid()).isFalse();
        assertThat(result.errors()).contains("przynajmniej 1 wielka litera");
    }

    @Test
    void rejectsPasswordWithoutLowercase() {
        PasswordValidationResult result = validator.validate("SECRET123!");

        assertThat(result.valid()).isFalse();
        assertThat(result.errors()).contains("przynajmniej 1 mała litera");
    }

    @Test
    void rejectsPasswordWithoutDigit() {
        PasswordValidationResult result = validator.validate("Secret!!!");

        assertThat(result.valid()).isFalse();
        assertThat(result.errors()).contains("przynajmniej 1 cyfra");
    }

    @Test
    void rejectsPasswordWithoutSpecialCharacter() {
        PasswordValidationResult result = validator.validate("Secret123");

        assertThat(result.valid()).isFalse();
        assertThat(result.errors()).contains("przynajmniej 1 znak specjalny");
    }

    @Test
    void reportsEveryFailedRuleForEmptyPassword() {
        PasswordValidationResult result = validator.validate("");

        assertThat(result.valid()).isFalse();
        assertThat(result.errors()).containsExactlyInAnyOrder(
                "minimum 8 znaków",
                "przynajmniej 1 wielka litera",
                "przynajmniej 1 mała litera",
                "przynajmniej 1 cyfra",
                "przynajmniej 1 znak specjalny");
    }

    @Test
    void treatsNullPasswordAsInvalid() {
        PasswordValidationResult result = validator.validate(null);

        assertThat(result.valid()).isFalse();
        assertThat(result.errors()).isNotEmpty();
    }
}
