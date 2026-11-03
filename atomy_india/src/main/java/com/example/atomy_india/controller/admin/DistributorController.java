package com.example.atomy_india.controller.admin;

import com.example.atomy_india.dto.DispatchOrderRequest;
import com.example.atomy_india.model.*;
import com.example.atomy_india.repository.*;
import com.example.atomy_india.service.AdminService;
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

    public DistributorController(DistributorRepository distributorRepository,
                                 CustomerOrderRepository customerOrderRepository,
                                 OrderTrackingRepository trackingRepository,
                                 AdminService adminService,
                                 ProductRepository productRepository,
                                 DistributorInventoryRepository inventoryRepository,
                                 IndiaPincodeRepository indiaPincodeRepository) {
        this.distributorRepository = distributorRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.trackingRepository = trackingRepository;
        this.adminService = adminService;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.indiaPincodeRepository = indiaPincodeRepository;
    }

    private Optional<DistributorUser> findDistributor(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return Optional.empty();
        String clean = identifier.trim();
        return distributorRepository.findByDistributorId(clean)
                .or(() -> distributorRepository.findByEmailIgnoreCase(clean))
                .or(() -> distributorRepository.findByPrimaryPincode(clean));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam(required = false) String distributorId,
                                        @RequestParam(required = false) String email) {
        String query = (distributorId != null && !distributorId.trim().isEmpty()) ? distributorId : email;
        Optional<DistributorUser> distOpt = findDistributor(query);
        if (distOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Distributor not found"));
        }
        return ResponseEntity.ok(distOpt.get());
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

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomers(@RequestParam String distributorId) {
        Optional<DistributorUser> distOpt = findDistributor(distributorId);
        if (distOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        DistributorUser dist = distOpt.get();
        List<String> pincodes = dist.getAssignedPincodes() != null ? dist.getAssignedPincodes() : Collections.emptyList();

        List<CustomerOrder> orders = customerOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(o -> matchesTerritory(o, dist.getDistributorId(), pincodes))
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
        String distId = dist.getDistributorId();
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
        String distId = dist.getDistributorId();

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
        String distId = dist.getDistributorId();
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
        String distId = dist.getDistributorId();

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
        String distId = dist.getDistributorId();
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
        if (o == null) return false;
        if (distId != null && distId.equalsIgnoreCase(o.getAssignedDistributorId())) {
            return true;
        }
        if (o.getPincode() != null) {
            String p = o.getPincode().trim();
            if (assignedPincodes != null && assignedPincodes.contains(p)) {
                return true;
            }
            // Check in indiaPincode master if assigned to this distributor
            Optional<IndiaPincode> pinDoc = indiaPincodeRepository.findByPincode(p);
            if (pinDoc.isPresent() && distId != null && distId.equalsIgnoreCase(pinDoc.get().getAssignedDistributorId())) {
                return true;
            }
        }
        // 3-digit postal zone prefix match (e.g. 635xxx, 110xxx, 560xxx) or city match
        if (distId != null) {
            Optional<DistributorUser> distOpt = findDistributor(distId);
            if (distOpt.isPresent()) {
                DistributorUser dist = distOpt.get();
                String primaryPin = dist.getPrimaryPincode();
                if (o.getPincode() != null && primaryPin != null) {
                    String p = o.getPincode().trim();
                    String pp = primaryPin.trim();
                    if (p.length() >= 3 && pp.length() >= 3 && p.substring(0, 3).equals(pp.substring(0, 3))) {
                        return true;
                    }
                }
                if (o.getCity() != null && dist.getCity() != null) {
                    String oc = o.getCity().trim().toLowerCase();
                    String dc = dist.getCity().trim().toLowerCase();
                    if (!oc.isEmpty() && (oc.equals(dc) || oc.contains(dc) || dc.contains(oc))) {
                        return true;
                    }
                }
            }
        }
        return false;
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
}
