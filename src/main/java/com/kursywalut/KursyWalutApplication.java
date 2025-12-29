package com.kursywalut;

import com.kursywalut.service.NbpService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication

public class KursyWalutApplication implements CommandLineRunner {

    private final NbpService nbpService;

    public KursyWalutApplication(NbpService nbpService) {
        this.nbpService = nbpService;
    }

    public static void main(String[] args) {
        SpringApplication.run(KursyWalutApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println(nbpService.getNbpResponse("EUR"));
    }
}
