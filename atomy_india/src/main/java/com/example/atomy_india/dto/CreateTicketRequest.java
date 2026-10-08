package com.example.atomy_india.dto;

import com.example.atomy_india.model.SupportTicket;

public class CreateTicketRequest {
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String orderId;
    private String subject;
    private SupportTicket.TicketCategory category;
    private SupportTicket.TicketPriority priority = SupportTicket.TicketPriority.MEDIUM;
    private String initialMessage;

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
    public void setCategory(SupportTicket.TicketCategory category) { this.category = category; }

    public SupportTicket.TicketPriority getPriority() { return priority; }
    public void setPriority(SupportTicket.TicketPriority priority) { this.priority = priority; }

    public String getInitialMessage() { return initialMessage; }
    public void setInitialMessage(String initialMessage) { this.initialMessage = initialMessage; }
}
