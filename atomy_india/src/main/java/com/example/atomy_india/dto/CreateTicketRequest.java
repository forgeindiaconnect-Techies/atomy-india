package com.example.atomy_india.dto;

import com.example.atomy_india.model.SupportTicket;

public class CreateTicketRequest {
    private String ticketId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String orderId;
    private String subject;
    private SupportTicket.TicketCategory category;
    private SupportTicket.TicketPriority priority = SupportTicket.TicketPriority.MEDIUM;
    private String initialMessage;

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public SupportTicket.TicketCategory getCategory() { return category; }
    
    @com.fasterxml.jackson.annotation.JsonSetter("category")
    public void setCategory(Object cat) {
        if (cat == null) {
            this.category = SupportTicket.TicketCategory.GENERAL_SUPPORT;
            return;
        }
        String str = cat.toString().trim().toUpperCase().replace(" ", "_").replace("&", "_");
        try {
            this.category = SupportTicket.TicketCategory.valueOf(str);
        } catch (Exception e) {
            if (str.contains("ORDER") || str.contains("DELIVERY")) {
                this.category = SupportTicket.TicketCategory.ORDER_ISSUE;
            } else if (str.contains("PRODUCT")) {
                this.category = SupportTicket.TicketCategory.PRODUCT_INQUIRY;
            } else if (str.contains("REFUND") || str.contains("PAYMENT")) {
                this.category = SupportTicket.TicketCategory.REFUND_REQUEST;
            } else if (str.contains("DAMAGE")) {
                this.category = SupportTicket.TicketCategory.DAMAGED_PRODUCT;
            } else if (str.contains("DELAY")) {
                this.category = SupportTicket.TicketCategory.DELIVERY_DELAY;
            } else {
                this.category = SupportTicket.TicketCategory.GENERAL_SUPPORT;
            }
        }
    }

    public SupportTicket.TicketPriority getPriority() { return priority; }
    
    @com.fasterxml.jackson.annotation.JsonSetter("priority")
    public void setPriority(Object prio) {
        if (prio == null) {
            this.priority = SupportTicket.TicketPriority.MEDIUM;
            return;
        }
        String str = prio.toString().trim().toUpperCase();
        try {
            this.priority = SupportTicket.TicketPriority.valueOf(str);
        } catch (Exception e) {
            this.priority = SupportTicket.TicketPriority.MEDIUM;
        }
    }

    public String getInitialMessage() { return initialMessage; }
    public void setInitialMessage(String initialMessage) { this.initialMessage = initialMessage; }

    @com.fasterxml.jackson.annotation.JsonSetter("message")
    public void setMessage(String msg) {
        if (this.initialMessage == null || this.initialMessage.trim().isEmpty()) {
            this.initialMessage = msg;
        }
    }
}
