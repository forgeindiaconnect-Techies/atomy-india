package com.example.atomy_india.controller.admin;

import com.example.atomy_india.dto.AddCheckpointRequest;
import com.example.atomy_india.dto.DispatchOrderRequest;
import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.OrderTracking;
import com.example.atomy_india.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
public class AdminOrderController {

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<List<CustomerOrder>> getAllOrders(
            @RequestParam(required = false) CustomerOrder.OrderStatus status) {
        return ResponseEntity.ok(adminService.getAllOrders(status));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<CustomerOrder> getOrderDetails(@PathVariable String orderId) {
        return adminService.getOrderDetails(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<CustomerOrder> updateStatus(
            @PathVariable String orderId,
            @RequestParam(required = false) CustomerOrder.OrderStatus status,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            CustomerOrder.OrderStatus statusToUse = status;
            if (statusToUse == null && body != null && body.containsKey("status")) {
                statusToUse = CustomerOrder.OrderStatus.valueOf(body.get("status"));
            }
            if (statusToUse == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(adminService.updateOrderStatus(orderId, statusToUse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{orderId}/tracking")
    public ResponseEntity<OrderTracking> updateTracking(
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        DispatchOrderRequest req = new DispatchOrderRequest();
        req.setCourierPartner(body.get("courierPartner"));
        req.setTrackingNumber(body.get("trackingNumber"));
        req.setEstimatedDelivery(body.get("estimatedDelivery"));
        req.setInitialLocation(body.get("currentLocation"));
        return ResponseEntity.ok(adminService.dispatchOrder(orderId, req));
    }

    @PostMapping("/{orderId}/dispatch")
    public ResponseEntity<OrderTracking> dispatchOrder(
            @PathVariable String orderId,
            @RequestBody DispatchOrderRequest req) {
        return ResponseEntity.ok(adminService.dispatchOrder(orderId, req));
    }

    @PostMapping("/{orderId}/checkpoint")
    public ResponseEntity<OrderTracking> addCheckpoint(
            @PathVariable String orderId,
            @RequestBody AddCheckpointRequest req) {
        return ResponseEntity.ok(adminService.addTrackingCheckpoint(orderId, req));
    }

    @GetMapping("/items")
    public ResponseEntity<?> getAllOrderItems() {
        return ResponseEntity.ok(adminService.getAllOrderItems());
    }

    @PostMapping("/sync-items")
    public ResponseEntity<?> syncOrderItems() {
        return ResponseEntity.ok(adminService.syncOrderItems());
    }

    @PostMapping("/{orderId}/send-delay-email")
    public ResponseEntity<?> sendDelayEmail(@PathVariable String orderId) {
        try {
            CustomerOrder order = adminService.sendDelayApologyEmail(orderId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Apology email sent successfully to " + order.getCustomerEmail(),
                    "order", order
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/trigger-delayed-emails")
    public ResponseEntity<?> triggerDelayedEmails() {
        int count = adminService.processAndSendAutomatedDelayEmails();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "emailsSent", count,
                "message", count + " delayed order apology email(s) dispatched successfully"
        ));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable String orderId) {
        adminService.deleteOrder(orderId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Order " + orderId + " deleted successfully"));
    }

    @DeleteMapping("/all")
    public ResponseEntity<?> clearAllOrders() {
        adminService.clearAllOrders();
        return ResponseEntity.ok(Map.of("message", "All orders and tracking cleared successfully"));
    }
}
