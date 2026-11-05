package com.example.atomy_india.service;

import com.example.atomy_india.dto.CreateOrderRequest;
import com.example.atomy_india.dto.CreateTicketRequest;
import com.example.atomy_india.model.*;
import com.example.atomy_india.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CustomerService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CustomerOrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderTrackingRepository trackingRepository;

    @Autowired
    private SupportTicketRepository ticketRepository;

    @Autowired
    private BrevoEmailService brevoEmailService;

    @Autowired
    private CustomerUserRepository customerUserRepository;

    @Autowired
    private com.example.atomy_india.repository.IndiaPincodeRepository indiaPincodeRepository;

    @Autowired
    private com.example.atomy_india.repository.CustomerNotificationRepository customerNotificationRepository;

    @Autowired
    private com.example.atomy_india.repository.DistributorInventoryRepository distributorInventoryRepository;

    @Autowired
    private com.example.atomy_india.repository.DistributorRepository distributorRepository;

    // --- Products & Categories ---

    public List<Product> getAllActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> getProductsByCategory(String categoryId) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId);
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(query);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // --- Customer Order Placement (Direct Public Shopper) ---

    @Transactional
    public CustomerOrder placeOrder(CreateOrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot place order with empty cart");
        }

        // Use provided Order ID or generate human-friendly Order ID (e.g. ORD-20261003-8472)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomCode = 1000 + new Random().nextInt(9000);
        String orderId = (req.getOrderId() != null && !req.getOrderId().trim().isEmpty())
                ? req.getOrderId().trim()
                : "ORD-" + timestamp + "-" + randomCode;

        // Idempotency: if order ID already exists in MongoDB, return it directly to avoid duplication
        Optional<CustomerOrder> existing = orderRepository.findById(orderId);
        if (existing.isPresent()) {
            return existing.get();
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.OrderItemDto itemDto : req.getItems()) {
            String rawId = itemDto.getProductId() != null ? itemDto.getProductId().trim() : "";
            Optional<Product> prodOpt = Optional.empty();
            if (!rawId.isEmpty()) {
                prodOpt = productRepository.findById(rawId);
                if (!prodOpt.isPresent()) {
                    prodOpt = productRepository.findAll().stream()
                            .filter(p -> p.getId() != null && p.getId().equalsIgnoreCase(rawId))
                            .findFirst();
                }
            }
            if (!prodOpt.isPresent() && itemDto.getName() != null && !itemDto.getName().trim().isEmpty()) {
                String searchName = itemDto.getName().trim();
                prodOpt = productRepository.findAll().stream()
                        .filter(p -> p.getName() != null && p.getName().trim().equalsIgnoreCase(searchName))
                        .findFirst();
            }
            if (!prodOpt.isPresent() && itemDto.getProductName() != null && !itemDto.getProductName().trim().isEmpty()) {
                String searchName = itemDto.getProductName().trim();
                prodOpt = productRepository.findAll().stream()
                        .filter(p -> p.getName() != null && p.getName().trim().equalsIgnoreCase(searchName))
                        .findFirst();
            }

            Product product = prodOpt.orElse(null);
            String effectiveId = product != null ? product.getId() : (!rawId.isEmpty() ? rawId : "PROD-" + UUID.randomUUID().toString().substring(0, 8));
            String effectiveName = product != null ? product.getName() : (itemDto.getName() != null ? itemDto.getName() : (itemDto.getProductName() != null ? itemDto.getProductName() : "Atomy Product " + effectiveId));
            String effectiveImage = product != null ? product.getImage() : (itemDto.getImage() != null ? itemDto.getImage() : "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg");
            BigDecimal effectivePrice = (itemDto.getPrice() != null && itemDto.getPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? itemDto.getPrice()
                    : (product != null && product.getPrice() != null ? product.getPrice() : new BigDecimal("1000.00"));
            int qty = Math.max(1, itemDto.getQuantity());

            // Inventory check & deduction
            Optional<Inventory> invOpt = inventoryRepository.findByProductId(effectiveId);
            if (!invOpt.isPresent()) {
                invOpt = inventoryRepository.findAll().stream()
                        .filter(i -> i.getProductId() != null && i.getProductId().equalsIgnoreCase(effectiveId))
                        .findFirst();
            }

            if (invOpt.isPresent()) {
                Inventory inv = invOpt.get();
                int currentQty = inv.getStockQuantity();
                int newQty = Math.max(0, currentQty - qty);
                inv.updateStock(newQty);
                inventoryRepository.save(inv);
            } else {
                int newQty = Math.max(0, 100 - qty);
                Inventory inv = new Inventory(effectiveId, effectiveName, "SKU-" + effectiveId, newQty, 15);
                inventoryRepository.save(inv);
            }

            OrderItem orderItem = new OrderItem(
                    effectiveId,
                    effectiveName,
                    effectiveImage,
                    effectivePrice,
                    qty
            );
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }

        // Calculate shipping fee and final total: prefer explicit request values if provided
        BigDecimal shippingFee = req.getShippingFee();
        if (shippingFee == null) {
            shippingFee = (totalAmount.compareTo(new BigDecimal("1500")) >= 0) ? BigDecimal.ZERO : new BigDecimal("100.00");
        }
        BigDecimal finalTotal = req.getTotalAmount();
        if (finalTotal == null || finalTotal.compareTo(BigDecimal.ZERO) <= 0) {
            finalTotal = totalAmount.add(shippingFee);
        }

        // Ensure the order's customer name is the registered account holder name
        String effectiveCustomerName = req.getCustomerName();
        if (req.getCustomerEmail() != null && !req.getCustomerEmail().trim().isEmpty()) {
            Optional<CustomerUser> userOpt = customerUserRepository.findByEmailIgnoreCase(req.getCustomerEmail().trim());
            if (userOpt.isPresent() && userOpt.get().getFullName() != null && !userOpt.get().getFullName().trim().isEmpty()) {
                effectiveCustomerName = userOpt.get().getFullName();
            }
        }
        if (effectiveCustomerName == null || effectiveCustomerName.trim().isEmpty()) {
            effectiveCustomerName = "Valued Customer";
        }

        CustomerOrder order = new CustomerOrder(
                orderId,
                effectiveCustomerName,
                req.getCustomerEmail(),
                req.getCustomerPhone(),
                req.getShippingAddress(),
                req.getCity(),
                req.getState(),
                req.getPincode(),
                finalTotal,
                shippingFee,
                req.getPaymentMethod() != null ? req.getPaymentMethod() : CustomerOrder.PaymentMethod.ONLINE_UPI
        );

        // Order Source (Web Browser vs Mobile App)
        String src = (req.getOrderSource() != null && !req.getOrderSource().trim().isEmpty())
                ? req.getOrderSource().trim().toUpperCase()
                : "WEB_BROWSER";
        order.setOrderSource(src);

        // Fulfillment Type & Direct Hub Pickup Handling
        String fType = (req.getFulfillmentType() != null && !req.getFulfillmentType().trim().isEmpty())
                ? req.getFulfillmentType().trim().toUpperCase()
                : "COURIER_DELIVERY";
        order.setFulfillmentType(fType);
        if ("STORE_PICKUP".equals(fType)) {
            order.setPickupStatus("PENDING_PACKING");
            order.setShippingFee(BigDecimal.ZERO);
            if (req.getHubAddress() != null && !req.getHubAddress().trim().isEmpty()) {
                order.setHubAddress(req.getHubAddress().trim());
            }
        }

        // Determine static delivery date: 2 business days for standard nearby hub, 3 days for remote mountain/forest
        String addressText = (String.valueOf(req.getShippingAddress()) + " "
                + String.valueOf(req.getCity()) + " "
                + String.valueOf(req.getState()) + " "
                + String.valueOf(req.getPincode())).toLowerCase();
        boolean isRemote = addressText.matches(".*(forest|mountain|hill|ghat|ooty|nilgiris|kodaikanal|yercaud|munnar|wayanad|valparai|coonoor|shimla|manali|kullu|leh|ladakh|jammu|kashmir|uttarkashi|chamoli|nainital|mussoorie|arunachal|sikkim|meghalaya|nagaland|mizoram|manipur).*");
        int slaDays = isRemote ? 3 : 2;
        LocalDateTime targetDate = LocalDateTime.now().plusDays(slaDays);
        String staticDeliveryDateStr = targetDate.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy"));
        String staticDeliveryTimeFrame = isRemote ? "Within 3 Days (Remote Mountain/Forest Area)" : "Within 2 Days (Nearby Hub)";

        order.setEstimatedDeliveryDate(staticDeliveryDateStr);
        order.setEstimatedDelivery(staticDeliveryTimeFrame);

        // Auto-Route to local assigned distributor by shipping delivery PIN code
        String pin = req.getPincode() != null ? req.getPincode().trim() : "";
        if (!pin.isEmpty()) {
            java.util.Optional<com.example.atomy_india.model.DistributorUser> distOpt = distributorRepository.findByPrimaryPincode(pin)
                    .or(() -> distributorRepository.findByAssignedPincodesContaining(pin));

            if (distOpt.isEmpty()) {
                java.util.Optional<com.example.atomy_india.model.IndiaPincode> pinOpt = indiaPincodeRepository.findByPincode(pin);
                if (pinOpt.isPresent() && pinOpt.get().getAssignedDistributorId() != null && !pinOpt.get().getAssignedDistributorId().trim().isEmpty()) {
                    distOpt = distributorRepository.findByDistributorId(pinOpt.get().getAssignedDistributorId());
                }
            }

            // Strict PIN routing only: orders are never assigned across different PIN codes via city/district fallback.

            if (distOpt.isPresent()) {
                com.example.atomy_india.model.DistributorUser d = distOpt.get();
                String distId = d.getDistributorId();

                // Validate stock availability in the assigned regional hub
                for (OrderItem oi : orderItems) {
                    java.util.Optional<com.example.atomy_india.model.DistributorInventory> diOpt = 
                            distributorInventoryRepository.findByDistributorIdAndProductId(distId, oi.getProductId());
                    int available = diOpt.map(com.example.atomy_india.model.DistributorInventory::getStockQuantity).orElse(0);
                    boolean isAvail = diOpt.map(com.example.atomy_india.model.DistributorInventory::isAvailable).orElse(false);
                    int maxOrderable = Math.max(0, available - 1);
                    if (!isAvail || available < 2 || oi.getQuantity() > maxOrderable) {
                        String prodName = (oi.getProductName() != null && !oi.getProductName().trim().isEmpty()) 
                                ? oi.getProductName().trim() 
                                : oi.getProductId();
                        throw new IllegalArgumentException("This item (" + prodName + ") is not in stock for delivery to PIN " + pin + ". Please select another address or remove the item.");
                    }
                }

                order.setAssignedDistributorId(d.getDistributorId());
                order.setAssignedDistributorName(d.getBusinessName() != null ? d.getBusinessName() : "Regional Distributor");
                if (order.getHubAddress() == null || order.getHubAddress().trim().isEmpty()) {
                    order.setHubAddress(d.getHubAddress() != null && !d.getHubAddress().trim().isEmpty() 
                            ? d.getHubAddress() 
                            : (d.getCity() != null ? d.getCity() + ", " + d.getState() : "Regional Logistics Hub"));
                }
                double rate = d.getCommissionRate() > 0 ? d.getCommissionRate() : 8.0;
                BigDecimal comm = finalTotal.multiply(BigDecimal.valueOf(rate)).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                order.setDistributorCommission(comm);
            } else {
                throw new IllegalArgumentException("This item is not in stock for delivery to PIN " + pin + ". Please select another address or remove the item.");
            }
        } else {
            throw new IllegalArgumentException("Please select a valid delivery address with a 6-digit PIN code to place your order.");
        }
        order.setDistributorDispatchStatus("RECEIVED");

        for (OrderItem oi : orderItems) {
            if (oi.getId() == null || oi.getId().isEmpty()) {
                oi.setId("ITEM-" + UUID.randomUUID().toString().substring(0, 8));
            }
            oi.setOrderId(orderId);
            order.addItem(oi);
        }

        CustomerOrder savedOrder = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        // Deduct regional warehouse stock from distributor inventory
        if (!"CENTRAL_SUPER_HUB".equals(savedOrder.getAssignedDistributorId())) {
            String distId = savedOrder.getAssignedDistributorId();
            for (OrderItem oi : orderItems) {
                String pId = oi.getProductId();
                int qtyOrdered = oi.getQuantity();
                distributorInventoryRepository.findByDistributorIdAndProductId(distId, pId).ifPresent(di -> {
                    int updated = Math.max(0, di.getStockQuantity() - qtyOrdered);
                    di.setStockQuantity(updated);
                    di.setAvailable(updated > 0);
                    di.setUpdatedAt(LocalDateTime.now());
                    distributorInventoryRepository.save(di);
                });
            }
        }

        // Initialize Live Order Tracking Record with Initial Checkpoint
        String trackingNumber = "ATMY-" + timestamp + "-" + (100000 + new Random().nextInt(900000));
        String initialCheckpoint = "[{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":\"ORDER_PLACED\",\"location\":\"Online System\",\"description\":\"Order received and confirmed successfully.\"}]";

        OrderTracking tracking = new OrderTracking(
                savedOrder.getOrderId(),
                trackingNumber,
                "Blue Dart Express (Standard)",
                "PLACED",
                "Order Processing Center, Gurugram",
                staticDeliveryTimeFrame,
                initialCheckpoint
        );
        trackingRepository.save(tracking);

        // Dispatch transactional emails asynchronously via Brevo
        try {
            brevoEmailService.sendOrderConfirmation(savedOrder);
            brevoEmailService.sendAdminNewOrderAlert(savedOrder);
        } catch (Exception e) {
            // Non-blocking email dispatch failure
        }

        // Live notification for the customer
        try {
            if (savedOrder.getCustomerEmail() != null && !savedOrder.getCustomerEmail().trim().isEmpty()) {
                com.example.atomy_india.model.CustomerNotification notif = new com.example.atomy_india.model.CustomerNotification(
                        savedOrder.getCustomerEmail().trim().toLowerCase(),
                        "Order #" + savedOrder.getOrderId() + " Confirmed & Placed",
                        "Your order for " + orderItems.size() + " item(s) totaling ₹"
                                + String.format(java.util.Locale.ENGLISH, "%.2f", savedOrder.getTotalAmount())
                                + " has been placed. Packaging and dispatch initiated.",
                        "order_placed",
                        savedOrder.getOrderId()
                );
                customerNotificationRepository.save(notif);
            }
        } catch (Exception ignored) {}

        return savedOrder;
    }

    public Optional<CustomerOrder> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }

    public List<CustomerOrder> getOrdersByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return Collections.emptyList();
        return orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email.trim());
    }

    public List<CustomerOrder> getOrdersByPhone(String phone) {
        return orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone);
    }

    // --- Public Live Order Tracking ---

    public Optional<OrderTracking> getTracking(String orderIdOrTrackingNumber) {
        if (orderIdOrTrackingNumber == null || orderIdOrTrackingNumber.trim().isEmpty()) {
            return Optional.empty();
        }
        String cleanId = orderIdOrTrackingNumber.trim();

        // 1. Check trackingRepository by Order ID
        Optional<OrderTracking> byOrder = trackingRepository.findFirstByOrderId(cleanId);
        if (byOrder.isPresent()) {
            return byOrder;
        }

        // 2. Check trackingRepository by Tracking Number
        Optional<OrderTracking> byTracking = trackingRepository.findFirstByTrackingNumber(cleanId);
        if (byTracking.isPresent()) {
            return byTracking;
        }

        // 3. Fallback: Check orderRepository. If order exists, auto-generate tracking entity and persist
        Optional<CustomerOrder> orderOpt = orderRepository.findById(cleanId);
        if (!orderOpt.isPresent()) {
            orderOpt = orderRepository.findAll().stream()
                    .filter(o -> o.getOrderId() != null && o.getOrderId().equalsIgnoreCase(cleanId))
                    .findFirst();
        }

        if (orderOpt.isPresent()) {
            CustomerOrder order = orderOpt.get();
            String awb = "BD" + (100000000 + Math.abs(order.getOrderId().hashCode() % 900000000)) + "IN";
            String estDelivery = order.getEstimatedDeliveryDate() != null
                    ? order.getEstimatedDeliveryDate() + " (" + (order.getEstimatedDelivery() != null ? order.getEstimatedDelivery() : "Within 2 Days") + ")"
                    : (order.getEstimatedDelivery() != null ? order.getEstimatedDelivery() : "Within 2 - 3 business days");
            String initialStatus = order.getOrderStatus() != null ? order.getOrderStatus().name() : "PLACED";

            String initCheckpoints = "[{\"timestamp\":\"" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                    + "\",\"status\":\"ORDER_PLACED\",\"location\":\"Gurugram Central Fulfillment Center\",\"description\":\"Order received and confirmed. Package is being prepared for dispatch.\"}]";

            OrderTracking newTracking = new OrderTracking(
                    order.getOrderId(),
                    awb,
                    "Blue Dart Express (Standard)",
                    initialStatus,
                    "Order Processing Center, Gurugram",
                    estDelivery,
                    initCheckpoints
            );
            return Optional.of(trackingRepository.save(newTracking));
        }

        return Optional.empty();
    }

    // --- Customer Support Tickets ---

    @Transactional
    public SupportTicket createTicket(CreateTicketRequest req) {
        String ticketId = req.getTicketId();
        if (ticketId == null || ticketId.trim().isEmpty()) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            int rand = 1000 + new Random().nextInt(9000);
            ticketId = "TCK-" + timestamp + "-" + rand;
        } else {
            ticketId = ticketId.trim().toUpperCase();
        }

        SupportTicket ticket = new SupportTicket(
                ticketId,
                req.getCustomerName() != null ? req.getCustomerName() : "Valued Customer",
                req.getCustomerEmail() != null ? req.getCustomerEmail() : "customer@atomy.com",
                req.getCustomerPhone(),
                req.getOrderId(),
                req.getSubject() != null ? req.getSubject() : "Support Inquiry",
                req.getCategory() != null ? req.getCategory() : SupportTicket.TicketCategory.GENERAL_SUPPORT,
                req.getPriority() != null ? req.getPriority() : SupportTicket.TicketPriority.MEDIUM
        );

        if (req.getInitialMessage() != null && !req.getInitialMessage().trim().isEmpty()) {
            TicketMessage initialMsg = new TicketMessage(TicketMessage.MessageSender.CUSTOMER, req.getInitialMessage());
            ticket.addMessage(initialMsg);
        }

        return ticketRepository.save(ticket);
    }

    public Optional<SupportTicket> getTicketById(String ticketId) {
        if (ticketId == null || ticketId.trim().isEmpty()) return Optional.empty();
        String tid = ticketId.trim();
        Optional<SupportTicket> res = ticketRepository.findById(tid);
        if (res.isPresent()) return res;

        // Support case-insensitive and prefix variants (TCK vs TICK)
        if (tid.toUpperCase().startsWith("TCK-")) {
            res = ticketRepository.findById("TICK-" + tid.substring(4));
            if (res.isPresent()) return res;
        } else if (tid.toUpperCase().startsWith("TICK-")) {
            res = ticketRepository.findById("TCK-" + tid.substring(5));
            if (res.isPresent()) return res;
        }

        return ticketRepository.findAll().stream()
                .filter(t -> t.getTicketId().equalsIgnoreCase(tid) ||
                             t.getTicketId().toLowerCase().contains(tid.toLowerCase()) ||
                             (t.getCustomerEmail() != null && t.getCustomerEmail().equalsIgnoreCase(tid)) ||
                             (t.getSubject() != null && t.getSubject().toLowerCase().contains(tid.toLowerCase())))
                .findFirst();
    }

    public List<SupportTicket> getTicketsByEmail(String email) {
        return ticketRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
    }

    public List<SupportTicket> getAllRecentTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public TicketMessage addCustomerMessageToTicket(String ticketId, String messageText) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        TicketMessage msg = new TicketMessage(TicketMessage.MessageSender.CUSTOMER, messageText);
        ticket.addMessage(msg);
        if (ticket.getStatus() == SupportTicket.TicketStatus.RESOLVED || ticket.getStatus() == SupportTicket.TicketStatus.CLOSED) {
            ticket.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
        }
        ticketRepository.save(ticket);
        return msg;
    }
}
