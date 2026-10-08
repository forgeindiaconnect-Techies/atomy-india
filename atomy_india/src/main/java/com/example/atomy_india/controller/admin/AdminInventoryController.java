package com.example.atomy_india.controller.admin;

import com.example.atomy_india.dto.StockAdjustmentRequest;
import com.example.atomy_india.model.Inventory;
import com.example.atomy_india.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@CrossOrigin(origins = "*")
public class AdminInventoryController {

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(adminService.getAllInventory());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<Inventory>> getLowStockAlerts() {
        return ResponseEntity.ok(adminService.getLowStockAlerts());
    }

    @PutMapping({"/{productId}/stock", "/{productId}"})
    public ResponseEntity<Inventory> adjustStock(
            @PathVariable String productId,
            @RequestBody StockAdjustmentRequest req) {
        return ResponseEntity.ok(adminService.adjustStock(productId, req));
    }
}
