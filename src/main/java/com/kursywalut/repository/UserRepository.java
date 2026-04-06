package com.kursywalut.repository;

import com.kursywalut.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
//Potrzebne do Spring Security
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
