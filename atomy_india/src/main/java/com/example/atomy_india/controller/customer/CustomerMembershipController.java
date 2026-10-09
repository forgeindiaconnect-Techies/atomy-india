package com.example.atomy_india.controller.customer;

import com.example.atomy_india.model.Membership;
import com.example.atomy_india.repository.CustomerUserRepository;
import com.example.atomy_india.repository.MembershipRepository;
import com.example.atomy_india.repository.PromotionSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/membership", "/api/customer/membership"})
@CrossOrigin(origins = "*")
public class CustomerMembershipController {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PromotionSettingRepository promotionSettingRepository;

    @Autowired
    private CustomerUserRepository customerUserRepository;

    private static final String DEFAULT_SETTINGS_JSON = "{"
            + "\"className\":\"Atomy Distributor Membership\","
            + "\"code\":\"DISTRIBUTOR_MEMBER\","
            + "\"monthlyFee\":299,"
            + "\"annualFee\":2499,"
            + "\"annualDiscountLabel\":\"Save 30%\","
            + "\"wholesaleDiscountPercent\":18,"
            + "\"pvMultiplier\":1.0,"
            + "\"active\":true,"
            + "\"description\":\"Unlocks wholesale Distributor Price (DP) and earns Personal PV on every purchase.\""
            + "}";

    @PostMapping("/join")
    public ResponseEntity<?> joinMembership(@RequestBody Map<String, Object> req) {
        try {
            String name = req.get("name") != null ? req.get("name").toString().trim() : "Atomy Customer";
            String email = req.get("email") != null ? req.get("email").toString().trim().toLowerCase() : "";
            if (email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required to join membership"));
            }

            String phone = req.get("phone") != null ? req.get("phone").toString().trim() : "+91 98000 00000";
            String plan = req.get("plan") != null ? req.get("plan").toString().trim().toUpperCase() : "ANNUAL";
            if (!"MONTHLY".equals(plan) && !"ANNUAL".equals(plan)) {
                plan = "ANNUAL";
            }

            BigDecimal amountPaid = BigDecimal.valueOf(plan.equals("MONTHLY") ? 299 : 2499);
            if (req.get("amountPaid") != null) {
                try {
                    amountPaid = new BigDecimal(req.get("amountPaid").toString());
                } catch (Exception ignored) {}
            }

            String paymentMethod = req.get("paymentMethod") != null ? req.get("paymentMethod").toString() : "RAZORPAY_UPI";
            String paymentId = req.get("paymentId") != null ? req.get("paymentId").toString()
                    : "pay_atomy_" + System.currentTimeMillis();

            // Look up existing active membership for this email to update or renew
            Optional<Membership> existingOpt = membershipRepository
                    .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(email, "ACTIVE");

            Membership membership;
            if (existingOpt.isPresent()) {
                membership = existingOpt.get();
                membership.setPlan(plan);
                membership.setCustomerName(name);
                membership.setCustomerPhone(phone);
                membership.setAmountPaid(amountPaid);
                membership.setPaymentMethod(paymentMethod);
                membership.setPaymentId(paymentId);
                membership.setPaymentStatus("PAID");
                membership.setStatus("ACTIVE");
                membership.setStartDate(LocalDateTime.now());
                if ("MONTHLY".equals(plan)) {
                    membership.setExpiryDate(LocalDateTime.now().plusMonths(1));
                } else {
                    membership.setExpiryDate(LocalDateTime.now().plusYears(1));
                }
                membership.setUpdatedAt(LocalDateTime.now());
            } else {
                String memberId = "ATM-MEM-" + (100 + new Random().nextInt(900));
                membership = new Membership(memberId, name, email, phone, plan, amountPaid, paymentMethod, paymentId);
            }

            Membership saved = membershipRepository.save(membership);

            // Synchronize with CustomerUser record in database
            final String customerEmail = email;
            customerUserRepository.findByEmail(customerEmail).ifPresent(user -> {
                user.setIsMember(true);
                customerUserRepository.save(user);
            });

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMembershipStatus(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("isMember", false));
        }

        Optional<Membership> active = membershipRepository
                .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(email.trim().toLowerCase(), "ACTIVE");

        if (active.isPresent()) {
            Membership m = active.get();
            // Check if expired
            if (m.getExpiryDate().isBefore(LocalDateTime.now())) {
                m.setStatus("EXPIRED");
                membershipRepository.save(m);
                return ResponseEntity.ok(Map.of("isMember", false, "status", "EXPIRED"));
            }
            return ResponseEntity.ok(Map.of(
                    "isMember", true,
                    "membership", m
            ));
        }

        return ResponseEntity.ok(Map.of("isMember", false));
    }

    @GetMapping("/settings")
    public ResponseEntity<String> getMembershipSettings() {
        return promotionSettingRepository.findById("membership_settings")
                .map(s -> ResponseEntity.ok(s.getJsonContent()))
                .orElse(ResponseEntity.ok(DEFAULT_SETTINGS_JSON));
    }
}
