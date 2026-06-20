package com.kursywalut.unit;

import com.kursywalut.exception.InvalidPasswordException;
import com.kursywalut.exception.UsernameAlreadyExistsException;
import com.kursywalut.model.User;
import com.kursywalut.repository.UserRepository;
import com.kursywalut.validation.PasswordPolicyValidator;
import com.kursywalut.validation.PasswordValidationResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordPolicyValidator passwordPolicyValidator;

    @InjectMocks
    private com.kursywalut.service.UserService userService;

    @Test
    void registersUserWithNormalizedUsernameAndEncodedPassword() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.empty());
        when(passwordPolicyValidator.validate(anyString()))
                .thenReturn(new PasswordValidationResult(true, List.of()));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.registerUser("Alice", "Secret123!");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getUsername()).isEqualTo("alice");
        assertThat(saved.getPassword()).isNotEqualTo("Secret123!");
        assertThat(encoder.matches("Secret123!", saved.getPassword())).isTrue();
    }

    @Test
    void rejectsDuplicateUsername() {
        when(userRepository.findByUsername("alice"))
                .thenReturn(Optional.of(User.builder().username("alice").password("x").build()));

        assertThatThrownBy(() -> userService.registerUser("Alice", "Secret123!"))
                .isInstanceOf(UsernameAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsPasswordFailingPolicy() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.empty());
        when(passwordPolicyValidator.validate(anyString()))
                .thenReturn(new PasswordValidationResult(false, List.of("przynajmniej 1 cyfra")));

        assertThatThrownBy(() -> userService.registerUser("Alice", "weakpass"))
                .isInstanceOf(InvalidPasswordException.class)
                .hasMessageContaining("przynajmniej 1 cyfra");

        verify(userRepository, never()).save(any());
    }

    @Test
    void authenticateReturnsTrueForMatchingPassword() {
        User stored = User.builder().username("alice").password(encoder.encode("Secret123!")).build();
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(stored));

        assertThat(userService.authenticate("Alice", "Secret123!")).isTrue();
    }

    @Test
    void authenticateReturnsFalseForWrongPassword() {
        User stored = User.builder().username("alice").password(encoder.encode("Secret123!")).build();
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(stored));

        assertThat(userService.authenticate("alice", "wrong")).isFalse();
    }

    @Test
    void authenticateReturnsFalseForUnknownUser() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThat(userService.authenticate("ghost", "Secret123!")).isFalse();
    }

    @Test
    void loadUserByUsernameReturnsUserDetailsWithRole() {
        User stored = User.builder().username("alice").password("encoded").build();
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(stored));

        UserDetails details = userService.loadUserByUsername("Alice");

        assertThat(details.getUsername()).isEqualTo("alice");
        assertThat(details.getPassword()).isEqualTo("encoded");
        assertThat(details.getAuthorities()).extracting("authority").containsExactly("ROLE_USER");
    }

    @Test
    void loadUserByUsernameThrowsWhenMissing() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.loadUserByUsername("ghost"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
