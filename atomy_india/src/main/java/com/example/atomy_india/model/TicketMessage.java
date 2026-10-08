package com.example.atomy_india.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_messages")
public class TicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnore
    private SupportTicket ticket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageSender sender = MessageSender.CUSTOMER;

    @Column(nullable = false, length = 2048)
    private String message;

    @Column(name = "sent_at", nullable = false)
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SupportTicket getTicket() { return ticket; }
    public void setTicket(SupportTicket ticket) { this.ticket = ticket; }

    public MessageSender getSender() { return sender; }
    public void setSender(MessageSender sender) { this.sender = sender; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
