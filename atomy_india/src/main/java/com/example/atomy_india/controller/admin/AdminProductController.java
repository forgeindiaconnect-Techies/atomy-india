package com.example.atomy_india.controller.admin;

import com.example.atomy_india.model.Product;
import com.example.atomy_india.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "*")
public class AdminProductController {

    @Autowired
    private AdminService adminService;

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(adminService.saveOrUpdateProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable String id,
            @RequestBody Product product) {
        product.setId(id);
        return ResponseEntity.ok(adminService.saveOrUpdateProduct(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateProduct(@PathVariable String id) {
        adminService.deleteOrDeactivateProduct(id);
        return ResponseEntity.noContent().build();
    }
}
