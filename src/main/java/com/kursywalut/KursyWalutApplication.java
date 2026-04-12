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



//
//package com.kursywalut;
//
//import com.kursywalut.service.NbpService;
//import jakarta.servlet.ServletOutputStream;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//
//import java.math.BigDecimal;
//
//@SpringBootApplication
//
//public class KursyWalutApplication implements CommandLineRunner {
//
//    private final NbpService nbpService;
//
//    public KursyWalutApplication(NbpService nbpService) {
//        this.nbpService = nbpService;
//    }
//
//    public static void main(String[] args) {
//        SpringApplication.run(KursyWalutApplication.class, args);
//    }
//
//    @Override
//    public void run(String... args) throws Exception {
//        System.out.println(nbpService.getNbpResponse("USD"));
//        System.out.println(nbpService.getNbpResponse("EUR"));
//        //System.out.println(nbpService.getNbpResponse("PLN"));
//        BigDecimal a = new BigDecimal(4000);
//        String b = "USD";
//        System.out.println("Przeliczono "+ a + "[" + b + "]" + " na " + nbpService.convertToPLN(a, b) + "[PLN] po kursie: " + nbpService.getRate(b));
//        System.out.println("Przeliczono "+ a + "[PLN]" + " na " + nbpService.convertFromPLN(a, b) + "[" + b + "]" + "po kursie: " + nbpService.getRate(b));
//        System.out.println(nbpService.getAvailableCurrencies());
//    }
//}
