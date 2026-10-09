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
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderTrackingRepository trackingRepository;

    @Autowired
    private SupportTicketRepository ticketRepository;

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
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemDto.getProductId()));

            // Inventory check & deduction
            Optional<Inventory> invOpt = inventoryRepository.findByProductId(product.getId());
            if (invOpt.isPresent()) {
                Inventory inv = invOpt.get();
                if (inv.getStockQuantity() < itemDto.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for product: " + product.getName() + " (Available: " + inv.getStockQuantity() + ")");
                }
                inv.updateStock(inv.getStockQuantity() - itemDto.getQuantity());
                inventoryRepository.save(inv);
            }

            OrderItem orderItem = new OrderItem(
                    product.getId(),
                    product.getName(),
                    product.getImage(),
                    product.getPrice(),
                    itemDto.getQuantity()
            );
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }

        // Free delivery for orders above ₹1,500, else ₹100 standard shipping
        BigDecimal shippingFee = (totalAmount.compareTo(new BigDecimal("1500")) >= 0) ? BigDecimal.ZERO : new BigDecimal("100.00");
        BigDecimal finalTotal = totalAmount.add(shippingFee);

        CustomerOrder order = new CustomerOrder(
                orderId,
                req.getCustomerName(),
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

        for (OrderItem oi : orderItems) {
            order.addItem(oi);
        }

        CustomerOrder savedOrder = orderRepository.save(order);

        // Initialize Live Order Tracking Record with Initial Checkpoint
        String trackingNumber = "ATMY-" + timestamp + "-" + (100000 + new Random().nextInt(900000));
        String initialCheckpoint = "[{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":\"ORDER_PLACED\",\"location\":\"Online System\",\"description\":\"Order received and confirmed successfully.\"}]";

        OrderTracking tracking = new OrderTracking(
                savedOrder.getOrderId(),
                trackingNumber,
                "Blue Dart Express (Standard)",
                "PLACED",
                "Order Processing Center, Gurugram",
                "3-5 Business Days",
                initialCheckpoint
        );
        trackingRepository.save(tracking);

        return savedOrder;
    }

    public Optional<CustomerOrder> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }

    public List<CustomerOrder> getOrdersByEmail(String email) {
        return orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
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
