package com.example.atomy_india.controller.admin;

import com.example.atomy_india.model.DistributorUser;
import com.example.atomy_india.model.IndiaPincode;
import com.example.atomy_india.repository.DistributorRepository;
import com.example.atomy_india.service.BrevoEmailService;
import com.example.atomy_india.repository.IndiaPincodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/pincodes")
@CrossOrigin(origins = "*")
public class AdminPincodeController {

    @Autowired
    private IndiaPincodeRepository indiaPincodeRepository;

    @Autowired
    private DistributorRepository distributorRepository;

    @Autowired
    private BrevoEmailService brevoEmailService;

    @GetMapping
    public ResponseEntity<?> getPincodes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String state) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("pincode").ascending());

        Page<IndiaPincode> result;
        String q = (search != null) ? search.trim() : "";
        String st = (status != null && !status.equalsIgnoreCase("ALL")) ? status.trim().toUpperCase() : null;

        if (!q.isEmpty() && st != null) {
            result = indiaPincodeRepository.searchPincodesWithStatus(q, st, pageable);
        } else if (!q.isEmpty()) {
            result = indiaPincodeRepository.searchPincodes(q, pageable);
        } else if (st != null) {
            result = indiaPincodeRepository.searchPincodesWithStatus("", st, pageable);
        } else if (state != null && !state.trim().isEmpty() && !state.equalsIgnoreCase("ALL")) {
            result = indiaPincodeRepository.findByStateIgnoreCase(state.trim(), pageable);
        } else {
            result = indiaPincodeRepository.findAll(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalPages", result.getTotalPages());
        response.put("totalElements", result.getTotalElements());
        response.put("currentPage", result.getNumber());
        response.put("size", result.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPincodeStats() {
        long total = indiaPincodeRepository.count();
        long assigned = indiaPincodeRepository.countByStatus("ASSIGNED");
        long vacant = Math.max(0, total - assigned);
        long activeDistributors = distributorRepository.countByStatus("ACTIVE");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPincodes", total);
        stats.put("assignedPincodes", assigned);
        stats.put("vacantPincodes", vacant);
        stats.put("activeDistributors", activeDistributors);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/distributors")
    public ResponseEntity<List<DistributorUser>> getAllDistributors() {
        return ResponseEntity.ok(distributorRepository.findAll());
    }

    @DeleteMapping("/distributors")
    public ResponseEntity<?> clearAllDistributors() {
        try {
            long count = distributorRepository.count();
            distributorRepository.deleteAll();

            // Reset assigned distributors in master pincode collection
            List<IndiaPincode> assignedPins = indiaPincodeRepository.findByStatus("ASSIGNED");
            for (IndiaPincode p : assignedPins) {
                p.setStatus("VACANT");
                p.setAssignedDistributorId(null);
                p.setAssignedDistributorName(null);
                p.setAssignedDistributorEmail(null);
                p.setAssignedDistributorPhone(null);
                p.setAssignedAt(null);
                indiaPincodeRepository.save(p);
            }

            return ResponseEntity
                    .ok(Map.of("message", "All distributors successfully removed from MongoDB", "deletedCount", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/distributors/{distributorId}")
    public ResponseEntity<?> deleteDistributor(@PathVariable String distributorId) {
        try {
            Optional<DistributorUser> distOpt = distributorRepository.findByDistributorId(distributorId);
            if (distOpt.isEmpty()) {
                distOpt = distributorRepository.findById(distributorId);
            }
            if (distOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            DistributorUser dist = distOpt.get();
            distributorRepository.delete(dist);

            // Unassign pincodes
            if (dist.getAssignedPincodes() != null) {
                for (String pin : dist.getAssignedPincodes()) {
                    indiaPincodeRepository.findByPincode(pin).ifPresent(p -> {
                        p.setStatus("VACANT");
                        p.setAssignedDistributorId(null);
                        p.setAssignedDistributorName(null);
                        p.setAssignedDistributorEmail(null);
                        p.setAssignedDistributorPhone(null);
                        p.setAssignedAt(null);
                        indiaPincodeRepository.save(p);
                    });
                }
            }
            return ResponseEntity.ok(Map.of("message", "Distributor " + distributorId + " deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/distributors")
    public ResponseEntity<?> createDistributor(@RequestBody Map<String, Object> req) {
        try {
            String name = req.get("businessName") != null ? req.get("businessName").toString().trim() : "";
            String contact = req.get("contactPerson") != null ? req.get("contactPerson").toString().trim() : "";
            String email = req.get("email") != null ? req.get("email").toString().trim().toLowerCase() : "";
            String phone = req.get("phone") != null ? req.get("phone").toString().trim() : "";
            String pincode = req.get("primaryPincode") != null ? req.get("primaryPincode").toString().trim() : "";
            String city = req.get("city") != null ? req.get("city").toString().trim() : "City Hub";
            String state = req.get("state") != null ? req.get("state").toString().trim() : "State";
            String hubAddress = req.get("hubAddress") != null ? req.get("hubAddress").toString().trim() : "";
            String password = req.get("password") != null ? req.get("password").toString().trim() : "Admin@123";

            if (email.isEmpty() || pincode.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and primary PIN code are required"));
            }

            if (hubAddress.isEmpty()) {
                hubAddress = name + ", Near Central Depot, " + city + ", " + state + " - " + pincode;
            }

            // Check if email already registered as distributor
            Optional<DistributorUser> existing = distributorRepository.findByEmailIgnoreCase(email);
            if (existing.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Distributor with this email already exists: " + email));
            }

            String distributorId = "DIST-" + pincode;
            DistributorUser d = new DistributorUser(distributorId, name, contact, email, phone, pincode, city, state);
            d.setHubAddress(hubAddress);
            d.setPasswordHash(password); // Simple auth for operations portal
            d.setPrimaryPincode(pincode);
            d.setAssignedPincodes(new ArrayList<>(Collections.singletonList(pincode)));

            if (req.get("commissionRate") != null) {
                try {
                    d.setCommissionRate(Double.parseDouble(req.get("commissionRate").toString()));
                } catch (Exception ignored) {
                }
            }
            if (req.get("territoryFee") != null) {
                try {
                    d.setTerritoryFee(new BigDecimal(req.get("territoryFee").toString()));
                } catch (Exception ignored) {
                }
            }

            DistributorUser saved = distributorRepository.save(d);

            // Update matched PIN code in master registry to ASSIGNED
            indiaPincodeRepository.findByPincode(pincode).ifPresent(pinDoc -> {
                pinDoc.setStatus("ASSIGNED");
                pinDoc.setAssignedDistributorId(saved.getDistributorId());
                pinDoc.setAssignedDistributorName(saved.getBusinessName());
                pinDoc.setAssignedDistributorEmail(saved.getEmail());
                pinDoc.setAssignedDistributorPhone(saved.getPhone());
                pinDoc.setAssignedAt(LocalDateTime.now());
                pinDoc.setCommissionRate(saved.getCommissionRate());
                pinDoc.setTerritoryFee(saved.getTerritoryFee());
                pinDoc.setUpdatedAt(LocalDateTime.now());
                indiaPincodeRepository.save(pinDoc);
            });

            // Send invitation email via Brevo
            try {
                boolean sendEmail = req.get("sendEmail") == null
                        || Boolean.parseBoolean(req.get("sendEmail").toString());
                if (sendEmail) {
                    brevoEmailService.sendDistributorInvitationEmail(saved, password);
                }
            } catch (Exception mailEx) {
                System.err.println("Notice: Failed to dispatch distributor invitation email: " + mailEx.getMessage());
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assignPincodeToDistributor(@RequestBody Map<String, String> body) {
        String pincode = body.get("pincode");
        String distributorId = body.get("distributorId");

        if (pincode == null || distributorId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "pincode and distributorId are required"));
        }

        Optional<DistributorUser> distroOpt = distributorRepository.findByDistributorId(distributorId);
        if (!distroOpt.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Distributor not found: " + distributorId));
        }

        DistributorUser distro = distroOpt.get();
        if (distro.getAssignedPincodes() == null) {
            distro.setAssignedPincodes(new ArrayList<>());
        }
        if (!distro.getAssignedPincodes().contains(pincode)) {
            distro.getAssignedPincodes().add(pincode);
        }
        distributorRepository.save(distro);

        IndiaPincode p = indiaPincodeRepository.findByPincode(pincode)
                .orElseGet(() -> {
                    IndiaPincode newPin = new IndiaPincode();
                    newPin.setPincode(pincode);
                    newPin.setOfficeName((distro.getCity() != null ? distro.getCity() : "Regional") + " Hub Territory");
                    newPin.setDistrict(distro.getCity() != null ? distro.getCity() : "Regional District");
                    newPin.setState(distro.getState() != null ? distro.getState() : "India");
                    return newPin;
                });

        p.setStatus("ASSIGNED");
        p.setAssignedDistributorId(distro.getDistributorId());
        p.setAssignedDistributorName(distro.getBusinessName());
        p.setAssignedDistributorEmail(distro.getEmail());
        p.setAssignedDistributorPhone(distro.getPhone());
        p.setAssignedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        indiaPincodeRepository.save(p);
        return ResponseEntity.ok(Map.of("success", true, "distributor", distro, "pincode", p));
    }

    @PostMapping("/unassign")
    public ResponseEntity<?> unassignPincode(@RequestBody Map<String, String> body) {
        String pincode = body.get("pincode");
        if (pincode == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "pincode is required"));
        }

        Optional<IndiaPincode> pinOpt = indiaPincodeRepository.findByPincode(pincode);
        if (!pinOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        IndiaPincode p = pinOpt.get();
        String distroId = p.getAssignedDistributorId();

        p.setStatus("VACANT");
        p.setAssignedDistributorId(null);
        p.setAssignedDistributorName(null);
        p.setAssignedDistributorEmail(null);
        p.setAssignedDistributorPhone(null);
        p.setAssignedAt(null);
        p.setUpdatedAt(LocalDateTime.now());
        indiaPincodeRepository.save(p);

        // Remove from distributor's assigned list
        if (distroId != null) {
            distributorRepository.findByDistributorId(distroId).ifPresent(d -> {
                d.getAssignedPincodes().remove(pincode);
                distributorRepository.save(d);
            });
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "PIN " + pincode + " is now VACANT"));
    }

    @PutMapping("/distributors/{distributorId}/status")
    public ResponseEntity<?> updateDistributorStatus(
            @PathVariable String distributorId,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "status field is required"));
        }

        return distributorRepository.findByDistributorId(distributorId).map(d -> {
            d.setStatus(newStatus.toUpperCase());
            d.setUpdatedAt(LocalDateTime.now());
            distributorRepository.save(d);
            return ResponseEntity.ok(d);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/distributors/{distributorId}/resend-invite")
    public ResponseEntity<?> resendDistributorInvite(
            @PathVariable String distributorId,
            @RequestBody(required = false) Map<String, String> body) {
        Optional<DistributorUser> distroOpt = distributorRepository.findByDistributorId(distributorId);
        if (!distroOpt.isPresent()) {
            distroOpt = distributorRepository.findByEmailIgnoreCase(distributorId);
        }
        if (!distroOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        DistributorUser distro = distroOpt.get();
        String password = (body != null && body.containsKey("password") && body.get("password") != null
                && !body.get("password").trim().isEmpty())
                        ? body.get("password").trim()
                        : (distro.getPasswordHash() != null && !distro.getPasswordHash().trim().isEmpty()
                                ? distro.getPasswordHash()
                                : "Admin@123");

        try {
            brevoEmailService.sendDistributorInvitationEmail(distro, password);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Invitation email with credentials successfully sent to " + distro.getEmail()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to dispatch email: " + ex.getMessage()));
        }
    }
}
