package com.example.atomy_india.service;

import com.example.atomy_india.dto.CreateOrderRequest;
import com.example.atomy_india.dto.CreateTicketRequest;
import com.example.atomy_india.model.Category;
import com.example.atomy_india.model.CustomerNotification;
import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.DistributorInventory;
import com.example.atomy_india.model.DistributorUser;
import com.example.atomy_india.model.OrderItem;
import com.example.atomy_india.model.OrderTracking;
import com.example.atomy_india.model.Product;
import com.example.atomy_india.model.SupportTicket;
import com.example.atomy_india.model.TicketMessage;
import com.example.atomy_india.repository.CategoryRepository;
import com.example.atomy_india.repository.CustomerNotificationRepository;
import com.example.atomy_india.repository.CustomerOrderRepository;
import com.example.atomy_india.repository.DistributorInventoryRepository;
import com.example.atomy_india.repository.DistributorRepository;
import com.example.atomy_india.repository.OrderItemRepository;
import com.example.atomy_india.repository.OrderTrackingRepository;
import com.example.atomy_india.repository.ProductRepository;
import com.example.atomy_india.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

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
    private OrderTrackingRepository trackingRepository;

    @Autowired
    private SupportTicketRepository ticketRepository;

    @Autowired
    private BrevoEmailService brevoEmailService;

    @Autowired
    private CustomerNotificationRepository customerNotificationRepository;

    @Autowired
    private DistributorInventoryRepository distributorInventoryRepository;

    @Autowired
    private DistributorRepository distributorRepository;

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
        String timestamp = LocalDateTime.now(java.time.ZoneId.of("Asia/Kolkata"))
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
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
            if (!prodOpt.isPresent() && itemDto.getProductName() != null
                    && !itemDto.getProductName().trim().isEmpty()) {
                String searchName = itemDto.getProductName().trim();
                prodOpt = productRepository.findAll().stream()
                        .filter(p -> p.getName() != null && p.getName().trim().equalsIgnoreCase(searchName))
                        .findFirst();
            }

            Product product = prodOpt.orElse(null);
            String effectiveId = product != null ? product.getId()
                    : (!rawId.isEmpty() ? rawId : "PROD-" + UUID.randomUUID().toString().substring(0, 8));
            String effectiveName = product != null ? product.getName()
                    : (itemDto.getName() != null ? itemDto.getName()
                            : (itemDto.getProductName() != null ? itemDto.getProductName()
                                    : "Atomy Product " + effectiveId));
            String effectiveImage = product != null ? product.getImage()
                    : (itemDto.getImage() != null ? itemDto.getImage()
                            : "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg");
            BigDecimal effectivePrice = (itemDto.getPrice() != null
                    && itemDto.getPrice().compareTo(BigDecimal.ZERO) > 0)
                            ? itemDto.getPrice()
                            : (product != null && product.getPrice() != null ? product.getPrice()
                                    : new BigDecimal("1000.00"));
            int qty = Math.max(1, itemDto.getQuantity());

            OrderItem orderItem = new OrderItem(
                    effectiveId,
                    effectiveName,
                    effectiveImage,
                    effectivePrice,
                    qty);
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }

        // Apply Free Delivery above 4500 rule
        BigDecimal shippingFee = BigDecimal.ZERO;
        if (req.getShippingFee() != null) {
            shippingFee = req.getShippingFee();
        } else if (totalAmount.compareTo(new BigDecimal("4500.00")) < 0) {
            shippingFee = new BigDecimal("150.00");
        }

        BigDecimal finalTotal = totalAmount.add(shippingFee);

        // Derive Customer Details
        String custName = req.getCustomerName() != null ? req.getCustomerName() : "Atomy Direct Customer";
        String custEmail = req.getCustomerEmail() != null ? req.getCustomerEmail() : "guest@atomy.in";
        String custPhone = req.getCustomerPhone() != null ? req.getCustomerPhone() : "+91 9876543210";
        String shipAddr = req.getShippingAddress() != null ? req.getShippingAddress() : "Standard Home Delivery";
        String city = req.getCity() != null ? req.getCity() : "Gurugram";
        String state = req.getState() != null ? req.getState() : "Haryana";
        String pincode = req.getPincode() != null ? req.getPincode() : "122001";

        CustomerOrder.PaymentMethod paymentMethod = req.getPaymentMethod() != null
                ? req.getPaymentMethod()
                : CustomerOrder.PaymentMethod.ONLINE_UPI;

        // Calculate Guaranteed SLA Dates (Standard: 2 Days; High Terrain/J&K/NE: 3 Days)
        boolean isRemote = state != null && (state.equalsIgnoreCase("Jammu & Kashmir") ||
                state.equalsIgnoreCase("Ladakh") ||
                state.equalsIgnoreCase("Assam") ||
                state.equalsIgnoreCase("Meghalaya") ||
                state.equalsIgnoreCase("Arunachal Pradesh") ||
                state.equalsIgnoreCase("Nagaland") ||
                state.equalsIgnoreCase("Manipur") ||
                state.equalsIgnoreCase("Mizoram") ||
                state.equalsIgnoreCase("Tripura") ||
                state.equalsIgnoreCase("Sikkim") ||
                state.equalsIgnoreCase("Himachal Pradesh") ||
                state.equalsIgnoreCase("Uttarakhand"));

        LocalDateTime baseDate = LocalDateTime.now();
        LocalDateTime deliveryDate = isRemote ? baseDate.plusDays(3) : baseDate.plusDays(2);
        String staticDeliveryTimeFrame = deliveryDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        CustomerOrder order = new CustomerOrder(
                orderId,
                custName,
                custEmail,
                custPhone,
                shipAddr,
                city,
                state,
                pincode,
                finalTotal,
                shippingFee,
                paymentMethod);
        order.setOrderStatus(CustomerOrder.OrderStatus.PLACED);
        order.setPaymentStatus(CustomerOrder.PaymentStatus.PAID);
        order.setEstimatedDelivery(isRemote ? "Within 3 Days (High Terrain Guaranteed)" : "Within 2 Days");
        order.setEstimatedDeliveryDate(staticDeliveryTimeFrame);
        order.setCreatedAt(LocalDateTime.now());
        order.setOrderSource(req.getOrderSource() != null ? req.getOrderSource() : "WEB_BROWSER");
        order.setFulfillmentType(req.getFulfillmentType() != null && !req.getFulfillmentType().trim().isEmpty()
                ? req.getFulfillmentType()
                : "COURIER_DELIVERY");

        // Auto-assign Territorial Regional Hub by Delivery Pincode
        if (pincode != null && !pincode.trim().isEmpty()) {
            String pin = pincode.trim();
            List<DistributorUser> byAssigned = distributorRepository.findByAssignedPincodesContaining(pin);
            Optional<DistributorUser> distOpt = byAssigned.stream()
                    .filter(d -> !"SUB_DISTRIBUTOR".equalsIgnoreCase(d.getDistributorRole()))
                    .findFirst()
                    .or(() -> byAssigned.stream().findFirst());
            if (!distOpt.isPresent()) {
                distOpt = distributorRepository.findByPrimaryPincodeAndDistributorRole(pin, "PRIMARY_MANAGER").stream().findFirst()
                        .or(() -> distributorRepository.findByPrimaryPincode(pin).stream().findFirst());
            }

            if (distOpt.isPresent()) {
                DistributorUser resolvedDist = distOpt.get();

                // Orders belong to the PRIMARY FRANCHISE HUB, never directly to a Co-Manager / Substitute
                if ("SUB_DISTRIBUTOR".equalsIgnoreCase(resolvedDist.getDistributorRole()) && resolvedDist.getParentHubId() != null) {
                    Optional<DistributorUser> parent = distributorRepository.findByDistributorId(resolvedDist.getParentHubId());
                    if (parent.isPresent()) {
                        resolvedDist = parent.get();
                    }
                }
                final DistributorUser d = resolvedDist;
                final String distId = d.getEffectiveHubId() != null ? d.getEffectiveHubId() : d.getDistributorId();

                // Validate stock availability in the assigned regional hub
                for (OrderItem oi : orderItems) {
                    Optional<DistributorInventory> diOpt = distributorInventoryRepository.findByDistributorIdAndProductId(distId, oi.getProductId());
                    if (!diOpt.isPresent() && oi.getProductId() != null) {
                        diOpt = distributorInventoryRepository.findByDistributorId(distId).stream()
                                .filter(di -> (di.getProductId() != null && di.getProductId().equalsIgnoreCase(oi.getProductId()))
                                        || (di.getProductName() != null && oi.getProductName() != null && di.getProductName().trim().equalsIgnoreCase(oi.getProductName().trim())))
                                .findFirst();
                    }
                    int available = diOpt.map(DistributorInventory::getStockQuantity).orElse(0);
                    boolean isAvail = diOpt.map(DistributorInventory::isAvailable).orElse(false);
                    int maxOrderable = Math.max(0, available - 1);
                    if (!isAvail || available < 2 || oi.getQuantity() > maxOrderable) {
                        String prodName = (oi.getProductName() != null && !oi.getProductName().trim().isEmpty())
                                ? oi.getProductName().trim()
                                : oi.getProductId();
                        throw new IllegalArgumentException(
                                "This item (" + prodName + ") is not in stock for delivery to PIN " + pin
                                        + ". Please select another address or remove the item.");
                    }
                }

                order.setAssignedDistributorId(distId);
                order.setAssignedDistributorName(
                        d.getBusinessName() != null ? d.getBusinessName() : "Regional Distributor");
                if (req.getHubAddress() != null && !req.getHubAddress().trim().isEmpty()) {
                    order.setHubAddress(req.getHubAddress().trim());
                } else if (order.getHubAddress() == null || order.getHubAddress().trim().isEmpty()) {
                    order.setHubAddress(d.getHubAddress() != null && !d.getHubAddress().trim().isEmpty()
                            ? d.getHubAddress()
                            : (d.getCity() != null ? d.getCity() + ", " + d.getState() : "Regional Logistics Hub"));
                }
                if (req.getPickupStatus() != null && !req.getPickupStatus().trim().isEmpty()) {
                    order.setPickupStatus(req.getPickupStatus().trim());
                }
                double rate = d.getCommissionRate() > 0 ? d.getCommissionRate() : 8.0;
                BigDecimal comm = finalTotal.multiply(BigDecimal.valueOf(rate)).divide(BigDecimal.valueOf(100), 2,
                        java.math.RoundingMode.HALF_UP);
                order.setDistributorCommission(comm);
            } else {
                throw new IllegalArgumentException("This item is not in stock for delivery to PIN " + pin
                        + ". Please select another address or remove the item.");
            }
        } else {
            throw new IllegalArgumentException(
                    "Please select a valid delivery address with a 6-digit PIN code to place your order.");
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

        // Deduct regional warehouse stock from distributor inventory (shared by Primary Distributor and Co-Manager)
        if (savedOrder.getAssignedDistributorId() != null && !"CENTRAL_SUPER_HUB".equals(savedOrder.getAssignedDistributorId())) {
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

        // Initialize Live Order Tracking Record
        String trackingNumber = "ATMY-" + timestamp + "-" + (100000 + new Random().nextInt(900000));
        String initialCheckpoint = "[]";

        OrderTracking tracking = new OrderTracking(
                savedOrder.getOrderId(),
                trackingNumber,
                "Blue Dart Express (Standard)",
                "PLACED",
                "Order Processing Center, Gurugram",
                staticDeliveryTimeFrame,
                initialCheckpoint);
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
                CustomerNotification notif = new CustomerNotification(
                        savedOrder.getCustomerEmail().trim().toLowerCase(),
                        "Order #" + savedOrder.getOrderId() + " Confirmed & Placed",
                        "Your order for " + orderItems.size() + " item(s) totaling Rs."
                                + String.format(java.util.Locale.ENGLISH, "%.2f", savedOrder.getTotalAmount())
                                + " has been placed. Packaging and dispatch initiated.",
                        "order_placed",
                        savedOrder.getOrderId());
                customerNotificationRepository.save(notif);
            }
        } catch (Exception e) {
            // Non-blocking customer notification failure
        }

        return savedOrder;
    }

    public Optional<CustomerOrder> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }

    public List<CustomerOrder> getOrdersByEmail(String email) {
        if (email == null || email.trim().isEmpty())
            return Collections.emptyList();
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

        // 3. Fallback: Check orderRepository
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
                    ? order.getEstimatedDeliveryDate()
                    : "Within 2 - 3 business days";
            String initialStatus = order.getOrderStatus() != null ? order.getOrderStatus().name() : "PLACED";

            String initCheckpoints = "[]";

            OrderTracking newTracking = new OrderTracking(
                    order.getOrderId(),
                    awb,
                    "Blue Dart Express (Standard)",
                    initialStatus,
                    "Order Processing Center, Gurugram",
                    estDelivery,
                    initCheckpoints);
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
                req.getPriority() != null ? req.getPriority() : SupportTicket.TicketPriority.MEDIUM);

        if (req.getInitialMessage() != null && !req.getInitialMessage().trim().isEmpty()) {
            TicketMessage initialMsg = new TicketMessage(TicketMessage.MessageSender.CUSTOMER, req.getInitialMessage());
            ticket.addMessage(initialMsg);
        }

        // 1. Resolve and assign ticket to the customer's particular regional distributor
        String assignedDistId = req.getAssignedDistributorId();
        String assignedDistName = req.getAssignedDistributorName();
        String pincode = req.getPincode();

        // Check if an orderId is referenced
        if ((assignedDistId == null || assignedDistId.trim().isEmpty()) && req.getOrderId() != null && !req.getOrderId().trim().isEmpty()) {
            Optional<CustomerOrder> orderOpt = orderRepository.findById(req.getOrderId().trim());
            if (orderOpt.isPresent()) {
                CustomerOrder ord = orderOpt.get();
                assignedDistId = ord.getAssignedDistributorId();
                assignedDistName = ord.getAssignedDistributorName();
                if (pincode == null || pincode.trim().isEmpty()) {
                    pincode = ord.getPincode();
                }
            }
        }

        // Check if customer email has recent orders
        if ((assignedDistId == null || assignedDistId.trim().isEmpty()) && req.getCustomerEmail() != null && !req.getCustomerEmail().trim().isEmpty()) {
            List<CustomerOrder> custOrders = orderRepository.findByCustomerEmailOrderByCreatedAtDesc(req.getCustomerEmail().trim());
            if (!custOrders.isEmpty()) {
                CustomerOrder latest = custOrders.get(0);
                assignedDistId = latest.getAssignedDistributorId();
                assignedDistName = latest.getAssignedDistributorName();
                if (pincode == null || pincode.trim().isEmpty()) {
                    pincode = latest.getPincode();
                }
            }
        }

        // Check if pincode matches a regional distributor
        if ((assignedDistId == null || assignedDistId.trim().isEmpty()) && pincode != null && !pincode.trim().isEmpty()) {
            List<DistributorUser> coveringDists = distributorRepository.findByAssignedPincodesContaining(pincode.trim());
            if (coveringDists != null && !coveringDists.isEmpty()) {
                DistributorUser d = coveringDists.get(0);
                assignedDistId = d.getDistributorId();
                assignedDistName = d.getBusinessName() != null ? d.getBusinessName() : d.getContactPerson();
            }
        }

        ticket.setAssignedDistributorId(assignedDistId);
        ticket.setAssignedDistributorName(assignedDistName);
        ticket.setPincode(pincode);

        SupportTicket savedTicket = ticketRepository.save(ticket);

        // 2. Dispatch real-time email notification to the assigned distributor if email available
        if (assignedDistId != null && brevoEmailService != null) {
            try {
                Optional<DistributorUser> distUserOpt = distributorRepository.findByDistributorId(assignedDistId);
                if (distUserOpt.isPresent()) {
                    DistributorUser dist = distUserOpt.get();
                    if (dist.getEmail() != null && !dist.getEmail().trim().isEmpty()) {
                        brevoEmailService.sendDistributorTicketAlert(savedTicket, dist.getEmail().trim(), dist.getContactPerson());
                    }
                }
            } catch (Exception e) {
                // Non-blocking email alert log
            }
        }

        return savedTicket;
    }

    public Optional<SupportTicket> getTicketById(String ticketId) {
        if (ticketId == null || ticketId.trim().isEmpty())
            return Optional.empty();
        String tid = ticketId.trim();
        Optional<SupportTicket> res = ticketRepository.findById(tid);
        if (res.isPresent())
            return res;

        // Support case-insensitive and prefix variants (TCK vs TICK)
        if (tid.toUpperCase().startsWith("TCK-")) {
            res = ticketRepository.findById("TICK-" + tid.substring(4));
            if (res.isPresent())
                return res;
        } else if (tid.toUpperCase().startsWith("TICK-")) {
            res = ticketRepository.findById("TCK-" + tid.substring(5));
            if (res.isPresent())
                return res;
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
        if (ticket.getStatus() == SupportTicket.TicketStatus.RESOLVED
                || ticket.getStatus() == SupportTicket.TicketStatus.CLOSED) {
            ticket.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
        }
        ticketRepository.save(ticket);
        return msg;
    }
}
