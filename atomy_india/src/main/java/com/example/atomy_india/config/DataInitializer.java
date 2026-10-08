package com.example.atomy_india.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // No demo data is seeded. Database starts completely clean.
    }
}
