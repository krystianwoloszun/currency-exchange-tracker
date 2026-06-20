package com.kursywalut.integration;

import com.kursywalut.model.User;
import com.kursywalut.repository.UserRepository;
import com.kursywalut.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Base class for full-stack integration tests.
 *
 * <p>Boots the whole Spring context with an in-memory H2 database and a MockMvc client,
 * so routing, request binding, Spring Security (the real {@code JwtFilter}), the
 * {@code RestExceptionHandler} and JSON (de)serialization are all exercised end to end.
 * The outbound NBP calls are stubbed per test by mocking {@code NbpService} /
 * {@code GoldPriceService} with {@code @MockBean}; their HTTP/JSON-parsing logic is
 * covered separately by the service unit tests.</p>
 *
 * <p>Each test starts with a clean {@code users} table containing a single
 * {@link #AUTH_USERNAME} user; {@link #authCookie} carries a valid JWT for it so the
 * secured endpoints can be reached.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
abstract class AbstractIntegrationTest {

    protected static final String AUTH_USERNAME = "ituser";
    protected static final String AUTH_PASSWORD = "Secret123!";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected JwtUtil jwtUtil;

    protected Cookie authCookie;

    @BeforeEach
    void seedAuthenticatedUser() {
        userRepository.deleteAll();
        userRepository.save(User.builder()
                .username(AUTH_USERNAME)
                .password(new BCryptPasswordEncoder().encode(AUTH_PASSWORD))
                .build());
        authCookie = new Cookie("authToken", jwtUtil.generateToken(AUTH_USERNAME));
    }
}
