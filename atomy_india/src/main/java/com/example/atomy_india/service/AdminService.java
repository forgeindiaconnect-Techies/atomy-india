package com.example.atomy_india.service;

import com.example.atomy_india.dto.AddCheckpointRequest;
import com.example.atomy_india.dto.DashboardStatsResponse;
import com.example.atomy_india.dto.DispatchOrderRequest;
import com.example.atomy_india.dto.StockAdjustmentRequest;
import com.example.atomy_india.model.*;
import com.example.atomy_india.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private CustomerOrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderTrackingRepository trackingRepository;

    @Autowired
    private SupportTicketRepository ticketRepository;

    @Autowired
    private com.example.atomy_india.repository.CustomerNotificationRepository notificationRepository;

    @Autowired
    private org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @Autowired
    private BrevoEmailService brevoEmailService;

    // --- 1. Dashboard Overview Metrics ---

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void cleanUnwantedOrders() {
        try {
            orderRepository.findAll().stream()
                    .filter(o -> "ORD-20261028-3207".equalsIgnoreCase(o.getOrderId())
                            || (o.getOrderId() != null && o.getOrderId().toUpperCase().contains("TEST")))
                    .forEach(o -> {
                        orderRepository.delete(o);
                        trackingRepository.findByOrderId(o.getOrderId()).ifPresent(trackingRepository::delete);
                    });
        } catch (Exception ignored) {}
    }

    public void deleteOrder(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) return;
        String cleanId = orderId.trim();
        orderRepository.deleteById(cleanId);
        orderItemRepository.findAll().stream()
                .filter(item -> cleanId.equals(item.getOrderId()))
                .forEach(orderItemRepository::delete);
        trackingRepository.findByOrderId(cleanId).ifPresent(trackingRepository::delete);
    }

    public void clearAllOrders() {
        orderRepository.deleteAll();
        orderItemRepository.deleteAll();
        trackingRepository.deleteAll();
    }

    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        BigDecimal revenue = orderRepository.calculateTotalRevenue();
        stats.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        BigDecimal todayRev = orderRepository.calculateTodayRevenue(startOfDay);
        stats.setTodayRevenue(todayRev != null ? todayRev : BigDecimal.ZERO);
        stats.setTodayOrders(orderRepository.countTodayOrders(startOfDay));

        stats.setTotalOrders(orderRepository.count());
        stats.setPendingOrders(orderRepository.countByOrderStatus(CustomerOrder.OrderStatus.PLACED)
                + orderRepository.countByOrderStatus(CustomerOrder.OrderStatus.PROCESSING));
        stats.setShippedOrders(orderRepository.countByOrderStatus(CustomerOrder.OrderStatus.SHIPPED)
                + orderRepository.countByOrderStatus(CustomerOrder.OrderStatus.OUT_FOR_DELIVERY));
        stats.setDeliveredOrders(orderRepository.countByOrderStatus(CustomerOrder.OrderStatus.DELIVERED));

        stats.setLowStockCount(inventoryRepository.countByStatus(Inventory.StockStatus.LOW_STOCK));
        stats.setOutOfStockCount(inventoryRepository.countByStatus(Inventory.StockStatus.OUT_OF_STOCK));

        stats.setOpenTicketsCount(ticketRepository.countByStatus(SupportTicket.TicketStatus.OPEN)
                + ticketRepository.countByStatus(SupportTicket.TicketStatus.IN_PROGRESS));

        List<CustomerOrder> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();
        stats.setRecentOrders(allOrders.size() > 5 ? allOrders.subList(0, 5) : allOrders);

        return stats;
    }

    // --- 2. Order Management & Dispatch ---

    public List<CustomerOrder> getAllOrders(CustomerOrder.OrderStatus statusFilter) {
        List<CustomerOrder> orders = (statusFilter != null)
                ? orderRepository.findByOrderStatusOrderByCreatedAtDesc(statusFilter)
                : orderRepository.findAllByOrderByCreatedAtDesc();

        for (CustomerOrder o : orders) {
            if (o.getEstimatedDeliveryDate() == null || o.getEstimatedDelivery() == null || o.getEstimatedDelivery().contains("5-8") || o.getEstimatedDelivery().contains("5 - 8")) {
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
                boolean isRemote = isRemoteTerrain(o);
                int sla = isRemote ? 3 : 2;
                LocalDateTime target = base.plusDays(sla);
                String dateStr = target.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy"));
                String timeFrame = isRemote ? "Within 3 Days (Remote Mountain/Forest Area)" : "Within 2 Days (Nearby Hub)";
                o.setEstimatedDeliveryDate(dateStr);
                o.setEstimatedDelivery(timeFrame);
                try {
                    orderRepository.save(o);
                } catch (Exception ignored) {}
            }
        }
        return orders;
    }

    public Optional<CustomerOrder> getOrderDetails(String orderId) {
        return orderRepository.findById(orderId);
    }

    @Transactional
    public CustomerOrder updateOrderStatus(String orderId, CustomerOrder.OrderStatus newStatus) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        order.setOrderStatus(newStatus);
        if (newStatus == CustomerOrder.OrderStatus.DELIVERED && order.getPaymentStatus() == CustomerOrder.PaymentStatus.PENDING) {
            order.setPaymentStatus(CustomerOrder.PaymentStatus.PAID);
        }

        // Also sync tracking status if present
        Optional<OrderTracking> trackingOpt = trackingRepository.findByOrderId(orderId);
        if (trackingOpt.isPresent()) {
            OrderTracking tracking = trackingOpt.get();
            tracking.setCurrentStatus(newStatus.name());
            trackingRepository.save(tracking);
        }

        CustomerOrder savedOrder = orderRepository.save(order);

        // If order was transitioned to SHIPPED, notify customer via email
        if (newStatus == CustomerOrder.OrderStatus.SHIPPED) {
            try {
                Optional<OrderTracking> trOpt = trackingRepository.findByOrderId(orderId);
                brevoEmailService.sendOrderShipped(savedOrder, trOpt.orElse(null));
            } catch (Exception e) {}
        }

        // Live notification for the customer on order status update
        try {
            if (savedOrder.getCustomerEmail() != null && !savedOrder.getCustomerEmail().trim().isEmpty()) {
                String type = "general";
                String title = "Order #" + orderId + " Status Updated";
                String message = "Your order status is now " + newStatus.name() + ".";
                if (newStatus == CustomerOrder.OrderStatus.SHIPPED) {
                    type = "order_transit";
                    title = "Order #" + orderId + " Out for Delivery";
                    message = "Your package is on its way. Expected delivery within 24-48 hours.";
                } else if (newStatus == CustomerOrder.OrderStatus.DELIVERED) {
                    type = "order_delivered";
                    title = "Order #" + orderId + " Delivered! 🎉";
                    message = "Your order has been delivered successfully to your shipping address.";
                } else if (newStatus == CustomerOrder.OrderStatus.CANCELLED) {
                    type = "order_cancelled";
                    title = "Order #" + orderId + " Cancelled";
                    message = "Order #" + orderId + " was cancelled.";
                }
                notificationRepository.save(new com.example.atomy_india.model.CustomerNotification(
                        savedOrder.getCustomerEmail().trim().toLowerCase(),
                        title,
                        message,
                        type,
                        orderId
                ));
            }
        } catch (Exception ignored) {}

        return savedOrder;
    }

    @Transactional
    public OrderTracking dispatchOrder(String orderId, DispatchOrderRequest req) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        order.setOrderStatus(CustomerOrder.OrderStatus.SHIPPED);
        orderRepository.save(order);

        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElse(new OrderTracking(orderId, req.getTrackingNumber(), req.getCourierPartner(),
                        "SHIPPED", req.getInitialLocation(), req.getEstimatedDelivery(), "[]"));

        if (req.getCourierPartner() != null) tracking.setCourierPartner(req.getCourierPartner());
        if (req.getTrackingNumber() != null) tracking.setTrackingNumber(req.getTrackingNumber());
        if (req.getEstimatedDelivery() != null) tracking.setEstimatedDelivery(req.getEstimatedDelivery());
        if (req.getInitialLocation() != null) tracking.setCurrentLocation(req.getInitialLocation());

        tracking.setCurrentStatus("SHIPPED");

        // Append new checkpoint to JSON
        String newCheckpoint = "{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":\"DISPATCHED\",\"location\":\""
                + (req.getInitialLocation() != null ? req.getInitialLocation() : "Fulfillment Center")
                + "\",\"description\":\"Package dispatched via " + tracking.getCourierPartner()
                + " with AWB " + tracking.getTrackingNumber() + "\"}";

        String json = tracking.getCheckpointsJson();
        if (json == null || json.trim().isEmpty() || json.equals("[]")) {
            tracking.setCheckpointsJson("[" + newCheckpoint + "]");
        } else if (json.endsWith("]")) {
            tracking.setCheckpointsJson(json.substring(0, json.length() - 1) + "," + newCheckpoint + "]");
        }

        OrderTracking savedTracking = trackingRepository.save(tracking);

        // Dispatch Order Shipped email via Brevo
        try {
            brevoEmailService.sendOrderShipped(order, savedTracking);
        } catch (Exception e) {}

        // Live notification for the customer on dispatch
        try {
            if (order.getCustomerEmail() != null && !order.getCustomerEmail().trim().isEmpty()) {
                String courier = req.getCourierPartner() != null ? req.getCourierPartner() : "Blue Dart Express";
                String awb = req.getTrackingNumber() != null ? req.getTrackingNumber() : "";
                String courierText = !awb.isEmpty() ? " via " + courier + " (AWB: " + awb + ")" : " via " + courier;
                notificationRepository.save(new com.example.atomy_india.model.CustomerNotification(
                        order.getCustomerEmail().trim().toLowerCase(),
                        "Order #" + orderId + " Out for Delivery",
                        "Your package is on its way" + courierText + ". Expected delivery within 24-48 hours.",
                        "order_transit",
                        orderId
                ));
            }
        } catch (Exception ignored) {}

        return savedTracking;
    }

    @Transactional
    public OrderTracking addTrackingCheckpoint(String orderId, AddCheckpointRequest req) {
        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Tracking record not found for order: " + orderId));

        if (req.getStatus() != null) {
            tracking.setCurrentStatus(req.getStatus());
            try {
                CustomerOrder.OrderStatus os = CustomerOrder.OrderStatus.valueOf(req.getStatus());
                CustomerOrder order = orderRepository.findById(orderId).orElse(null);
                if (order != null) {
                    order.setOrderStatus(os);
                    orderRepository.save(order);
                }
            } catch (Exception ignored) {}
        }

        if (req.getLocation() != null) {
            tracking.setCurrentLocation(req.getLocation());
        }

        String newEntry = "{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":\""
                + (req.getStatus() != null ? req.getStatus() : tracking.getCurrentStatus()) + "\",\"location\":\""
                + (req.getLocation() != null ? req.getLocation() : "") + "\",\"description\":\""
                + (req.getDescription() != null ? req.getDescription() : "") + "\"}";

        String json = tracking.getCheckpointsJson();
        if (json == null || json.trim().isEmpty() || json.equals("[]")) {
            tracking.setCheckpointsJson("[" + newEntry + "]");
        } else if (json.endsWith("]")) {
            tracking.setCheckpointsJson(json.substring(0, json.length() - 1) + "," + newEntry + "]");
        }

        return trackingRepository.save(tracking);
    }

    // --- 3. Inventory Management ---

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getLowStockAlerts() {
        return inventoryRepository.findLowStockItems();
    }

    @Transactional
    public Inventory adjustStock(String productId, StockAdjustmentRequest req) {
        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found for product: " + productId));

        if (req.isAbsolute()) {
            inv.updateStock(req.getQuantity());
        } else {
            inv.updateStock(inv.getStockQuantity() + req.getQuantity());
        }

        if (req.getLowStockThreshold() != null && req.getLowStockThreshold() > 0) {
            inv.setLowStockThreshold(req.getLowStockThreshold());
        }

        return inventoryRepository.save(inv);
    }

    // --- 4. Products Management ---

    @Transactional
    public Product saveOrUpdateProduct(Product product) {
        Product saved = productRepository.save(product);

        // Ensure matching inventory record exists
        if (!inventoryRepository.findByProductId(saved.getId()).isPresent()) {
            Inventory inv = new Inventory(saved.getId(), saved.getName(), "SKU-" + saved.getId(), 50, 10);
            inventoryRepository.save(inv);
        }

        return saved;
    }

    @Transactional
    public void deleteOrDeactivateProduct(String productId) {
        if (productId == null) return;
        productRepository.findById(productId).ifPresent(product -> {
            product.setActive(false);
            productRepository.save(product);
        });
    }

    // --- 5. Customer Support Desk ---

    public List<SupportTicket> getAllTickets(SupportTicket.TicketStatus statusFilter) {
        if (statusFilter != null) {
            return ticketRepository.findByStatusOrderByCreatedAtDesc(statusFilter);
        }
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<SupportTicket> getTicketDetails(String ticketId) {
        return ticketRepository.findById(ticketId);
    }

    @Transactional
    public SupportTicket updateTicketStatus(String ticketId, SupportTicket.TicketStatus newStatus) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public TicketMessage adminReplyToTicket(String ticketId, String replyMessage) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        TicketMessage msg = new TicketMessage(TicketMessage.MessageSender.ADMIN, replyMessage);
        ticket.addMessage(msg);
        if (ticket.getStatus() == SupportTicket.TicketStatus.OPEN) {
            ticket.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
        }
        ticketRepository.save(ticket);
        return msg;
    }

    @Transactional
    public void clearAllTickets() {
        ticketRepository.deleteAll();
    }

    @Transactional
    public void deleteTicket(String ticketId) {
        ticketRepository.deleteById(ticketId);
    }

    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    public java.util.Map<String, Object> syncOrderItems() {
        long beforeCount = mongoTemplate.getCollection("order_items").countDocuments();
        for (org.bson.Document orderDoc : mongoTemplate.getCollection("customer_orders").find()) {
            String orderId = orderDoc.getString("_id");
            @SuppressWarnings("unchecked")
            List<org.bson.Document> items = (List<org.bson.Document>) orderDoc.get("items");
            boolean orderModified = false;
            if (items != null) {
                for (org.bson.Document it : items) {
                    String itemId = it.getString("_id");
                    if (itemId == null || itemId.isEmpty()) {
                        itemId = it.getString("id");
                    }
                    if (itemId == null || itemId.isEmpty()) {
                        itemId = "ITEM-" + java.util.UUID.randomUUID().toString().substring(0, 8);
                        it.put("_id", itemId);
                        it.put("id", itemId);
                        orderModified = true;
                    }

                    String pId = it.getString("product_id");
                    if (pId == null) pId = it.getString("productId");
                    if (pId == null) pId = "D92676";
                    it.put("product_id", pId);
                    it.put("productId", pId);

                    String pName = it.getString("product_name");
                    if (pName == null) pName = it.getString("productName");
                    if (pName == null) pName = "Atomy Premium Cotton T-Shirt";
                    it.put("product_name", pName);
                    it.put("productName", pName);

                    String pImg = it.getString("product_image");
                    if (pImg == null) pImg = it.getString("productImage");
                    if (pImg == null) pImg = "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
                    it.put("product_image", pImg);
                    it.put("productImage", pImg);

                    it.put("order_id", orderId);
                    it.put("orderId", orderId);

                    org.bson.Document orderItemDoc = new org.bson.Document();
                    orderItemDoc.put("_id", itemId);
                    orderItemDoc.put("id", itemId);
                    orderItemDoc.put("order_id", orderId);
                    orderItemDoc.put("orderId", orderId);
                    orderItemDoc.put("product_id", pId);
                    orderItemDoc.put("productId", pId);
                    orderItemDoc.put("product_name", pName);
                    orderItemDoc.put("productName", pName);
                    orderItemDoc.put("product_image", pImg);
                    orderItemDoc.put("productImage", pImg);
                    orderItemDoc.put("price", it.get("price"));
                    orderItemDoc.put("quantity", it.get("quantity"));
                    orderItemDoc.put("subtotal", it.get("subtotal"));

                    mongoTemplate.getCollection("order_items").replaceOne(
                            new org.bson.Document("_id", itemId),
                            orderItemDoc,
                            new com.mongodb.client.model.ReplaceOptions().upsert(true)
                    );
                }
                if (orderModified) {
                    mongoTemplate.getCollection("customer_orders").replaceOne(
                            new org.bson.Document("_id", orderId),
                            orderDoc
                    );
                }
            }
        }
        long afterCount = mongoTemplate.getCollection("order_items").countDocuments();
        return java.util.Map.of("beforeCount", beforeCount, "afterCount", afterCount, "status", "SUCCESS");
    }

    // Remote terrain detection helper: forest, mountain, ghats, or hill areas where transportation is limited
    private boolean isRemoteTerrain(CustomerOrder order) {
        if (order == null) return false;
        String text = (String.valueOf(order.getShippingAddress()) + " "
                + String.valueOf(order.getCity()) + " "
                + String.valueOf(order.getState()) + " "
                + String.valueOf(order.getPincode())).toLowerCase();
        return text.matches(".*(forest|mountain|hill|ghat|ooty|nilgiris|kodaikanal|yercaud|munnar|wayanad|valparai|coonoor|shimla|manali|kullu|leh|ladakh|jammu|kashmir|uttarkashi|chamoli|nainital|mussoorie|arunachal|sikkim|meghalaya|nagaland|mizoram|manipur).*");
    }

    @Transactional
    public CustomerOrder sendDelayApologyEmail(String orderId) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        Optional<OrderTracking> trackingOpt = trackingRepository.findByOrderId(orderId);
        String courier = trackingOpt.map(OrderTracking::getCourierPartner).orElse("Blue Dart Express");
        String awb = trackingOpt.map(OrderTracking::getTrackingNumber).orElse("AWB-IN-" + order.getOrderId());
        String estDelivery = trackingOpt.map(OrderTracking::getEstimatedDelivery).orElse(null);

        // Nearby hub delivery: 2 business days across all standard regions
        // Remote mountain / forest areas with limited transportation: 3 days
        boolean isRemote = isRemoteTerrain(order);
        int slaDays = isRemote ? 3 : 2;

        LocalDateTime base = (order.getCreatedAt() != null) ? order.getCreatedAt() : LocalDateTime.now();
        LocalDateTime deadline = base.plusDays(slaDays);
        long delayDays = java.time.Duration.between(deadline, LocalDateTime.now()).toDays();
        if (delayDays < 1) delayDays = 1;

        String expectedDateStr = (estDelivery != null && !estDelivery.trim().isEmpty()) ? estDelivery :
                deadline.plusDays(1).format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy"));

        brevoEmailService.sendOrderDelayedApology(order, (int) delayDays, expectedDateStr, courier, awb);

        order.setDelayEmailSent(true);
        order.setDelayEmailSentAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public int processAndSendAutomatedDelayEmails() {
        List<CustomerOrder> activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() != CustomerOrder.OrderStatus.DELIVERED
                        && o.getOrderStatus() != CustomerOrder.OrderStatus.CANCELLED)
                .filter(o -> o.getDelayEmailSent() == null || !o.getDelayEmailSent())
                .filter(o -> {
                    boolean isRemote = isRemoteTerrain(o);
                    int slaDays = isRemote ? 3 : 2;
                    LocalDateTime base = (o.getCreatedAt() != null) ? o.getCreatedAt() : LocalDateTime.now();
                    return LocalDateTime.now().isAfter(base.plusDays(slaDays));
                })
                .collect(java.util.stream.Collectors.toList());

        int count = 0;
        for (CustomerOrder o : activeOrders) {
            try {
                sendDelayApologyEmail(o.getOrderId());
                count++;
            } catch (Exception ignored) {
            }
        }
        return count;
    }
}
