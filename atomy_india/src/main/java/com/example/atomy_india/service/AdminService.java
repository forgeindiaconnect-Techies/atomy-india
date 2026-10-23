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
    private org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    // --- 1. Dashboard Overview Metrics ---

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
        if (statusFilter != null) {
            return orderRepository.findByOrderStatusOrderByCreatedAtDesc(statusFilter);
        }
        return orderRepository.findAllByOrderByCreatedAtDesc();
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

        return orderRepository.save(order);
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

        return trackingRepository.save(tracking);
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
}
