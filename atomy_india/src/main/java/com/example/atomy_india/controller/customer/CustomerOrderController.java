package com.example.atomy_india.controller.customer;

import com.example.atomy_india.dto.CreateOrderRequest;
import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/orders", "/api/customer/orders"})
@CrossOrigin(origins = "*")
public class CustomerOrderController {

    @Autowired
    private CustomerService customerService;

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody CreateOrderRequest req) {
        try {
            CustomerOrder order = customerService.placeOrder(req);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<CustomerOrder> getOrder(@PathVariable String orderId) {
        return customerService.getOrderById(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<CustomerOrder>> getOrderHistory(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {

        if (email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(customerService.getOrdersByEmail(email.trim()));
        }
        if (phone != null && !phone.trim().isEmpty()) {
            return ResponseEntity.ok(customerService.getOrdersByPhone(phone.trim()));
        }
        return ResponseEntity.badRequest().build();
    }
}
