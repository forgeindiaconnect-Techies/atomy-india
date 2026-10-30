package com.example.atomy_india.controller.customer;

import com.example.atomy_india.dto.CustomerLoginRequest;
import com.example.atomy_india.dto.CustomerRegisterRequest;
import com.example.atomy_india.model.CustomerUser;
import com.example.atomy_india.model.PasswordResetToken;
import com.example.atomy_india.repository.CustomerUserRepository;
import com.example.atomy_india.repository.MembershipRepository;
import com.example.atomy_india.repository.PasswordResetTokenRepository;
import com.example.atomy_india.service.BrevoEmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping({"/api/auth", "/api/customer"})
@CrossOrigin(origins = "*")
public class CustomerAuthController {

    private final CustomerUserRepository customerUserRepository;
    private final MembershipRepository membershipRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final BrevoEmailService brevoEmailService;

    public CustomerAuthController(CustomerUserRepository customerUserRepository,
                                  MembershipRepository membershipRepository,
                                  PasswordResetTokenRepository passwordResetTokenRepository,
                                  BrevoEmailService brevoEmailService) {
        this.customerUserRepository = customerUserRepository;
        this.membershipRepository = membershipRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.brevoEmailService = brevoEmailService;
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

        // Send welcome email to new customer via Brevo
        try {
            brevoEmailService.sendCustomerWelcomeEmail(saved.getEmail(), saved.getFullName());
        } catch (Exception ignored) {}

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

        // Strictly verify active membership status in database
        boolean hasActiveMembership = false;
        if (customer.getEmail() != null) {
            hasActiveMembership = membershipRepository
                    .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(customer.getEmail().trim().toLowerCase(), "ACTIVE")
                    .isPresent();
        }
        customer.setIsMember(hasActiveMembership);

        customer.setLastLoginAt(LocalDateTime.now());
        customerUserRepository.save(customer);

        resp.put("success", true);
        resp.put("message", "Signed in successfully");
        resp.put("customer", customer);
        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/auth/google
     * Seamless OAuth login/signup - automatically registers new Google users into MongoDB
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
            // Create brand new customer record
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

        // Verify membership status live
        boolean hasActiveMembership = membershipRepository
                .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(customer.getEmail().trim().toLowerCase(), "ACTIVE")
                .isPresent();
        customer.setIsMember(hasActiveMembership);

        CustomerUser saved = customerUserRepository.save(customer);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Google authentication successful");
        resp.put("customer", saved);
        return ResponseEntity.ok(resp);
    }

    /**
     * GET /api/auth/profile?email=...
     * Also accessible via GET /api/customer/profile?email=...
     * Fetch customer profile details live from database
     */
    @GetMapping({"/profile", "/user"})
    public ResponseEntity<?> getCustomerProfile(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required"));
        }

        Optional<CustomerUser> userOpt = customerUserRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Customer account not found"));
        }

        CustomerUser customer = userOpt.get();
        boolean hasActiveMembership = membershipRepository
                .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(customer.getEmail().trim().toLowerCase(), "ACTIVE")
                .isPresent();
        customer.setIsMember(hasActiveMembership);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("customer", customer);
        return ResponseEntity.ok(resp);
    }

    /**
     * PUT /api/auth/profile
     * Also accessible via PUT /api/customer/profile
     * Update customer profile in database (Name, Phone, Address, City, State, Pincode, Gender, DOB)
     */
    @PutMapping({"/profile", "/user"})
    public ResponseEntity<?> updateCustomerProfile(@RequestBody Map<String, Object> req) {
        String email = req.get("email") != null ? req.get("email").toString().trim().toLowerCase() : "";
        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required to update profile"));
        }

        Optional<CustomerUser> userOpt = customerUserRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Customer account not found"));
        }

        CustomerUser customer = userOpt.get();

        if (req.containsKey("fullName") && req.get("fullName") != null) {
            customer.setFullName(req.get("fullName").toString().trim());
        } else if (req.containsKey("name") && req.get("name") != null) {
            customer.setFullName(req.get("name").toString().trim());
        }

        if (req.containsKey("phone") && req.get("phone") != null) {
            customer.setPhone(req.get("phone").toString().trim());
        }
        if (req.containsKey("address") && req.get("address") != null) {
            customer.setAddress(req.get("address").toString().trim());
        }
        if (req.containsKey("city") && req.get("city") != null) {
            customer.setCity(req.get("city").toString().trim());
        }
        if (req.containsKey("state") && req.get("state") != null) {
            customer.setState(req.get("state").toString().trim());
        }
        if (req.containsKey("pincode") && req.get("pincode") != null) {
            customer.setPincode(req.get("pincode").toString().trim());
        }
        if (req.containsKey("gender") && req.get("gender") != null) {
            customer.setGender(req.get("gender").toString().trim());
        }
        if (req.containsKey("dob") && req.get("dob") != null) {
            customer.setDob(req.get("dob").toString().trim());
        }

        boolean hasActiveMembership = membershipRepository
                .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(customer.getEmail().trim().toLowerCase(), "ACTIVE")
                .isPresent();
        customer.setIsMember(hasActiveMembership);

        CustomerUser saved = customerUserRepository.save(customer);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Profile updated successfully");
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

    /**
     * POST /api/auth/forgot-password
     * Generates a 6-digit OTP and dispatches it via Brevo Transactional Email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String rawEmail = body.get("email");
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email address is required."));
        }

        String email = rawEmail.trim().toLowerCase();
        Optional<CustomerUser> userOpt = customerUserRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Also try to find by username
            userOpt = customerUserRepository.findByUsername(rawEmail.trim());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "No account registered with \"" + rawEmail + "\". Please check your email or sign up."
            ));
        }

        CustomerUser customer = userOpt.get();
        String targetEmail = customer.getEmail();
        if (targetEmail == null || targetEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Customer account has no associated email address."));
        }

        // Generate a 6-digit cryptographic numeric OTP
        int otpNum = 100000 + new Random().nextInt(900000);
        String otp = String.valueOf(otpNum);

        // Delete any existing unused tokens for this email and save new token with 15-minute expiry
        try {
            passwordResetTokenRepository.deleteByEmailIgnoreCase(targetEmail);
        } catch (Exception e) {}

        PasswordResetToken token = new PasswordResetToken(targetEmail, otp, LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(token);

        // Dispatch OTP email via Brevo asynchronously
        brevoEmailService.sendPasswordResetOtp(targetEmail, customer.getFullName(), otp);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "A 6-digit verification code has been sent to " + targetEmail + ". Please check your inbox.",
                "email", targetEmail
        ));
    }

    /**
     * POST /api/auth/verify-otp
     * Validates whether the provided OTP is correct and unexpired
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || email.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and OTP code are required."));
        }

        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository
                .findFirstByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(email.trim().toLowerCase());

        if (tokenOpt.isEmpty() || !tokenOpt.get().getOtp().equals(otp.trim())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid verification code. Please check your email and try again."
            ));
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.isExpired()) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of(
                    "success", false,
                    "message", "This verification code has expired (15-minute validity). Please request a new one."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verification code validated successfully."
        ));
    }

    /**
     * POST /api/auth/reset-password
     * Verifies the OTP, updates the customer's password in MongoDB, and dispatches a confirmation email
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        if (email == null || email.trim().isEmpty() || otp == null || otp.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email, OTP, and new password are required."));
        }

        if (newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "New password must be at least 6 characters long."));
        }

        String cleanEmail = email.trim().toLowerCase();
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository
                .findFirstByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(cleanEmail);

        if (tokenOpt.isEmpty() || !tokenOpt.get().getOtp().equals(otp.trim())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid or expired verification code."
            ));
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.isExpired()) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of(
                    "success", false,
                    "message", "This verification code has expired. Please request a new code."
            ));
        }

        Optional<CustomerUser> userOpt = customerUserRepository.findByEmail(cleanEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Customer account not found."));
        }

        CustomerUser customer = userOpt.get();
        customer.setPassword(newPassword.trim());
        customerUserRepository.save(customer);

        // Mark OTP token as used
        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        // Send confirmation email via Brevo
        brevoEmailService.sendPasswordResetSuccess(cleanEmail, customer.getFullName());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password has been successfully updated. You can now sign in with your new password."
        ));
    }
}
