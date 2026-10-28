package com.example.atomy_india;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AtomyIndiaApplication {

	public static void main(String[] args) {
		SpringApplication.run(AtomyIndiaApplication.class, args);
	}

}
