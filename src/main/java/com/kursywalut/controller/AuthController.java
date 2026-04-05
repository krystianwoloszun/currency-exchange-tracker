package com.kursywalut.controller;

import com.kursywalut.model.User;
import com.kursywalut.security.JwtUtil;
import com.kursywalut.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
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
    public ResponseEntity<String> login(@RequestBody User user) {
        boolean valid = userService.authenticate(user.getUsername(), user.getPassword());
        if (valid) {
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }
}
