package com.kursywalut;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class KursyWalutApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().directory(".").ignoreIfMissing().load();
        Map<String, Object> defaults = new HashMap<>();
        dotenv.entries().forEach((e) -> defaults.put(e.getKey(), e.getValue()));

        SpringApplication app = new SpringApplication(KursyWalutApplication.class);
        app.setDefaultProperties(defaults);
        app.run(args);
    }
}
