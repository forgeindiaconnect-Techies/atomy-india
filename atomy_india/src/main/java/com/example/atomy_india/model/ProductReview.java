package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Document(collection = "product_reviews")
public class ProductReview {

    @Id
    private String id;

    @Field("product_id")
    private String productId;

    @Field("product_name")
    private String productName;

    @Field("order_id")
    private String orderId;

    @Field("customer_email")
    private String customerEmail;

    @Field("customer_name")
    private String customerName;

    private Integer rating = 5;

    private String title;

    private String comment;

    @Field("verified_buyer")
    private Boolean verifiedBuyer = true;

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

    public ProductReview() {}

    public ProductReview(String productId, String productName, String orderId,
                         String customerEmail, String customerName,
                         Integer rating, String title, String comment) {
        this.productId = productId;
        this.productName = productName;
        this.orderId = orderId;
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.rating = rating != null ? Math.max(1, Math.min(5, rating)) : 5;
        this.title = title;
        this.comment = comment;
        this.verifiedBuyer = true;
        this.createdAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Integer getRating() { return rating != null ? rating : 5; }
    public void setRating(Integer rating) {
        this.rating = rating != null ? Math.max(1, Math.min(5, rating)) : 5;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Boolean isVerifiedBuyer() { return verifiedBuyer != null ? verifiedBuyer : true; }
    public Boolean getVerifiedBuyer() { return verifiedBuyer != null ? verifiedBuyer : true; }
    public void setVerifiedBuyer(Boolean verifiedBuyer) { this.verifiedBuyer = verifiedBuyer != null ? verifiedBuyer : true; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getFormattedDate() {
        if (createdAt == null) return "Recent";
        try {
            return createdAt.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        } catch (Exception e) {
            return "Recent";
        }
    }
}

