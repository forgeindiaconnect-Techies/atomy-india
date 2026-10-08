package com.example.atomy_india.controller.admin;

import com.example.atomy_india.model.Membership;
import com.example.atomy_india.model.PromotionSetting;
import com.example.atomy_india.repository.MembershipRepository;
import com.example.atomy_india.repository.PromotionSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/membership")
@CrossOrigin(origins = "*")
public class AdminMembershipController {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PromotionSettingRepository promotionSettingRepository;

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

    @GetMapping("/members")
    public ResponseEntity<List<Membership>> getAllMembers() {
        return ResponseEntity.ok(membershipRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/members")
    public ResponseEntity<?> addMember(@RequestBody Map<String, Object> req) {
        try {
            String name = req.get("name") != null ? req.get("name").toString().trim() : "Atomy Member";
            String email = req.get("email") != null ? req.get("email").toString().trim().toLowerCase() : "";
            if (email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            String phone = req.get("phone") != null ? req.get("phone").toString().trim() : "+91 98000 00000";
            String plan = req.get("plan") != null ? req.get("plan").toString().trim().toUpperCase() : "ANNUAL";
            BigDecimal amountPaid = BigDecimal.valueOf(plan.equals("MONTHLY") ? 299 : 2499);
            String paymentMethod = "ADMIN_MANUAL";
            String paymentId = "admin_enrolled_" + System.currentTimeMillis();

            String memberId = "ATM-MEM-" + (100 + new Random().nextInt(900));
            Membership m = new Membership(memberId, name, email, phone, plan, amountPaid, paymentMethod, paymentId);
            Membership saved = membershipRepository.save(m);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/members/{id}/status")
    public ResponseEntity<?> updateMemberStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field is required"));
        }

        return membershipRepository.findById(id).map(m -> {
            m.setStatus(newStatus.toUpperCase());
            m.setUpdatedAt(LocalDateTime.now());
            membershipRepository.save(m);
            return ResponseEntity.ok(m);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/settings")
    public ResponseEntity<String> getSettings() {
        return promotionSettingRepository.findById("membership_settings")
                .map(s -> ResponseEntity.ok(s.getJsonContent()))
                .orElse(ResponseEntity.ok(DEFAULT_SETTINGS_JSON));
    }

    @PostMapping("/settings")
    public ResponseEntity<PromotionSetting> saveSettings(@RequestBody String rawJson) {
        PromotionSetting setting = promotionSettingRepository.findById("membership_settings")
                .orElse(new PromotionSetting("membership_settings", rawJson));

        setting.setJsonContent(rawJson);
        setting.setUpdatedAt(LocalDateTime.now());
        PromotionSetting saved = promotionSettingRepository.save(setting);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getMembershipStats() {
        List<Membership> all = membershipRepository.findAll();
        long total = all.size();
        long active = all.stream().filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus())).count();
        long annual = all.stream().filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()) && "ANNUAL".equalsIgnoreCase(m.getPlan())).count();
        long monthly = all.stream().filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()) && "MONTHLY".equalsIgnoreCase(m.getPlan())).count();

        BigDecimal revenue = all.stream()
                .filter(m -> "PAID".equalsIgnoreCase(m.getPaymentStatus()) && m.getAmountPaid() != null)
                .map(Membership::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", total);
        stats.put("activeMembers", active);
        stats.put("annualSubscribers", annual);
        stats.put("monthlySubscribers", monthly);
        stats.put("totalRevenue", revenue);

        return ResponseEntity.ok(stats);
    }
}
