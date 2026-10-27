package com.example.atomy_india.controller;

import com.example.atomy_india.model.Coupon;
import com.example.atomy_india.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    private static final List<Coupon> DEFAULT_COUPONS = Arrays.asList(
            new Coupon(
                    "cpn-welcome10", "WELCOME10", "New Member Welcome Voucher",
                    "Get instant 10% off on your first purchase of health supplements and absolute skincare.",
                    "PERCENTAGE", 10.0, "10% OFF", 1500.0, 500.0, "ALL",
                    "ALL", true,
                    "2026-12-31", "ACTIVE", 500, 142, "2026-09-01"
            ),
            new Coupon(
                    "cpn-freeship", "ATOMYFREESHIP", "Free Shipping Across India",
                    "Waives 100% standard delivery and courier fees across all Indian pincodes via Blue Dart.",
                    "FREE_SHIPPING", 0.0, "FREE DELIVERY", 1000.0, 0.0, "ALL",
                    "ALL", false,
                    "2026-11-15", "ACTIVE", 1000, 420, "2026-09-15"
            ),
            new Coupon(
                    "cpn-festive500", "FESTIVE500", "Festive Season Gift Coupon",
                    "Flat ₹500 discount on orders above ₹4,000. Stackable with member PV accumulation.",
                    "FLAT", 500.0, "₹500 OFF", 4000.0, 500.0, "ALL",
                    "ALL", false,
                    "2026-11-30", "ACTIVE", 300, 89, "2026-10-01"
            ),
            new Coupon(
                    "cpn-hemohim20", "HEMOHIM20", "Immunity Special - HemoHIM Offer",
                    "Exclusive 20% privilege discount on all HemoHIM multi-packs and health boxes.",
                    "PERCENTAGE", 20.0, "20% OFF", 10000.0, 2500.0, "HEALTH",
                    "HEMOHIM", false,
                    "2026-12-15", "ACTIVE", 200, 54, "2026-10-10"
            )
    );

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        List<Coupon> list = couponRepository.findAll();
        if (list.isEmpty()) {
            list = couponRepository.saveAll(DEFAULT_COUPONS);
        } else {
            // Ensure existing seed coupons have targetProduct & firstOrderOnly populated
            boolean updatedAny = false;
            for (Coupon c : list) {
                if ("HEMOHIM20".equalsIgnoreCase(c.getCode()) && (c.getTargetProduct() == null || c.getTargetProduct().isEmpty())) {
                    c.setTargetProduct("HEMOHIM");
                    c.setCategoryScope("HEALTH");
                    couponRepository.save(c);
                    updatedAny = true;
                } else if ("WELCOME10".equalsIgnoreCase(c.getCode()) && (c.getFirstOrderOnly() == null || !c.getFirstOrderOnly())) {
                    c.setFirstOrderOnly(true);
                    couponRepository.save(c);
                    updatedAny = true;
                }
            }
            if (updatedAny) {
                list = couponRepository.findAll();
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCouponById(@PathVariable String id) {
        Optional<Coupon> opt = couponRepository.findById(id);
        if (!opt.isPresent()) {
            opt = couponRepository.findByCodeIgnoreCase(id);
        }
        return opt.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        if (coupon.getId() == null || coupon.getId().trim().isEmpty()) {
            coupon.setId("cpn-" + System.currentTimeMillis());
        }
        if (coupon.getCode() != null) {
            coupon.setCode(coupon.getCode().trim().toUpperCase());
        }
        if (coupon.getCreatedAt() == null || coupon.getCreatedAt().isEmpty()) {
            coupon.setCreatedAt(LocalDateTime.now().toLocalDate().toString());
        }
        coupon.setUpdatedAt(LocalDateTime.now());
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable String id, @RequestBody Coupon couponData) {
        return couponRepository.findById(id).map(existing -> {
            if (couponData.getCode() != null) existing.setCode(couponData.getCode().trim().toUpperCase());
            if (couponData.getTitle() != null) existing.setTitle(couponData.getTitle());
            if (couponData.getDescription() != null) existing.setDescription(couponData.getDescription());
            if (couponData.getDiscountType() != null) existing.setDiscountType(couponData.getDiscountType());
            existing.setDiscountValue(couponData.getDiscountValue());
            if (couponData.getDiscountDisplay() != null) existing.setDiscountDisplay(couponData.getDiscountDisplay());
            existing.setMinOrderValue(couponData.getMinOrderValue());
            existing.setMaxDiscountCap(couponData.getMaxDiscountCap());
            if (couponData.getCategoryScope() != null) existing.setCategoryScope(couponData.getCategoryScope());
            if (couponData.getTargetProduct() != null) existing.setTargetProduct(couponData.getTargetProduct());
            if (couponData.getFirstOrderOnly() != null) existing.setFirstOrderOnly(couponData.getFirstOrderOnly());
            if (couponData.getValidTill() != null) existing.setValidTill(couponData.getValidTill());
            if (couponData.getStatus() != null) existing.setStatus(couponData.getStatus());
            existing.setUsageLimit(couponData.getUsageLimit());
            existing.setUsageCount(couponData.getUsageCount());
            existing.setUpdatedAt(LocalDateTime.now());
            Coupon updated = couponRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCoupon(@PathVariable String id) {
        boolean existed = false;
        if (couponRepository.existsById(id)) {
            couponRepository.deleteById(id);
            existed = true;
        } else {
            Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(id);
            if (opt.isPresent()) {
                couponRepository.delete(opt.get());
                existed = true;
            }
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", existed);
        resp.put("id", id);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyCoupon(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        Number cartAmountNum = (Number) body.getOrDefault("cartAmount", 0);
        double cartAmount = cartAmountNum.doubleValue();
        Boolean isFirstOrder = (Boolean) body.getOrDefault("isFirstOrder", true);
        List<Map<String, Object>> cartItems = (List<Map<String, Object>>) body.getOrDefault("cartItems", Collections.emptyList());

        Map<String, Object> resp = new HashMap<>();
        if (code == null || code.trim().isEmpty()) {
            resp.put("valid", false);
            resp.put("message", "Please provide a valid coupon code.");
            return ResponseEntity.badRequest().body(resp);
        }

        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(code.trim());
        if (!opt.isPresent()) {
            resp.put("valid", false);
            resp.put("message", "Invalid coupon code \"" + code.toUpperCase() + "\".");
            return ResponseEntity.ok(resp);
        }

        Coupon c = opt.get();
        if (!"ACTIVE".equalsIgnoreCase(c.getStatus())) {
            resp.put("valid", false);
            resp.put("message", "Coupon \"" + c.getCode() + "\" is currently inactive or expired.");
            return ResponseEntity.ok(resp);
        }

        // 1. First order check
        boolean isWelcomeCoupon = Boolean.TRUE.equals(c.getFirstOrderOnly()) ||
                c.getCode().toUpperCase().contains("WELCOME") ||
                c.getCode().toUpperCase().contains("FIRST");
        if (isWelcomeCoupon && Boolean.FALSE.equals(isFirstOrder)) {
            resp.put("valid", false);
            resp.put("message", "Coupon \"" + c.getCode() + "\" is valid for first-time orders only.");
            return ResponseEntity.ok(resp);
        }

        // 2. Product-specific check (e.g. HemoHIM)
        boolean isHemohimCoupon = "HEMOHIM".equalsIgnoreCase(c.getTargetProduct()) ||
                c.getCode().toUpperCase().contains("HEMO") ||
                (c.getTitle() != null && c.getTitle().toLowerCase().contains("hemohim"));
        if (isHemohimCoupon && cartItems != null && !cartItems.isEmpty()) {
            boolean hasHemohim = cartItems.stream().anyMatch(item -> {
                String name = String.valueOf(item.getOrDefault("name", "")).toLowerCase();
                String tags = String.valueOf(item.getOrDefault("tags", "")).toLowerCase();
                return name.contains("hemohim") || name.contains("hemo him") || tags.contains("hemohim");
            });
            if (!hasHemohim) {
                resp.put("valid", false);
                resp.put("message", "Coupon \"" + c.getCode() + "\" is only applicable to orders containing HemoHIM products.");
                return ResponseEntity.ok(resp);
            }
        }

        // 3. Minimum order check
        if (c.getMinOrderValue() > 0 && cartAmount < c.getMinOrderValue()) {
            resp.put("valid", false);
            resp.put("message", "Coupon \"" + c.getCode() + "\" requires a minimum cart value of ₹" + (int) c.getMinOrderValue() + ".");
            return ResponseEntity.ok(resp);
        }

        double discountAmount = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(c.getDiscountType())) {
            discountAmount = (cartAmount * c.getDiscountValue()) / 100.0;
            if (c.getMaxDiscountCap() > 0 && discountAmount > c.getMaxDiscountCap()) {
                discountAmount = c.getMaxDiscountCap();
            }
        } else if ("FLAT".equalsIgnoreCase(c.getDiscountType())) {
            discountAmount = Math.min(cartAmount, c.getDiscountValue());
        } else if ("FREE_SHIPPING".equalsIgnoreCase(c.getDiscountType())) {
            discountAmount = 0.0; // Handled as free shipping waiver
        }

        resp.put("valid", true);
        resp.put("coupon", c);
        resp.put("discountAmount", discountAmount);
        resp.put("discountDisplay", c.getDiscountDisplay());
        resp.put("message", "Coupon \"" + c.getCode() + "\" applied successfully! " + c.getDiscountDisplay());
        return ResponseEntity.ok(resp);
    }
}
