package com.kursywalut.service;

import com.kursywalut.model.User;
import com.kursywalut.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    //Rejestracja
    public User registerUser(String username, String password) {
        String encodedPassword = passwordEncoder.encode(password);
        User user = User.builder().username(username).password(encodedPassword).build();
        return userRepository.save(user);
    }
    //Uwierzytelnianie
    public boolean authenticate(String username, String password) {
        return userRepository.findByUsername(username).map(user -> passwordEncoder.matches(password, user.getPassword())).orElse(false);
    }
}
