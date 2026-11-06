package com.example.atomy_india.controller.admin;

import com.example.atomy_india.dto.AddCheckpointRequest;
import com.example.atomy_india.dto.DispatchOrderRequest;
import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.OrderTracking;
import com.example.atomy_india.repository.CustomerOrderRepository;
import com.example.atomy_india.repository.OrderTrackingRepository;
import com.example.atomy_india.service.AdminService;
import com.example.atomy_india.service.BrevoEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
public class AdminOrderController {

    @Autowired
    private AdminService adminService;

    @Autowired(required = false)
    private CustomerOrderRepository customerOrderRepository;

    @Autowired(required = false)
    private OrderTrackingRepository trackingRepository;

    @Autowired(required = false)
    private BrevoEmailService brevoEmailService;

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

    @PostMapping("/{orderId}/send-pickup-otp")
    public ResponseEntity<?> sendPickupOtp(@PathVariable String orderId) {
        if (customerOrderRepository == null) return ResponseEntity.status(500).body(Map.of("error", "Repository unavailable"));
        var orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        CustomerOrder order = orderOpt.get();

        String customerEmail = order.getCustomerEmail();
        if (customerEmail == null || customerEmail.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "This order has no registered customer email address."));
        }

        int code = 100000 + new java.security.SecureRandom().nextInt(900000);
        String otp = String.valueOf(code);
        order.setPickupOtp(otp);
        order.setPickupOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        order.setPickupOtpAttempts(0);
        customerOrderRepository.save(order);

        String hubName = order.getAssignedDistributorName() != null ? order.getAssignedDistributorName() : "Atomy Regional Logistics Hub";
        if (brevoEmailService != null) {
            brevoEmailService.sendPickupVerificationOtp(order, otp, hubName);
        }

        String maskedEmail = maskEmailAddress(customerEmail);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verification OTP sent successfully to " + maskedEmail,
                "maskedEmail", maskedEmail,
                "expiresInSeconds", 600
        ));
    }

    @PostMapping("/{orderId}/verify-pickup-otp")
    public ResponseEntity<?> verifyPickupOtp(@PathVariable String orderId, @RequestBody Map<String, String> payload) {
        if (customerOrderRepository == null) return ResponseEntity.status(500).body(Map.of("error", "Repository unavailable"));
        var orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        CustomerOrder order = orderOpt.get();

        String inputOtp = payload != null ? payload.get("otp") : null;
        if (inputOtp == null || inputOtp.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Please provide the 6-digit OTP code."));
        }

        if (order.getPickupOtp() == null || order.getPickupOtp().trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "No active OTP generated. Please click 'Send Verification OTP' first."));
        }

        int attempts = order.getPickupOtpAttempts() != null ? order.getPickupOtpAttempts() : 0;
        if (attempts >= 5) {
            return ResponseEntity.status(400).body(Map.of("error", "Maximum attempts exceeded (5/5). Please request a new OTP."));
        }

        if (order.getPickupOtpExpiresAt() != null && LocalDateTime.now().isAfter(order.getPickupOtpExpiresAt())) {
            return ResponseEntity.status(400).body(Map.of("error", "Verification OTP has expired (10-minute limit). Please send a new OTP."));
        }

        if (!order.getPickupOtp().trim().equals(inputOtp.trim())) {
            int newAttempts = attempts + 1;
            order.setPickupOtpAttempts(newAttempts);
            customerOrderRepository.save(order);
            int remaining = Math.max(0, 5 - newAttempts);
            return ResponseEntity.status(400).body(Map.of(
                    "error", "Invalid OTP. " + remaining + " attempt(s) remaining.",
                    "remainingAttempts", remaining
            ));
        }

        order.setPickupOtp(null);
        order.setPickupOtpExpiresAt(null);
        order.setPickupOtpAttempts(0);
        order.setPickupVerifiedAt(LocalDateTime.now());
        order.setPickupVerifiedBy("Admin Console");
        order.setPickupStatus("COLLECTED");
        order.setOrderStatus(CustomerOrder.OrderStatus.DELIVERED);
        order.setDistributorDispatchStatus("COLLECTED_BY_CUSTOMER");
        order.setDeliveredAt(LocalDateTime.now());

        if (trackingRepository != null) {
            OrderTracking tracking = trackingRepository.findByOrderId(orderId).orElseGet(() -> {
                OrderTracking t = new OrderTracking();
                t.setOrderId(orderId);
                t.setCourierPartner("Regional Hub Self-Pickup");
                t.setTrackingNumber("PICKUP-" + orderId);
                return t;
            });
            tracking.setCurrentStatus("DELIVERED");
            tracking.setEstimatedDelivery("Delivered & Collected at Hub");
            trackingRepository.save(tracking);
        }

        customerOrderRepository.save(order);

        String hubName = order.getAssignedDistributorName() != null ? order.getAssignedDistributorName() : "Atomy Regional Logistics Hub";
        if (brevoEmailService != null) {
            brevoEmailService.sendPickupDeliveredConfirmation(order, hubName);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP verified! Order successfully marked as DELIVERED / COLLECTED.",
                "order", order
        ));
    }

    private String maskEmailAddress(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String user = parts[0];
        String domain = parts[1];
        if (user.length() <= 2) {
            return user.charAt(0) + "***@" + domain;
        }
        return user.charAt(0) + "***" + user.charAt(user.length() - 1) + "@" + domain;
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
