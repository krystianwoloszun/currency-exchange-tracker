package com.kursywalut.service;

import com.kursywalut.model.User;

import com.kursywalut.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserService implements UserDetailsService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    @Autowired
    private UserRepository userRepository;

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


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
    }
}
