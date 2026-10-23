package com.example.atomy_india.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Transient;
import java.time.LocalDateTime;

public class TicketMessage {

    private String id;

    @JsonIgnore
    @Transient
    private SupportTicket ticket;

    private MessageSender sender = MessageSender.CUSTOMER;

    private String message;

    private LocalDateTime sentAt = LocalDateTime.now();

    public enum MessageSender {
        CUSTOMER,
        ADMIN
    }

    public TicketMessage() {}

    public TicketMessage(MessageSender sender, String message) {
        this.sender = sender;
        this.message = message;
        this.sentAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public SupportTicket getTicket() { return ticket; }
    public void setTicket(SupportTicket ticket) { this.ticket = ticket; }

    public MessageSender getSender() { return sender; }
    public void setSender(MessageSender sender) { this.sender = sender; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
