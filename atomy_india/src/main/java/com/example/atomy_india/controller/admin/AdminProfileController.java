package com.example.atomy_india.controller.admin;

import com.example.atomy_india.model.AdminProfile;
import com.example.atomy_india.repository.AdminProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/profile")
@CrossOrigin(origins = "*")
public class AdminProfileController {

    @Autowired
    private AdminProfileRepository adminProfileRepository;

    @GetMapping
    public ResponseEntity<AdminProfile> getProfile() {
        AdminProfile profile = adminProfileRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultProfile);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<AdminProfile> updateProfile(@RequestBody AdminProfile updatedProfile) {
        AdminProfile profile = adminProfileRepository.findFirstByOrderByIdAsc()
                .orElseGet(AdminProfile::new);

        if (updatedProfile.getName() != null && !updatedProfile.getName().trim().isEmpty()) {
            profile.setName(updatedProfile.getName().trim());
        }
        if (updatedProfile.getEmail() != null && !updatedProfile.getEmail().trim().isEmpty()) {
            profile.setEmail(updatedProfile.getEmail().trim());
        }
        if (updatedProfile.getPhone() != null) {
            profile.setPhone(updatedProfile.getPhone().trim());
        }
        if (updatedProfile.getEmployeeId() != null) {
            profile.setEmployeeId(updatedProfile.getEmployeeId().trim());
        }
        if (updatedProfile.getDepartment() != null) {
            profile.setDepartment(updatedProfile.getDepartment().trim());
        }
        if (updatedProfile.getRole() != null) {
            profile.setRole(updatedProfile.getRole().trim());
        }
        if (updatedProfile.getLocation() != null) {
            profile.setLocation(updatedProfile.getLocation().trim());
        }
        if (updatedProfile.getTwoFactorEnabled() != null) {
            profile.setTwoFactorEnabled(updatedProfile.getTwoFactorEnabled());
        }
        if (updatedProfile.getSessionIp() != null) {
            profile.setSessionIp(updatedProfile.getSessionIp());
        }
        if (updatedProfile.getLastLogin() != null) {
            profile.setLastLogin(updatedProfile.getLastLogin());
        }

        profile.setUpdatedAt(LocalDateTime.now());
        AdminProfile saved = adminProfileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    @PostMapping
    public ResponseEntity<AdminProfile> saveProfilePost(@RequestBody AdminProfile updatedProfile) {
        return updateProfile(updatedProfile);
    }

    private AdminProfile createDefaultProfile() {
        AdminProfile defaultProfile = new AdminProfile(
                "Naveen Sourabh Pal",
                "naveen.admin@atomy.com",
                "+91 98765 43210",
                "AT-IN-001",
                "E-Commerce Operations & Supply Chain",
                "Super Administrator",
                "Gurugram HQ, India",
                true,
                "192.168.1.104 (Secure VPN)"
        );
        defaultProfile.setLastLogin("Today, 09:30 AM (IST)");
        defaultProfile.setUpdatedAt(LocalDateTime.now());
        return adminProfileRepository.save(defaultProfile);
    }
}
