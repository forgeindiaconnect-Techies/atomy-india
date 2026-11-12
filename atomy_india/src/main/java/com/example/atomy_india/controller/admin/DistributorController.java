package com.example.atomy_india.controller.admin;

import com.example.atomy_india.dto.DispatchOrderRequest;
import com.example.atomy_india.model.*;
import com.example.atomy_india.repository.*;
import com.example.atomy_india.service.AdminService;
import com.example.atomy_india.service.BrevoEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/distributor")
@CrossOrigin(origins = "*")
public class DistributorController {

    private final DistributorRepository distributorRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderTrackingRepository trackingRepository;
    private final AdminService adminService;
    private final ProductRepository productRepository;
    private final DistributorInventoryRepository inventoryRepository;
    private final IndiaPincodeRepository indiaPincodeRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerNotificationRepository notificationRepository;

    @Autowired(required = false)
    private BrevoEmailService brevoEmailService;

    @Autowired(required = false)
    private SupportTicketRepository ticketRepository;

    public DistributorController(DistributorRepository distributorRepository,
                                 CustomerOrderRepository customerOrderRepository,
                                 OrderTrackingRepository trackingRepository,
                                 AdminService adminService,
                                 ProductRepository productRepository,
                                 DistributorInventoryRepository inventoryRepository,
                                 IndiaPincodeRepository indiaPincodeRepository,
                                 OrderItemRepository orderItemRepository,
                                 CustomerNotificationRepository notificationRepository) {
        this.distributorRepository = distributorRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.trackingRepository = trackingRepository;
        this.adminService = adminService;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.indiaPincodeRepository = indiaPincodeRepository;
        this.orderItemRepository = orderItemRepository;
        this.notificationRepository = notificationRepository;
    }

    private Optional<DistributorUser> findDistributor(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return Optional.empty();
        String clean = identifier.trim();
        return distributorRepository.findByDistributorId(clean)
                .or(() -> distributorRepository.findByEmailIgnoreCase(clean))
                .or(() -> distributorRepository.findByPrimaryPincodeAndDistributorRole(clean, "PRIMARY_MANAGER").stream().findFirst())
                .or(() -> distributorRepository.findByPrimaryPincode(clean).stream().findFirst());
    }

    private boolean isSubstituteBlocked(DistributorUser dist) {
        if (dist != null && "SUB_DISTRIBUTOR".equalsIgnoreCase(dist.getDistributorRole()) && dist.getParentHubId() != null) {
            Optional<DistributorUser> parentOpt = findDistributor(dist.getParentHubId());
            if (parentOpt.isPresent()) {
                // If primary parent is NOT on leave, substitute is blocked in STANDBY
                return !parentOpt.get().isOnLeave();
            }
        }
        return false;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam(required = false) String distributorId,
                                        @RequestParam(required = false) String email) {
        String query = (distributorId != null && !distributorId.trim().isEmpty()) ? distributorId : email;
        Optional<DistributorUser> distOpt = findDistributor(query);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found"));
        }
        DistributorUser dist = distOpt.get();

        boolean isSubstituteActive = false;
        String primaryManagerName = null;
        if ("SUB_DISTRIBUTOR".equalsIgnoreCase(dist.getDistributorRole()) && dist.getParentHubId() != null) {
            Optional<DistributorUser> parentOpt = distributorRepository.findByDistributorId(dist.getParentHubId());
            if (parentOpt.isPresent()) {
                DistributorUser parent = parentOpt.get();
                isSubstituteActive = parent.isOnLeave();
                primaryManagerName = parent.getContactPerson();
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("distributorId", dist.getDistributorId());
        resp.put("businessName", dist.getBusinessName());
        resp.put("contactPerson", dist.getContactPerson());
        resp.put("email", dist.getEmail());
        resp.put("phone", dist.getPhone());
        resp.put("assignedPincodes", dist.getAssignedPincodes());
        resp.put("primaryPincode", dist.getPrimaryPincode());
        resp.put("hubAddress", dist.getHubAddress());
        resp.put("city", dist.getCity());
        resp.put("state", dist.getState());
        resp.put("commissionRate", dist.getCommissionRate());
        resp.put("territoryFee", dist.getTerritoryFee());
        resp.put("status", dist.getStatus());
        resp.put("distributorRole", dist.getDistributorRole() != null ? dist.getDistributorRole() : "PRIMARY_MANAGER");
        resp.put("parentHubId", dist.getParentHubId());
        resp.put("parentHubName", dist.getParentHubName());
        resp.put("effectiveHubId", dist.getEffectiveHubId());
        resp.put("onLeave", dist.isOnLeave());
        resp.put("leaveReason", dist.getLeaveReason());
        resp.put("isSubstituteActive", isSubstituteActive);
        resp.put("primaryManagerName", primaryManagerName);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam String distributorId) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();
        List<String> pincodes = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();

        List<CustomerOrder> territoryOrders = customerOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(o -> matchesTerritory(o, dist.getDistributorId(), pincodes))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        long placedCount = 0;
        long processingCount = 0;
        long shippedCount = 0;
        long deliveredCount = 0;
        long delayedCount = 0;
        Set<String> customerEmails = new HashSet<>();

        LocalDateTime now = LocalDateTime.now();

        for (CustomerOrder o : territoryOrders) {
            if (o.getOrderStatus() != CustomerOrder.OrderStatus.CANCELLED) {
                if (o.getTotalAmount() != null) {
                    totalRevenue = totalRevenue.add(o.getTotalAmount());
                }
                if (o.getDistributorCommission() != null) {
                    totalCommission = totalCommission.add(o.getDistributorCommission());
                }
            }

            if (o.getCustomerEmail() != null && !o.getCustomerEmail().trim().isEmpty()) {
                customerEmails.add(o.getCustomerEmail().trim().toLowerCase());
            }

            CustomerOrder.OrderStatus status = o.getOrderStatus();
            if (status == CustomerOrder.OrderStatus.PLACED) placedCount++;
            else if (status == CustomerOrder.OrderStatus.PROCESSING) processingCount++;
            else if (status == CustomerOrder.OrderStatus.SHIPPED || status == CustomerOrder.OrderStatus.OUT_FOR_DELIVERY) shippedCount++;
            else if (status == CustomerOrder.OrderStatus.DELIVERED) deliveredCount++;

            // SLA check
            if (status != CustomerOrder.OrderStatus.DELIVERED && status != CustomerOrder.OrderStatus.CANCELLED) {
                LocalDateTime target = getTargetSlaDate(o);
                if (now.isAfter(target)) {
                    delayedCount++;
                }
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("distributorId", dist.getDistributorId());
        resp.put("businessName", dist.getBusinessName());
        resp.put("contactPerson", dist.getContactPerson());
        resp.put("primaryPincode", dist.getPrimaryPincode());
        resp.put("assignedPincodes", pincodes);
        resp.put("totalOrders", territoryOrders.size());
        resp.put("totalRevenue", totalRevenue);
        resp.put("totalCommission", totalCommission);
        resp.put("commissionRate", dist.getCommissionRate());
        resp.put("placedOrders", placedCount);
        resp.put("processingOrders", processingCount);
        resp.put("shippedOrders", shippedCount);
        resp.put("deliveredOrders", deliveredCount);
        resp.put("delayedOrders", delayedCount);
        resp.put("customerCount", customerEmails.size());
        resp.put("distributorRole", dist.getDistributorRole() != null ? dist.getDistributorRole() : "PRIMARY_MANAGER");
        resp.put("parentHubId", dist.getParentHubId());
        resp.put("parentHubName", dist.getParentHubName());
        resp.put("effectiveHubId", dist.getEffectiveHubId());
        resp.put("onLeave", dist.isOnLeave());
        resp.put("delegatedToId", dist.getDelegatedToId());
        resp.put("delegatedToName", dist.getDelegatedToName());
        resp.put("status", dist.getStatus());

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam String distributorId,
                                       @RequestParam(required = false) String status) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        DistributorUser dist = distOpt.get();
        List<String> pincodes = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();

        List<CustomerOrder> all = customerOrderRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();

        for (CustomerOrder o : all) {
            if (!matchesTerritory(o, dist.getDistributorId(), pincodes)) continue;

            if (status != null && !status.equalsIgnoreCase("ALL")) {
                if (status.equalsIgnoreCase("DELAYED")) {
                    if (o.getOrderStatus() == CustomerOrder.OrderStatus.DELIVERED ||
                        o.getOrderStatus() == CustomerOrder.OrderStatus.CANCELLED ||
                        !LocalDateTime.now().isAfter(getTargetSlaDate(o))) {
                        continue;
                    }
                } else if (!o.getOrderStatus().name().equalsIgnoreCase(status)) {
                    continue;
                }
            }

            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", o.getOrderId());
            orderMap.put("orderId", o.getOrderId());
            orderMap.put("createdAt", o.getCreatedAt());
            orderMap.put("customerName", o.getCustomerName());
            orderMap.put("customerEmail", o.getCustomerEmail());
            orderMap.put("customerPhone", o.getCustomerPhone());
            orderMap.put("shippingAddress", o.getShippingAddress());
            orderMap.put("city", o.getCity());
            orderMap.put("state", o.getState());
            orderMap.put("pincode", o.getPincode());
            orderMap.put("orderStatus", o.getOrderStatus().name());
            orderMap.put("paymentMethod", o.getPaymentMethod().name());
            orderMap.put("paymentStatus", o.getPaymentStatus().name());
            orderMap.put("totalAmount", o.getTotalAmount());
            orderMap.put("shippingFee", o.getShippingFee());
            orderMap.put("assignedDistributorId", o.getAssignedDistributorId());
            orderMap.put("assignedDistributorName", o.getAssignedDistributorName());
            orderMap.put("fulfillmentType", o.getFulfillmentType());
            orderMap.put("pickupStatus", o.getPickupStatus());
            orderMap.put("hubAddress", o.getHubAddress());
            orderMap.put("distributorCommission", o.getDistributorCommission());
            orderMap.put("distributorDispatchStatus", o.getDistributorDispatchStatus());
            orderMap.put("estimatedDeliveryDate", o.getEstimatedDeliveryDate());
            orderMap.put("estimatedDelivery", o.getEstimatedDelivery());
            orderMap.put("items", o.getItems());

            Optional<OrderTracking> tracking = trackingRepository.findFirstByOrderId(o.getOrderId());
            orderMap.put("tracking", tracking.orElse(null));

            result.add(orderMap);
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String distributorId,
            @RequestBody Map<String, String> body) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found"));
        }
        DistributorUser dist = distOpt.get();

        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }

        Optional<CustomerOrder> orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        }
        CustomerOrder order = orderOpt.get();

        List<String> pincodes = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();
        if (!matchesTerritory(order, dist.getDistributorId(), pincodes)) {
            return ResponseEntity.status(403).body(Map.of("error", "Order does not belong to your assigned territory."));
        }

        String statusStr = body.getOrDefault("status", body.get("orderStatus"));
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        CustomerOrder.OrderStatus newStatus;
        try {
            newStatus = CustomerOrder.OrderStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid order status: " + statusStr));
        }

        CustomerOrder updatedOrder = adminService.updateOrderStatus(orderId, newStatus);
        if (updatedOrder != null) {
            if (updatedOrder.getAssignedDistributorId() == null || "CENTRAL_SUPER_HUB".equals(updatedOrder.getAssignedDistributorId())) {
                updatedOrder.setAssignedDistributorId(dist.getDistributorId());
                updatedOrder.setAssignedDistributorName(dist.getBusinessName());
            }
            customerOrderRepository.save(updatedOrder);
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order status updated to " + newStatus.name(),
                "order", updatedOrder
        ));
    }

    @PutMapping("/orders/{orderId}/tracking")
    public ResponseEntity<?> updateTracking(@PathVariable String orderId,
                                            @RequestParam String distributorId,
                                            @RequestBody DispatchOrderRequest req) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found"));
        }
        DistributorUser dist = distOpt.get();

        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }

        Optional<CustomerOrder> orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        }
        CustomerOrder order = orderOpt.get();

        // Ensure order belongs to this distributor territory
        List<String> pincodes = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();
        if (!matchesTerritory(order, dist.getDistributorId(), pincodes)) {
            return ResponseEntity.status(403).body(Map.of("error", "Order does not belong to your assigned territory."));
        }

        // Set default courier partner if none supplied
        if (req.getCourierPartner() == null || req.getCourierPartner().trim().isEmpty()) {
            req.setCourierPartner("Blue Dart Express");
        }
        if (req.getInitialLocation() == null || req.getInitialLocation().trim().isEmpty()) {
            req.setInitialLocation(dist.getHubAddress() != null ? dist.getHubAddress() : dist.getCity() + " Hub");
        }

        // Dispatch or update tracking
        OrderTracking tracking = adminService.dispatchOrder(orderId, req);

        // If a specific status was requested (e.g. DELIVERED, OUT_FOR_DELIVERY, PROCESSING), apply it
        String targetStatusStr = req.getCurrentStatus() != null ? req.getCurrentStatus() : req.getOrderStatus();
        if (targetStatusStr != null && !targetStatusStr.trim().isEmpty()) {
            try {
                CustomerOrder.OrderStatus targetStatus = CustomerOrder.OrderStatus.valueOf(targetStatusStr.trim().toUpperCase());
                if (targetStatus != CustomerOrder.OrderStatus.SHIPPED) {
                    adminService.updateOrderStatus(orderId, targetStatus);
                    tracking.setCurrentStatus(targetStatus.name());
                    trackingRepository.save(tracking);
                }
            } catch (Exception ignored) {}
        }

        // Update distributor dispatch status tag on order
        CustomerOrder currentOrder = customerOrderRepository.findById(orderId).orElse(order);
        if (currentOrder.getAssignedDistributorId() == null || "CENTRAL_SUPER_HUB".equals(currentOrder.getAssignedDistributorId())) {
            currentOrder.setAssignedDistributorId(dist.getDistributorId());
            currentOrder.setAssignedDistributorName(dist.getBusinessName());
        }
        currentOrder.setDistributorDispatchStatus("DISPATCHED_BY_DISTRIBUTOR");
        customerOrderRepository.save(currentOrder);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order tracking updated successfully by distributor hub.",
                "tracking", tracking
        ));
    }

    @PutMapping("/orders/{orderId}/pickup-status")
    public ResponseEntity<?> updatePickupStatus(
            @PathVariable String orderId,
            @RequestParam String distributorId,
            @RequestBody Map<String, String> payload) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();
        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }
        Optional<CustomerOrder> orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        }
        CustomerOrder order = orderOpt.get();
        String newPickupStatus = payload.get("pickupStatus"); // "READY_FOR_PICKUP" or "COLLECTED"
        if ("READY_FOR_PICKUP".equalsIgnoreCase(newPickupStatus)) {
            order.setPickupStatus("READY_FOR_PICKUP");
            order.setOrderStatus(CustomerOrder.OrderStatus.PROCESSING);
            order.setDistributorDispatchStatus("PACKED_READY_FOR_PICKUP");
        } else if ("COLLECTED".equalsIgnoreCase(newPickupStatus)) {
            order.setPickupStatus("COLLECTED");
            order.setOrderStatus(CustomerOrder.OrderStatus.DELIVERED);
            order.setDistributorDispatchStatus("COLLECTED_BY_CUSTOMER");
        }
        customerOrderRepository.save(order);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order pickup status updated to " + newPickupStatus,
                "order", order
        ));
    }

    @PostMapping("/orders/{orderId}/send-pickup-otp")
    public ResponseEntity<?> sendPickupOtp(
            @PathVariable String orderId,
            @RequestParam(required = false) String distributorId) {
        Optional<CustomerOrder> orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        }
        CustomerOrder order = orderOpt.get();

        String customerEmail = order.getCustomerEmail();
        if (customerEmail == null || customerEmail.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "This order does not have a registered customer email address for OTP delivery."));
        }

        if (order.getOrderStatus() == CustomerOrder.OrderStatus.DELIVERED || "COLLECTED".equalsIgnoreCase(order.getPickupStatus())) {
            return ResponseEntity.status(400).body(Map.of("error", "This parcel has already been collected and marked Delivered."));
        }

        // Generate 6-digit secure numeric OTP
        int code = 100000 + new java.security.SecureRandom().nextInt(900000);
        String otp = String.valueOf(code);
        order.setPickupOtp(otp);
        order.setPickupOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        order.setPickupOtpAttempts(0);
        customerOrderRepository.save(order);

        String hubName = order.getAssignedDistributorName();
        if (hubName == null || hubName.trim().isEmpty() || "Central Super Admin Hub".equalsIgnoreCase(hubName)) {
            if (distributorId != null) {
                findDistributor(distributorId).ifPresent(d -> {
                    if (d.getBusinessName() != null) order.setAssignedDistributorName(d.getBusinessName());
                });
            }
            hubName = order.getAssignedDistributorName() != null ? order.getAssignedDistributorName() : "Atomy Regional Logistics Hub";
        }

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

    @PostMapping("/orders/{orderId}/verify-pickup-otp")
    public ResponseEntity<?> verifyPickupOtp(
            @PathVariable String orderId,
            @RequestParam(required = false) String distributorId,
            @RequestBody Map<String, String> payload) {
        Optional<CustomerOrder> orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        }
        CustomerOrder order = orderOpt.get();

        String inputOtp = payload != null ? payload.get("otp") : null;
        if (inputOtp == null || inputOtp.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Please enter the 6-digit verification OTP provided by the customer."));
        }

        if (order.getPickupOtp() == null || order.getPickupOtp().trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "No active OTP generated for this order. Please click 'Send Verification OTP' first."));
        }

        int attempts = order.getPickupOtpAttempts() != null ? order.getPickupOtpAttempts() : 0;
        if (attempts >= 5) {
            return ResponseEntity.status(400).body(Map.of("error", "Maximum verification attempts exceeded (5/5). Please request a new OTP."));
        }

        if (order.getPickupOtpExpiresAt() != null && LocalDateTime.now().isAfter(order.getPickupOtpExpiresAt())) {
            return ResponseEntity.status(400).body(Map.of("error", "Verification OTP has expired (10-minute limit). Please trigger a new OTP."));
        }

        if (!order.getPickupOtp().trim().equals(inputOtp.trim())) {
            int newAttempts = attempts + 1;
            order.setPickupOtpAttempts(newAttempts);
            customerOrderRepository.save(order);
            int remaining = Math.max(0, 5 - newAttempts);
            return ResponseEntity.status(400).body(Map.of(
                    "error", "Invalid OTP entered. " + remaining + " attempt(s) remaining.",
                    "remainingAttempts", remaining
            ));
        }

        // OTP Verified Successfully! Advance to Stage 4: DELIVERED / COLLECTED
        order.setPickupOtp(null);
        order.setPickupOtpExpiresAt(null);
        order.setPickupOtpAttempts(0);
        order.setPickupVerifiedAt(LocalDateTime.now());
        order.setPickupVerifiedBy(distributorId != null ? distributorId : "Hub Counter Staff");
        order.setPickupStatus("COLLECTED");
        order.setOrderStatus(CustomerOrder.OrderStatus.DELIVERED);
        order.setDistributorDispatchStatus("COLLECTED_BY_CUSTOMER");
        order.setDeliveredAt(LocalDateTime.now());

        // Update tracking checkpoints
        OrderTracking tracking = trackingRepository.findByOrderId(orderId).orElseGet(() -> {
            OrderTracking t = new OrderTracking();
            t.setOrderId(orderId);
            t.setCourierPartner("Regional Hub Self-Pickup");
            t.setTrackingNumber("PICKUP-" + orderId);
            return t;
        });
        tracking.setCurrentStatus("DELIVERED");
        tracking.setEstimatedDelivery("Delivered & Collected at Hub");
        appendTrackingCheckpoint(tracking, "DELIVERED", order.getHubAddress() != null ? order.getHubAddress() : "Regional Hub Counter", "Customer OTP verified in-person at hub counter. Parcel handed over successfully.");
        trackingRepository.save(tracking);

        customerOrderRepository.save(order);

        // Send pickup success confirmation email
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

    private void appendTrackingCheckpoint(OrderTracking tracking, String status, String location, String desc) {
        String safeDesc = desc != null ? desc.replace("\"", "\\\"") : "";
        String safeLoc = location != null ? location.replace("\"", "\\\"") : "";
        String newEntry = "{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":\"" + status
                + "\",\"location\":\"" + safeLoc
                + "\",\"description\":\"" + safeDesc + "\"}";
        String json = tracking.getCheckpointsJson();
        if (json == null || json.trim().isEmpty() || json.equals("[]")) {
            tracking.setCheckpointsJson("[" + newEntry + "]");
        } else if (json.endsWith("]")) {
            tracking.setCheckpointsJson(json.substring(0, json.length() - 1) + "," + newEntry + "]");
        }
    }

    private void restockOrderInventory(CustomerOrder order, String distId) {
        List<OrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            items = orderItemRepository.findAll().stream()
                    .filter(i -> order.getOrderId().equals(i.getOrderId()))
                    .collect(Collectors.toList());
        }
        if (items != null) {
            for (OrderItem oi : items) {
                String pId = oi.getProductId();
                int qty = oi.getQuantity() > 0 ? oi.getQuantity() : 1;
                inventoryRepository.findByDistributorIdAndProductId(distId, pId).ifPresentOrElse(di -> {
                    di.setStockQuantity(di.getStockQuantity() + qty);
                    di.setAvailable(true);
                    di.setUpdatedAt(LocalDateTime.now());
                    inventoryRepository.save(di);
                }, () -> {
                    DistributorInventory di = new DistributorInventory(distId, pId, qty);
                    di.setAvailable(true);
                    di.setUpdatedAt(LocalDateTime.now());
                    inventoryRepository.save(di);
                });
            }
        }
    }

    @PostMapping("/orders/{orderId}/refund")
    public ResponseEntity<?> processRefund(
            @PathVariable String orderId,
            @RequestParam String distributorId,
            @RequestBody(required = false) Map<String, Object> body) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found"));
        }
        DistributorUser dist = distOpt.get();

        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }

        Optional<CustomerOrder> orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        }
        CustomerOrder order = orderOpt.get();

        List<String> pincodes = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();
        if (!matchesTerritory(order, dist.getDistributorId(), pincodes)) {
            return ResponseEntity.status(403).body(Map.of("error", "Order does not belong to your assigned territory."));
        }

        String reason = (body != null && body.get("reason") != null && !body.get("reason").toString().trim().isEmpty())
                ? body.get("reason").toString().trim()
                : "Customer returned product to regional hub";
        boolean restock = (body == null || body.get("restockInventory") == null)
                || Boolean.parseBoolean(body.get("restockInventory").toString());

        if (restock && order.getOrderStatus() != CustomerOrder.OrderStatus.CANCELLED) {
            restockOrderInventory(order, dist.getDistributorId());
        }

        order.setOrderStatus(CustomerOrder.OrderStatus.CANCELLED);
        order.setPaymentStatus(CustomerOrder.PaymentStatus.REFUNDED);
        order.setReturnStatus("RETURNED_AND_REFUNDED");
        order.setReturnReason(reason);
        order.setDistributorCommission(BigDecimal.ZERO);
        order.setUpdatedAt(LocalDateTime.now());
        CustomerOrder savedOrder = customerOrderRepository.save(order);

        // Update tracking checkpoints
        Optional<OrderTracking> trOpt = trackingRepository.findFirstByOrderId(orderId);
        if (trOpt.isPresent()) {
            OrderTracking tracking = trOpt.get();
            tracking.setCurrentStatus("REFUNDED");
            String hubLoc = dist.getHubAddress() != null && !dist.getHubAddress().trim().isEmpty() ? dist.getHubAddress() : dist.getCity() + " Hub";
            tracking.setCurrentLocation(hubLoc);
            appendTrackingCheckpoint(tracking, "REFUNDED", hubLoc,
                    "Return accepted and refund processed by Regional Hub (" + dist.getBusinessName() + "). Note: " + reason);
            trackingRepository.save(tracking);
        }

        // Notify customer
        if (savedOrder.getCustomerEmail() != null && !savedOrder.getCustomerEmail().trim().isEmpty()) {
            try {
                notificationRepository.save(new CustomerNotification(
                        savedOrder.getCustomerEmail().trim().toLowerCase(),
                        "Refund Processed for Order #" + orderId,
                        "Your return has been received and refund approved by the local hub (" + dist.getBusinessName() + "). Reason: " + reason,
                        "order_refunded",
                        orderId
                ));
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order #" + orderId + " has been marked as RETURNED & REFUNDED. Hub inventory restocked.",
                "order", savedOrder
        ));
    }

    @PostMapping("/orders/{orderId}/replacement")
    public ResponseEntity<?> processReplacement(
            @PathVariable String orderId,
            @RequestParam String distributorId,
            @RequestBody(required = false) Map<String, Object> body) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found"));
        }
        DistributorUser dist = distOpt.get();

        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }

        Optional<CustomerOrder> orderOpt = customerOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found: " + orderId));
        }
        CustomerOrder order = orderOpt.get();

        List<String> pincodes = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();
        if (!matchesTerritory(order, dist.getDistributorId(), pincodes)) {
            return ResponseEntity.status(403).body(Map.of("error", "Order does not belong to your assigned territory."));
        }

        String reason = (body != null && body.get("reason") != null && !body.get("reason").toString().trim().isEmpty())
                ? body.get("reason").toString().trim()
                : "Damaged / defective item replaced";
        String notes = (body != null && body.get("notes") != null) ? body.get("notes").toString().trim() : "";
        String productId = (body != null && body.get("productId") != null) ? body.get("productId").toString().trim() : null;
        int quantity = 1;
        if (body != null && body.get("quantity") != null) {
            try {
                quantity = Integer.parseInt(body.get("quantity").toString());
            } catch (Exception ignored) {}
        }

        List<OrderItem> itemsToReplace = new ArrayList<>();
        List<OrderItem> allItems = order.getItems();
        if (allItems == null || allItems.isEmpty()) {
            allItems = orderItemRepository.findAll().stream()
                    .filter(i -> order.getOrderId().equals(i.getOrderId()))
                    .collect(Collectors.toList());
        }

        if (productId != null && !productId.isEmpty()) {
            for (OrderItem it : allItems) {
                if (productId.equalsIgnoreCase(it.getProductId())) {
                    itemsToReplace.add(it);
                    break;
                }
            }
        } else {
            itemsToReplace.addAll(allItems);
        }

        if (itemsToReplace.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No matching product item found in this order to replace."));
        }

        // Verify stock in distributor hub inventory
        for (OrderItem it : itemsToReplace) {
            int needQty = (productId != null) ? quantity : (it.getQuantity() > 0 ? it.getQuantity() : 1);
            Optional<DistributorInventory> diOpt = inventoryRepository.findByDistributorIdAndProductId(dist.getDistributorId(), it.getProductId());
            int available = diOpt.map(DistributorInventory::getStockQuantity).orElse(0);
            if (available < needQty) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Insufficient hub inventory for " + it.getProductName() + " (Available: " + available + ", Required: " + needQty + "). Please restock first."
                ));
            }
        }

        // Deduct replacement stock from hub inventory
        for (OrderItem it : itemsToReplace) {
            int needQty = (productId != null) ? quantity : (it.getQuantity() > 0 ? it.getQuantity() : 1);
            inventoryRepository.findByDistributorIdAndProductId(dist.getDistributorId(), it.getProductId()).ifPresent(di -> {
                int updated = Math.max(0, di.getStockQuantity() - needQty);
                di.setStockQuantity(updated);
                di.setAvailable(updated > 0);
                di.setUpdatedAt(LocalDateTime.now());
                inventoryRepository.save(di);
            });
        }

        // Update Order record
        order.setReturnStatus("REPLACEMENT_DISPATCHED");
        order.setReplacementNotes(reason + (notes.isEmpty() ? "" : " | Note: " + notes));
        order.setDistributorDispatchStatus("REPLACEMENT_DISPATCHED");
        order.setOrderStatus(CustomerOrder.OrderStatus.SHIPPED);
        order.setUpdatedAt(LocalDateTime.now());
        CustomerOrder savedOrder = customerOrderRepository.save(order);

        // Update tracking checkpoints
        Optional<OrderTracking> trOpt = trackingRepository.findFirstByOrderId(orderId);
        if (trOpt.isPresent()) {
            OrderTracking tracking = trOpt.get();
            tracking.setCurrentStatus("REPLACEMENT_IN_TRANSIT");
            String hubLoc = dist.getHubAddress() != null && !dist.getHubAddress().trim().isEmpty() ? dist.getHubAddress() : dist.getCity() + " Hub";
            tracking.setCurrentLocation(hubLoc);
            appendTrackingCheckpoint(tracking, "REPLACEMENT_DISPATCHED", hubLoc,
                    "Replacement dispatched from Regional Hub (" + dist.getBusinessName() + "). Reason: " + reason);
            trackingRepository.save(tracking);
        }

        // Notify customer
        if (savedOrder.getCustomerEmail() != null && !savedOrder.getCustomerEmail().trim().isEmpty()) {
            try {
                notificationRepository.save(new CustomerNotification(
                        savedOrder.getCustomerEmail().trim().toLowerCase(),
                        "Replacement Dispatched for Order #" + orderId,
                        "Your regional hub (" + dist.getBusinessName() + ") has dispatched a replacement unit. Reason: " + reason,
                        "order_replacement",
                        orderId
                ));
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Replacement successfully dispatched. Hub inventory updated.",
                "order", savedOrder
        ));
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomers(@RequestParam String distributorId) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        DistributorUser dist = distOpt.get();
        List<String> pincodes = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();

        String primaryPin = dist.getPrimaryPincode() != null ? dist.getPrimaryPincode().trim() : "635002";
        List<CustomerOrder> orders = customerOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(o -> matchesTerritory(o, dist.getDistributorId(), pincodes))
                .filter(o -> primaryPin.equals(o.getPincode() != null ? o.getPincode().trim() : ""))
                .collect(Collectors.toList());

        Map<String, Map<String, Object>> customerMap = new LinkedHashMap<>();
        for (CustomerOrder o : orders) {
            String email = (o.getCustomerEmail() != null ? o.getCustomerEmail().trim().toLowerCase() : "unknown@atomy.com");
            Map<String, Object> cust = customerMap.computeIfAbsent(email, k -> {
                Map<String, Object> map = new HashMap<>();
                map.put("email", email);
                map.put("name", o.getCustomerName());
                map.put("phone", o.getCustomerPhone());
                map.put("city", o.getCity());
                map.put("state", o.getState());
                map.put("pincode", o.getPincode());
                map.put("firstOrderAt", o.getCreatedAt());
                map.put("totalOrders", 0);
                map.put("totalSpent", BigDecimal.ZERO);
                return map;
            });

            cust.put("totalOrders", ((int) cust.get("totalOrders")) + 1);
            if (o.getTotalAmount() != null) {
                BigDecimal spent = (BigDecimal) cust.get("totalSpent");
                cust.put("totalSpent", spent.add(o.getTotalAmount()));
            }
        }

        return ResponseEntity.ok(new ArrayList<>(customerMap.values()));
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getDistributorInventory(@RequestParam String distributorId) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();
        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }
        String distId = dist.getEffectiveHubId();
        String pincode = dist.getPrimaryPincode() != null ? dist.getPrimaryPincode() : "110001";

        List<Product> catalog = productRepository.findByActiveTrue();
        Map<String, Product> productMap = catalog.stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

        List<DistributorInventory> existing = inventoryRepository.findByDistributorId(distId);

        // Auto-provision initial stock for distributor if empty
        if (existing.isEmpty()) {
            for (Product p : catalog) {
                int defaultQty = 50;
                DistributorInventory inv = new DistributorInventory(distId, pincode, p.getId(), p.getName(), p.getId(), defaultQty, 10);
                existing.add(inv);
            }
            inventoryRepository.saveAll(existing);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (DistributorInventory inv : existing) {
            if (!inv.isAvailable()) continue;
            Product p = productMap.get(inv.getProductId());

            BigDecimal price = (p != null && p.getPrice() != null && p.getPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? p.getPrice()
                    : (p != null && p.getOriginalPrice() != null ? p.getOriginalPrice() : BigDecimal.ZERO);
            BigDecimal mrp = (p != null && p.getOriginalPrice() != null && p.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? p.getOriginalPrice()
                    : price;
            int discount = (p != null && p.getDiscountPercent() != null) ? p.getDiscountPercent() : 0;
            if (discount <= 0 && mrp.compareTo(BigDecimal.ZERO) > 0 && price.compareTo(BigDecimal.ZERO) > 0 && mrp.compareTo(price) > 0) {
                discount = mrp.subtract(price).multiply(BigDecimal.valueOf(100)).divide(mrp, java.math.RoundingMode.HALF_UP).intValue();
            }

            Map<String, Object> item = new HashMap<>();
            item.put("id", inv.getProductId());
            item.put("productId", inv.getProductId());
            item.put("name", p != null ? p.getName() : inv.getProductName());
            item.put("categoryId", p != null ? p.getCategoryId() : "health");
            item.put("price", price);
            item.put("originalPrice", mrp);
            item.put("discountPercent", discount);
            item.put("dpPrice", p != null ? p.getDpPrice() : null);
            item.put("image", p != null ? p.getImage() : null);
            item.put("pv", p != null ? p.getPv() : 0);
            item.put("stockQuantity", inv.getStockQuantity());
            item.put("lowStockThreshold", inv.getLowStockThreshold());
            item.put("isAvailable", inv.isAvailable());
            item.put("distributorId", distId);
            item.put("pincode", pincode);
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/available-products")
    public ResponseEntity<?> getAvailableProducts(@RequestParam String distributorId) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();
        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }
        String distId = dist.getEffectiveHubId();

        List<Product> catalog = productRepository.findByActiveTrue();
        List<DistributorInventory> existing = inventoryRepository.findByDistributorId(distId);
        Set<String> stockedProductIds = existing.stream()
                .filter(DistributorInventory::isAvailable)
                .map(DistributorInventory::getProductId)
                .collect(Collectors.toSet());

        List<Product> availableToAdd = catalog.stream()
                .filter(p -> !stockedProductIds.contains(p.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(availableToAdd);
    }

    @PostMapping("/inventory/{productId}")
    public ResponseEntity<?> addProductToDistributorInventory(@PathVariable String productId,
                                                              @RequestParam String distributorId,
                                                              @RequestBody(required = false) Map<String, Object> body) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();
        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }
        String distId = dist.getEffectiveHubId();
        String pincode = dist.getPrimaryPincode() != null ? dist.getPrimaryPincode() : "110001";

        int qty = 25;
        if (body != null && body.get("stockQuantity") != null) {
            qty = Integer.parseInt(body.get("stockQuantity").toString());
        }
        int threshold = 10;
        if (body != null && body.get("lowStockThreshold") != null) {
            threshold = Integer.parseInt(body.get("lowStockThreshold").toString());
        }

        Optional<Product> prodOpt = productRepository.findById(productId);
        String pName = prodOpt.map(Product::getName).orElse(productId);

        DistributorInventory inv = inventoryRepository.findByDistributorIdAndProductId(distId, productId)
                .orElseGet(() -> new DistributorInventory(distId, pincode, productId, pName, productId, 0, 10));

        inv.setStockQuantity(qty);
        inv.setLowStockThreshold(threshold);
        inv.setAvailable(true);
        DistributorInventory saved = inventoryRepository.save(inv);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/inventory/{productId}")
    public ResponseEntity<?> removeProductFromDistributorInventory(@PathVariable String productId,
                                                                   @RequestParam String distributorId) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();
        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }
        String distId = dist.getEffectiveHubId();

        inventoryRepository.findByDistributorIdAndProductId(distId, productId).ifPresent(inv -> {
            inv.setAvailable(false);
            inv.setStockQuantity(0);
            inventoryRepository.save(inv);
        });

        return ResponseEntity.ok(Map.of("message", "Product removed from regional inventory"));
    }

    @PutMapping("/inventory/{productId}")
    public ResponseEntity<?> updateDistributorStock(@PathVariable String productId,
                                                    @RequestParam String distributorId,
                                                    @RequestBody Map<String, Object> body) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();
        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.status(403).body(Map.of("error", "Operations locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty."));
        }
        String distId = dist.getEffectiveHubId();
        String pincode = dist.getPrimaryPincode() != null ? dist.getPrimaryPincode() : "110001";

        int qty = 0;
        if (body.get("stockQuantity") != null) {
            qty = Integer.parseInt(body.get("stockQuantity").toString());
        }
        int threshold = 10;
        if (body.get("lowStockThreshold") != null) {
            threshold = Integer.parseInt(body.get("lowStockThreshold").toString());
        }

        DistributorInventory inv = inventoryRepository.findByDistributorIdAndProductId(distId, productId)
                .orElseGet(() -> {
                    String pName = productId;
                    Optional<Product> prodOpt = productRepository.findById(productId);
                    if (prodOpt.isPresent()) pName = prodOpt.get().getName();
                    return new DistributorInventory(distId, pincode, productId, pName, productId, 0, 10);
                });

        inv.updateStock(qty, threshold);
        DistributorInventory saved = inventoryRepository.save(inv);
        return ResponseEntity.ok(saved);
    }

    private boolean matchesTerritory(CustomerOrder o, String distId, List<String> assignedPincodes) {
        if (o == null || distId == null) return false;
        Optional<DistributorUser> distOpt = findDistributor(distId);
        if (distOpt.isEmpty()) return false;
        DistributorUser dist = distOpt.get();

        Set<String> validPins = new HashSet<>();
        if (dist.getPrimaryPincode() != null && !dist.getPrimaryPincode().trim().isEmpty()) {
            validPins.add(dist.getPrimaryPincode().trim());
        }
        if (assignedPincodes != null) {
            for (String p : assignedPincodes) {
                if (p != null && !p.trim().isEmpty()) validPins.add(p.trim());
            }
        }
        if (dist.getAssignedPincodes() != null) {
            for (String p : dist.getAssignedPincodes()) {
                if (p != null && !p.trim().isEmpty()) validPins.add(p.trim());
            }
        }

        String orderPin = o.getPincode() != null ? o.getPincode().trim() : "";
        if (orderPin.isEmpty()) return false;

        // Strict PIN match: each pin code is distinct (e.g. 635002 vs 635122)
        if (validPins.contains(orderPin)) {
            return true;
        }

        // Shared Hub check: if assigned directly to distributor or parent hub
        String assignedDist = o.getAssignedDistributorId();
        if (assignedDist != null) {
            if (assignedDist.equalsIgnoreCase(dist.getDistributorId()) || 
                assignedDist.equalsIgnoreCase(dist.getEffectiveHubId())) {
                return true;
            }
        }

        // Also check if IndiaPincode master explicitly assigned this pin
        Optional<IndiaPincode> pinDoc = indiaPincodeRepository.findByPincode(orderPin);
        if (pinDoc.isPresent()) {
            String pDist = pinDoc.get().getAssignedDistributorId();
            if (pDist != null && (pDist.equalsIgnoreCase(dist.getDistributorId()) || pDist.equalsIgnoreCase(dist.getEffectiveHubId()))) {
                return true;
            }
        }

        return false;
    }

    @GetMapping("/team")
    public ResponseEntity<?> getHubTeam(@RequestParam String distributorId) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();
        String effectiveHub = dist.getEffectiveHubId();

        Optional<DistributorUser> primaryOpt = distributorRepository.findByDistributorId(effectiveHub);
        List<DistributorUser> coManagers = distributorRepository.findByParentHubId(effectiveHub);

        List<DistributorUser> allMembers = new ArrayList<>();
        primaryOpt.ifPresent(allMembers::add);
        for (DistributorUser sub : coManagers) {
            if (primaryOpt.isEmpty() || !sub.getDistributorId().equals(primaryOpt.get().getDistributorId())) {
                allMembers.add(sub);
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("effectiveHubId", effectiveHub);
        resp.put("primaryManager", primaryOpt.orElse(null));
        resp.put("coManagers", coManagers);
        resp.put("allMembers", allMembers);
        resp.put("currentRequesterRole", dist.getDistributorRole());

        return ResponseEntity.ok(resp);
    }

    @PutMapping("/leave-status")
    public ResponseEntity<?> toggleLeaveStatus(@RequestParam String distributorId, @RequestBody Map<String, Object> body) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found: " + distributorId));
        }
        DistributorUser dist = distOpt.get();

        boolean onLeave = body.get("onLeave") != null && Boolean.parseBoolean(body.get("onLeave").toString());
        String delegatedToId = body.get("delegatedToId") != null ? body.get("delegatedToId").toString() : null;
        String delegatedToName = body.get("delegatedToName") != null ? body.get("delegatedToName").toString() : null;
        String leaveReason = body.get("leaveReason") != null ? body.get("leaveReason").toString() : null;

        dist.setOnLeave(onLeave);
        dist.setDelegatedToId(delegatedToId);
        dist.setDelegatedToName(delegatedToName);
        dist.setLeaveReason(onLeave ? leaveReason : null);
        if (onLeave) {
            dist.setStatus("ON_LEAVE");
        } else {
            dist.setStatus("ACTIVE");
        }
        distributorRepository.save(dist);

        // Synchronize substitute status: exactly ONE manager is ACTIVE at any time
        if (!"SUB_DISTRIBUTOR".equalsIgnoreCase(dist.getDistributorRole())) {
            List<DistributorUser> subs = distributorRepository.findByParentHubId(dist.getDistributorId());
            for (DistributorUser sub : subs) {
                if (onLeave) {
                    sub.setStatus("ACTIVE");
                } else {
                    sub.setStatus("STANDBY");
                }
                distributorRepository.save(sub);
            }
        }

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("success", true);
        responseMap.put("message", onLeave ? "Hub marked ON LEAVE; dispatches delegated to " + (delegatedToName != null ? delegatedToName : "Co-Manager") : "Hub returned to ACTIVE duty.");
        responseMap.put("onLeave", dist.isOnLeave());
        responseMap.put("status", dist.getStatus());
        responseMap.put("delegatedToName", dist.getDelegatedToName() != null ? dist.getDelegatedToName() : "");
        responseMap.put("leaveReason", dist.getLeaveReason() != null ? dist.getLeaveReason() : "");

        return ResponseEntity.ok(responseMap);
    }

    private LocalDateTime getTargetSlaDate(CustomerOrder o) {
        LocalDateTime base = (o.getCreatedAt() != null) ? o.getCreatedAt() : LocalDateTime.now();
        if (o.getOrderId() != null && o.getOrderId().matches("^ORD-\\d{8}.*")) {
            try {
                String ymd = o.getOrderId().substring(4, 12);
                int y = Integer.parseInt(ymd.substring(0, 4));
                int m = Integer.parseInt(ymd.substring(4, 6));
                int d = Integer.parseInt(ymd.substring(6, 8));
                base = LocalDateTime.of(y, m, d, 12, 0);
            } catch (Exception ignored) {}
        }
        return base.plusDays(2);
    }

    @GetMapping("/tickets")
    public ResponseEntity<?> getDistributorTickets(@RequestParam String distributorId) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found"));
        }
        DistributorUser dist = distOpt.get();
        String primaryDistId = dist.getDistributorId();
        List<String> assignedPins = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();
        String primaryPin = dist.getPrimaryPincode();

        if (isSubstituteBlocked(dist)) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<CustomerOrder> distOrders = customerOrderRepository.findByAssignedDistributorIdOrderByCreatedAtDesc(primaryDistId);
        Set<String> territoryOrderIds = distOrders.stream().map(CustomerOrder::getOrderId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<String> territoryEmails = distOrders.stream().map(CustomerOrder::getCustomerEmail).filter(Objects::nonNull).map(String::toLowerCase).collect(Collectors.toSet());

        List<SupportTicket> allTickets = (ticketRepository != null) ? ticketRepository.findAllByOrderByCreatedAtDesc() : Collections.emptyList();

        List<SupportTicket> matched = allTickets.stream().filter(t -> {
            if (primaryDistId.equalsIgnoreCase(t.getAssignedDistributorId())) return true;
            if (dist.getParentHubId() != null && dist.getParentHubId().equalsIgnoreCase(t.getAssignedDistributorId())) return true;
            if (t.getOrderId() != null && territoryOrderIds.contains(t.getOrderId())) return true;
            if (t.getCustomerEmail() != null && territoryEmails.contains(t.getCustomerEmail().toLowerCase())) return true;
            if (t.getPincode() != null && (assignedPins.contains(t.getPincode()) || (primaryPin != null && primaryPin.equals(t.getPincode())))) return true;
            return false;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(matched);
    }

    @PostMapping("/tickets/{ticketId}/reply")
    public ResponseEntity<?> replyDistributorTicket(@PathVariable String ticketId, @RequestBody Map<String, String> body) {
        String message = body.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        return ResponseEntity.ok(adminService.adminReplyToTicket(ticketId, message.trim()));
    }

    @PutMapping("/tickets/{ticketId}/status")
    public ResponseEntity<?> updateDistributorTicketStatus(@PathVariable String ticketId, @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status cannot be empty"));
        }
        try {
            SupportTicket.TicketStatus status = SupportTicket.TicketStatus.valueOf(statusStr.trim().toUpperCase());
            return ResponseEntity.ok(adminService.updateTicketStatus(ticketId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + statusStr));
        }
    }
}
