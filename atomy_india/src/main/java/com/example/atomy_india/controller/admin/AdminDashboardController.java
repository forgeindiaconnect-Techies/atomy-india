package com.example.atomy_india.controller.admin;

import com.example.atomy_india.dto.DashboardStatsResponse;
import com.example.atomy_india.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}
