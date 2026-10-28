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

        // Generate Human-friendly Order ID (e.g. ORD-20261003-8472)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomCode = 1000 + new Random().nextInt(9000);
        String orderId = "ORD-" + timestamp + "-" + randomCode;

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
            BigDecimal effectivePrice = product != null ? product.getPrice() : (itemDto.getPrice() != null ? itemDto.getPrice() : new BigDecimal("1000.00"));
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

        // Free delivery for orders above ₹1,500, else ₹100 standard shipping
        BigDecimal shippingFee = (totalAmount.compareTo(new BigDecimal("1500")) >= 0) ? BigDecimal.ZERO : new BigDecimal("100.00");
        BigDecimal finalTotal = totalAmount.add(shippingFee);

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

        for (OrderItem oi : orderItems) {
            if (oi.getId() == null || oi.getId().isEmpty()) {
                oi.setId("ITEM-" + UUID.randomUUID().toString().substring(0, 8));
            }
            oi.setOrderId(orderId);
            order.addItem(oi);
        }

        CustomerOrder savedOrder = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

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
        Optional<OrderTracking> byOrder = trackingRepository.findByOrderId(orderIdOrTrackingNumber);
        if (byOrder.isPresent()) {
            return byOrder;
        }
        return trackingRepository.findByTrackingNumber(orderIdOrTrackingNumber);
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
