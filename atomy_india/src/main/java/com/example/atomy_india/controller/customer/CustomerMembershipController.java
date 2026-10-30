package com.example.atomy_india.controller.customer;

import com.example.atomy_india.model.Membership;
import com.example.atomy_india.repository.CustomerUserRepository;
import com.example.atomy_india.repository.MembershipRepository;
import com.example.atomy_india.repository.PromotionSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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

    @Autowired
    private com.example.atomy_india.repository.CustomerNotificationRepository notificationRepository;

    @Autowired
    private com.example.atomy_india.service.BrevoEmailService brevoEmailService;

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
                Map<String, String> err = new HashMap<>();
                err.put("error", "Email is required to join membership");
                return ResponseEntity.badRequest().body(err);
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

            membership.setWelcomeEmailSent(true);
            Membership saved = membershipRepository.save(membership);

            // Synchronize with CustomerUser record in database
            final String customerEmail = email;
            customerUserRepository.findByEmail(customerEmail).ifPresent(user -> {
                user.setIsMember(true);
                customerUserRepository.save(user);
            });

            // Send Membership Welcome Confirmation Email via Brevo
            try {
                brevoEmailService.sendMembershipWelcomeEmail(saved);
            } catch (Exception ignored) {}

            // Live notification for customer
            try {
                com.example.atomy_india.model.CustomerNotification notif = new com.example.atomy_india.model.CustomerNotification(
                        email,
                        "🎉 Distributor Membership Activated",
                        "Your Atomy Distributor Membership plan (" + plan + ") is now active. You have unlocked wholesale DP prices & PV accumulation.",
                        "membership_active",
                        null
                );
                notificationRepository.save(notif);
            } catch (Exception ignored) {}

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMembershipStatus(@RequestParam String email) {
        Map<String, Object> result = new HashMap<>();
        if (email == null || email.trim().isEmpty()) {
            result.put("isMember", false);
            return ResponseEntity.ok(result);
        }

        Optional<Membership> active = membershipRepository
                .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(email.trim().toLowerCase(), "ACTIVE");

        if (active.isPresent()) {
            Membership m = active.get();
            if (m.getExpiryDate() != null && m.getExpiryDate().isBefore(LocalDateTime.now())) {
                m.setStatus("EXPIRED");
                if (!Boolean.TRUE.equals(m.getExpiredEmailSent())) {
                    m.setExpiredEmailSent(true);
                    try {
                        brevoEmailService.sendMembershipExpiredEmail(m);
                    } catch (Exception ignored) {}
                }
                membershipRepository.save(m);
                customerUserRepository.findByEmail(m.getCustomerEmail()).ifPresent(user -> {
                    user.setIsMember(false);
                    customerUserRepository.save(user);
                });
                result.put("isMember", false);
                result.put("status", "EXPIRED");
                return ResponseEntity.ok(result);
            }

            result.put("isMember", true);
            result.put("membership", m);
            return ResponseEntity.ok(result);
        }

        result.put("isMember", false);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/settings", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getMembershipSettings() {
        return promotionSettingRepository.findById("membership_settings")
                .map(s -> ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(s.getJsonContent()))
                .orElse(ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(DEFAULT_SETTINGS_JSON));
    }
}
