package com.kursywalut.controller;

import com.kursywalut.model.User;
import com.kursywalut.security.JwtUtil;
import com.kursywalut.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String AUTH_COOKIE_NAME = "authToken";

    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        userService.registerUser(user.getUsername(), user.getPassword());
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user, HttpServletRequest request) {
        boolean valid = userService.authenticate(user.getUsername(), user.getPassword());
        if (valid) {
            String token = jwtUtil.generateToken(user.getUsername());
            ResponseCookie cookie = buildAuthCookie(token, request.isSecure(), jwtUtil.getExpirationMs() / 1000);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body("Login successful");
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        ResponseCookie cookie = buildAuthCookie("", request.isSecure(), 0);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logout successful");
    }

    private ResponseCookie buildAuthCookie(String token, boolean secure, long maxAgeSeconds) {
        return ResponseCookie.from(AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(secure ? "None" : "Lax")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }
}
