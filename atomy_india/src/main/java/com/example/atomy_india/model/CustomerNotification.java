package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "customer_notifications")
public class CustomerNotification {

    @Id
    private String id;

    private String email;

    private String title;

    private String message;

    private String type; // order_placed, order_delivery, order_cancelled, order_transit, login, promo, welcome

    @Field("order_id")
    private String orderId;

    @Field("is_read")
    private boolean isRead = false;

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public CustomerNotification() {}

    public CustomerNotification(String email, String title, String message, String type, String orderId) {
        this.email = email;
        this.title = title;
        this.message = message;
        this.type = type;
        this.orderId = orderId;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
