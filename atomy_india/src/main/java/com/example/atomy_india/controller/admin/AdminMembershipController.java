package com.example.atomy_india.controller.admin;

import com.example.atomy_india.model.Membership;
import com.example.atomy_india.model.PromotionSetting;
import com.example.atomy_india.repository.CustomerUserRepository;
import com.example.atomy_india.repository.MembershipRepository;
import com.example.atomy_india.repository.PromotionSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    @GetMapping("/members")
    public ResponseEntity<List<Membership>> getAllMembers() {
        List<Membership> rawList = membershipRepository.findAllByOrderByCreatedAtDesc();
        LocalDateTime now = LocalDateTime.now();

        Map<String, Membership> byEmail = new LinkedHashMap<>();
        List<Membership> toDelete = new ArrayList<>();

        for (Membership m : rawList) {
            boolean isExpired = m.getExpiryDate() != null && m.getExpiryDate().isBefore(now);
            if ("ACTIVE".equalsIgnoreCase(m.getStatus()) && isExpired) {
                m.setStatus("EXPIRED");
                membershipRepository.save(m);
            }

            String emailKey = m.getCustomerEmail() != null ? m.getCustomerEmail().trim().toLowerCase() : "";
            if (emailKey.isEmpty()) {
                continue;
            }

            if (!byEmail.containsKey(emailKey)) {
                // Ensure purchase history has at least current cycle
                if (m.getPurchaseHistory().isEmpty() && m.getStartDate() != null) {
                    Map<String, Object> initHistory = new HashMap<>();
                    initHistory.put("plan", m.getPlan());
                    initHistory.put("amountPaid", m.getAmountPaid());
                    initHistory.put("paymentMethod", m.getPaymentMethod());
                    initHistory.put("paymentId", m.getPaymentId());
                    initHistory.put("startDate", m.getStartDate().toString());
                    initHistory.put("expiryDate", m.getExpiryDate() != null ? m.getExpiryDate().toString() : null);
                    initHistory.put("status", m.getStatus());
                    m.getPurchaseHistory().add(initHistory);
                }
                byEmail.put(emailKey, m);
            } else {
                Membership primary = byEmail.get(emailKey);
                // If m is ACTIVE while primary was EXPIRED, elevate m as primary
                if ("ACTIVE".equalsIgnoreCase(m.getStatus()) && !"ACTIVE".equalsIgnoreCase(primary.getStatus())) {
                    toDelete.add(primary);
                    if (!primary.getPurchaseHistory().isEmpty()) {
                        m.getPurchaseHistory().addAll(primary.getPurchaseHistory());
                    } else if (primary.getStartDate() != null) {
                        Map<String, Object> oldItem = new HashMap<>();
                        oldItem.put("plan", primary.getPlan());
                        oldItem.put("amountPaid", primary.getAmountPaid());
                        oldItem.put("paymentMethod", primary.getPaymentMethod());
                        oldItem.put("paymentId", primary.getPaymentId());
                        oldItem.put("startDate", primary.getStartDate().toString());
                        oldItem.put("expiryDate", primary.getExpiryDate() != null ? primary.getExpiryDate().toString() : null);
                        oldItem.put("status", primary.getStatus());
                        m.getPurchaseHistory().add(oldItem);
                    }
                    byEmail.put(emailKey, m);
                } else {
                    toDelete.add(m);
                    if (!m.getPurchaseHistory().isEmpty()) {
                        for (Map<String, Object> h : m.getPurchaseHistory()) {
                            if (!primary.getPurchaseHistory().contains(h)) {
                                primary.getPurchaseHistory().add(h);
                            }
                        }
                    } else if (m.getStartDate() != null) {
                        Map<String, Object> oldItem = new HashMap<>();
                        oldItem.put("plan", m.getPlan());
                        oldItem.put("amountPaid", m.getAmountPaid());
                        oldItem.put("paymentMethod", m.getPaymentMethod());
                        oldItem.put("paymentId", m.getPaymentId());
                        oldItem.put("startDate", m.getStartDate().toString());
                        oldItem.put("expiryDate", m.getExpiryDate() != null ? m.getExpiryDate().toString() : null);
                        oldItem.put("status", m.getStatus());
                        primary.getPurchaseHistory().add(oldItem);
                    }
                }
            }
        }

        // Clean up redundant duplicate rows from database
        for (Membership dup : toDelete) {
            try {
                membershipRepository.delete(dup);
            } catch (Exception ignored) {}
        }

        List<Membership> uniqueMembers = new ArrayList<>(byEmail.values());
        for (Membership u : uniqueMembers) {
            int histCount = u.getPurchaseHistory() != null ? u.getPurchaseHistory().size() : 1;
            u.setTimesPurchased(Math.max(u.getTimesPurchased(), histCount));
            try {
                membershipRepository.save(u);
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(uniqueMembers);
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

            // Synchronize with CustomerUser in database
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

    @PutMapping("/members/{id}/status")
    public ResponseEntity<?> updateMemberStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field is required"));
        }

        LocalDateTime now = LocalDateTime.now();
        String newExpiryDate = body.get("expiryDate");

        return membershipRepository.findById(id).map(m -> {
            m.setStatus(newStatus.toUpperCase());
            m.setUpdatedAt(now);

            if (newExpiryDate != null && !newExpiryDate.isEmpty()) {
                try {
                    m.setExpiryDate(LocalDate.parse(newExpiryDate).atTime(23, 59, 59));
                    m.setStartDate(now);
                } catch (Exception e) {}
            } else if ("ACTIVE".equalsIgnoreCase(newStatus) && (m.getExpiryDate() == null || m.getExpiryDate().isBefore(now) || m.getExpiryDate().toLocalDate().isEqual(now.toLocalDate()))) {
                int months = "MONTHLY".equalsIgnoreCase(m.getPlan()) ? 1 : 12;
                m.setExpiryDate(now.plusMonths(months));
                m.setStartDate(now);
            }
            membershipRepository.save(m);

            boolean active = "ACTIVE".equalsIgnoreCase(newStatus);
            if (m.getCustomerEmail() != null && !m.getCustomerEmail().isEmpty()) {
                customerUserRepository.findByEmail(m.getCustomerEmail().trim().toLowerCase()).ifPresent(user -> {
                    user.setIsMember(active);
                    customerUserRepository.save(user);
                });
            }

            return ResponseEntity.ok(m);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/settings", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getSettings() {
        return promotionSettingRepository.findById("membership_settings")
                .map(s -> ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(s.getJsonContent()))
                .orElse(ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(DEFAULT_SETTINGS_JSON));
    }

    @PostMapping(value = "/settings", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
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
