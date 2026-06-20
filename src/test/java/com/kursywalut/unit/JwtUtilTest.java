package com.kursywalut.unit;

import com.kursywalut.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private static final String SECRET = "rFFb/g29fiUt+qaQ2NVG8h37mOm8HnZ8KoZrBio8Hq8=";

    private JwtUtil jwtUtil;

    @BeforeEach
    void setup() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", SECRET);
    }

    @Test
    void generatesTokenFromWhichUsernameCanBeExtracted() {
        String token = jwtUtil.generateToken("alice");

        assertThat(jwtUtil.extractUsername(token)).isEqualTo("alice");
    }

    @Test
    void validatesFreshlyGeneratedToken() {
        String token = jwtUtil.generateToken("alice");

        assertThat(jwtUtil.validateToken(token)).isTrue();
    }

    @Test
    void rejectsMalformedToken() {
        assertThat(jwtUtil.validateToken("not-a-jwt")).isFalse();
    }

    @Test
    void rejectsTokenSignedWithDifferentKey() {
        Key otherKey = Keys.hmacShaKeyFor(
                Base64.getDecoder().decode("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="));
        String foreignToken = Jwts.builder()
                .setSubject("alice")
                .setExpiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(otherKey)
                .compact();

        assertThat(jwtUtil.validateToken(foreignToken)).isFalse();
    }

    @Test
    void rejectsExpiredToken() {
        Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET));
        String expired = Jwts.builder()
                .setSubject("alice")
                .setIssuedAt(new Date(System.currentTimeMillis() - 7_200_000))
                .setExpiration(new Date(System.currentTimeMillis() - 3_600_000))
                .signWith(key)
                .compact();

        assertThat(jwtUtil.validateToken(expired)).isFalse();
    }

    @Test
    void exposesOneHourExpiration() {
        assertThat(jwtUtil.getExpirationMs()).isEqualTo(1000L * 60 * 60);
    }
}
