package com.example.atomy_india.config;

import com.example.atomy_india.model.CustomerUser;
import com.example.atomy_india.repository.CustomerUserRepository;
import com.example.atomy_india.repository.MembershipRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CustomerUserRepository customerUserRepository;
    private final MembershipRepository membershipRepository;

    public DataInitializer(CustomerUserRepository customerUserRepository,
                           MembershipRepository membershipRepository) {
        this.customerUserRepository = customerUserRepository;
        this.membershipRepository = membershipRepository;
    }

    @Override
    public void run(String... args) {
        // Ensure customer naveen.mj2.45@gmail.com is present with password Naveen@123
        CustomerUser naveen = customerUserRepository.findByCustomerId("CUST-20261009-1001")
                .or(() -> customerUserRepository.findByEmail("naveen.mj2.45@gmail.com"))
                .or(() -> customerUserRepository.findByEmail("naveen@gmail.com"))
                .orElseGet(() -> {
                    CustomerUser u = new CustomerUser();
                    u.setCustomerId("CUST-20261009-1001");
                    u.setCreatedAt(LocalDateTime.now());
                    u.setRole("CUSTOMER");
                    u.setIsMember(false);
                    u.setRegistrationSource("EMAIL_SIGNUP");
                    return u;
                });

        naveen.setEmail("naveen.mj2.45@gmail.com");
        naveen.setPassword("Naveen@123");
        naveen.setFullName("Naveen");
        naveen.setUsername("naveen");
        if (naveen.getPhone() == null || naveen.getPhone().isEmpty()) {
            naveen.setPhone("+91 9876543210");
        }
        customerUserRepository.save(naveen);

        // Sync any customer who has an ACTIVE membership in the database (e.g. Rithan)
        customerUserRepository.findAll().forEach(cust -> {
            if (cust.getEmail() != null) {
                boolean activeMem = membershipRepository
                        .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(cust.getEmail().trim().toLowerCase(), "ACTIVE")
                        .isPresent();
                if (activeMem && (cust.getIsMember() == null || !cust.getIsMember())) {
                    cust.setIsMember(true);
                    customerUserRepository.save(cust);
                }
            }
        });
    }
}
