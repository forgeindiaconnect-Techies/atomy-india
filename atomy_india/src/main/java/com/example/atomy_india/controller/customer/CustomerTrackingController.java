package com.example.atomy_india.controller.customer;

import com.example.atomy_india.model.OrderTracking;
import com.example.atomy_india.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class CustomerTrackingController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/{id}")
    public ResponseEntity<OrderTracking> trackOrder(@PathVariable String id) {
        Optional<OrderTracking> tracking = customerService.getTracking(id);
        return tracking.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
