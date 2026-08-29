package com.clarity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // enables @Scheduled for email reminders
public class ClarityApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClarityApplication.class, args);
    }
}
