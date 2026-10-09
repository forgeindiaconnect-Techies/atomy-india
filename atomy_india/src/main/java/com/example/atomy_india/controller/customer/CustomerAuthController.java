package com.example.atomy_india.controller.customer;

import com.example.atomy_india.dto.CustomerLoginRequest;
import com.example.atomy_india.dto.CustomerRegisterRequest;
import com.example.atomy_india.model.CustomerUser;
import com.example.atomy_india.repository.CustomerUserRepository;
import com.example.atomy_india.repository.MembershipRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class CustomerAuthController {

    private final CustomerUserRepository customerUserRepository;
    private final MembershipRepository membershipRepository;

    public CustomerAuthController(CustomerUserRepository customerUserRepository,
                                  MembershipRepository membershipRepository) {
        this.customerUserRepository = customerUserRepository;
        this.membershipRepository = membershipRepository;
    }

    /**
     * POST /api/auth/register
     * Register a new customer and store basic details directly into MySQL database
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody CustomerRegisterRequest req) {
        Map<String, Object> resp = new HashMap<>();

        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            resp.put("success", false);
            resp.put("message", "Email address is required");
            return ResponseEntity.badRequest().body(resp);
        }

        String email = req.getEmail().trim().toLowerCase();
        if (customerUserRepository.existsByEmail(email)) {
            // Already registered
            CustomerUser existing = customerUserRepository.findByEmail(email).orElse(null);
            resp.put("success", false);
            resp.put("message", "An account with this email address already exists. Please sign in.");
            resp.put("customer", existing);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(resp);
        }

        String username = req.getUsername() != null && !req.getUsername().trim().isEmpty()
                ? req.getUsername().trim()
                : email.split("@")[0];

        // Generate clean Customer ID: CUST-YYYYMMDD-XXXX
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randPart = String.format("%04d", new Random().nextInt(10000));
        String customerId = "CUST-" + datePart + "-" + randPart;

        CustomerUser customer = new CustomerUser();
        customer.setCustomerId(customerId);
        customer.setFullName(req.getFullName() != null && !req.getFullName().trim().isEmpty() ? req.getFullName().trim() : username);
        customer.setUsername(username);
        customer.setEmail(email);
        customer.setPhone(req.getPhone() != null ? req.getPhone().trim() : "");
        customer.setPassword(req.getPassword() != null ? req.getPassword() : "");
        customer.setAddress(req.getAddress() != null ? req.getAddress().trim() : "");
        customer.setCity(req.getCity() != null ? req.getCity().trim() : "");
        customer.setState(req.getState() != null ? req.getState().trim() : "");
        customer.setPincode(req.getPincode() != null ? req.getPincode().trim() : "");
        customer.setRole("CUSTOMER");
        customer.setIsMember(false);
        customer.setRegistrationSource(req.getSource() != null ? req.getSource() : "EMAIL_SIGNUP");
        customer.setCreatedAt(LocalDateTime.now());
        customer.setLastLoginAt(LocalDateTime.now());

        CustomerUser saved = customerUserRepository.save(customer);

        resp.put("success", true);
        resp.put("message", "Customer account registered successfully!");
        resp.put("customer", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /**
     * POST /api/auth/login
     * Authenticate an existing customer
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@RequestBody CustomerLoginRequest req) {
        Map<String, Object> resp = new HashMap<>();

        if (req.getUsernameOrEmail() == null || req.getUsernameOrEmail().trim().isEmpty()) {
            resp.put("success", false);
            resp.put("message", "Email address is required");
            return ResponseEntity.badRequest().body(resp);
        }

        String rawQuery = req.getUsernameOrEmail().trim();
        String lowerQuery = rawQuery.toLowerCase();

        // 1. Check by Email
        Optional<CustomerUser> userOpt = customerUserRepository.findByEmail(lowerQuery);

        // 2. Check by Customer ID (e.g. CUST-20261009-1001) or Username as fallback
        if (userOpt.isEmpty()) {
            userOpt = customerUserRepository.findByCustomerId(rawQuery);
        }
        if (userOpt.isEmpty()) {
            userOpt = customerUserRepository.findByCustomerId(rawQuery.toUpperCase());
        }

        // 3. Check by Username
        if (userOpt.isEmpty()) {
            userOpt = customerUserRepository.findByUsername(rawQuery);
        }
        if (userOpt.isEmpty()) {
            userOpt = customerUserRepository.findByUsername(lowerQuery);
        }

        if (userOpt.isEmpty()) {
            resp.put("success", false);
            resp.put("message", "No registered account found with that email address.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
        }

        CustomerUser customer = userOpt.get();
        String storedPassword = customer.getPassword() != null ? customer.getPassword().trim() : "";
        String providedPassword = req.getPassword() != null ? req.getPassword().trim() : "";

        if (storedPassword.isEmpty() || providedPassword.isEmpty() || !storedPassword.equals(providedPassword)) {
            resp.put("success", false);
            resp.put("message", "Incorrect password. Please verify your password and try again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
        }

        // Verify active membership status in database
        if (customer.getEmail() != null) {
            boolean hasActiveMembership = membershipRepository
                    .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(customer.getEmail().trim().toLowerCase(), "ACTIVE")
                    .isPresent();
            if (hasActiveMembership) {
                customer.setIsMember(true);
            }
        }

        customer.setLastLoginAt(LocalDateTime.now());
        customerUserRepository.save(customer);

        resp.put("success", true);
        resp.put("message", "Signed in successfully");
        resp.put("customer", customer);
        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/auth/google
     * Seamless OAuth login/signup - automatically registers new Google users into MySQL
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> googleData) {
        String email = googleData.get("email");
        String name = googleData.get("name");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Google email required"));
        }

        email = email.trim().toLowerCase();
        Optional<CustomerUser> existingOpt = customerUserRepository.findByEmail(email);

        CustomerUser customer;
        if (existingOpt.isPresent()) {
            customer = existingOpt.get();
            customer.setLastLoginAt(LocalDateTime.now());
            if (name != null && !name.trim().isEmpty() && (customer.getFullName() == null || customer.getFullName().isEmpty())) {
                customer.setFullName(name.trim());
            }
        } else {
            // Create brand new customer record in MySQL
            String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String randPart = String.format("%04d", new Random().nextInt(10000));
            String customerId = "CUST-" + datePart + "-" + randPart;

            customer = new CustomerUser();
            customer.setCustomerId(customerId);
            customer.setEmail(email);
            customer.setFullName(name != null && !name.trim().isEmpty() ? name.trim() : email.split("@")[0]);
            customer.setUsername(email.split("@")[0]);
            customer.setRegistrationSource("GOOGLE_OAUTH");
            customer.setRole("CUSTOMER");
            customer.setIsMember(false);
            customer.setCreatedAt(LocalDateTime.now());
            customer.setLastLoginAt(LocalDateTime.now());
        }

        CustomerUser saved = customerUserRepository.save(customer);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Google authentication successful");
        resp.put("customer", saved);
        return ResponseEntity.ok(resp);
    }

    /**
     * GET /api/auth/customers
     * Returns list of all registered customers
     */
    @GetMapping("/customers")
    public ResponseEntity<List<CustomerUser>> getAllRegisteredCustomers() {
        return ResponseEntity.ok(customerUserRepository.findAllByOrderByCreatedAtDesc());
    }
}
