package com.example.atomy_india.controller.customer;

import com.example.atomy_india.model.Category;
import com.example.atomy_india.model.Product;
import com.example.atomy_india.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CustomerProductController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String search) {

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(customerService.searchProducts(search.trim()));
        }
        if (categoryId != null && !categoryId.trim().isEmpty() && !categoryId.equalsIgnoreCase("all_products")) {
            return ResponseEntity.ok(customerService.getProductsByCategory(categoryId.trim()));
        }
        return ResponseEntity.ok(customerService.getAllActiveProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return customerService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(customerService.getAllCategories());
    }
}
