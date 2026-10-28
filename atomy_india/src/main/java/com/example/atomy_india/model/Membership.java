package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "memberships")
public class Membership {

    @Id
    private String id; // e.g. ATM-MEM-001

    @Field("customer_name")
    private String customerName;

    @Field("customer_email")
    private String customerEmail;

    @Field("customer_phone")
    private String customerPhone;

    private String plan; // ANNUAL | MONTHLY

    private String status; // ACTIVE | INACTIVE | EXPIRED

    @Field("amount_paid")
    private BigDecimal amountPaid;

    @Field("payment_method")
    private String paymentMethod; // RAZORPAY_UPI | CARD | NETBANKING | TEST_GATEWAY

    @Field("payment_id")
    private String paymentId; // e.g. pay_atomy_912834

    @Field("payment_status")
    private String paymentStatus; // PAID | PENDING | FAILED

    @Field("start_date")
    private LocalDateTime startDate;

    @Field("expiry_date")
    private LocalDateTime expiryDate;

    @Field("lifetime_pv")
    private Long lifetimePv;

    @Field("total_savings")
    private BigDecimal totalSavings;

    @Field("welcome_email_sent")
    private Boolean welcomeEmailSent = false;

    @Field("expired_email_sent")
    private Boolean expiredEmailSent = false;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    public Membership() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "ACTIVE";
        this.paymentStatus = "PAID";
        this.lifetimePv = 0L;
        this.totalSavings = BigDecimal.ZERO;
    }

    public Membership(String id, String customerName, String customerEmail, String customerPhone,
                      String plan, BigDecimal amountPaid, String paymentMethod, String paymentId) {
        this();
        this.id = id;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.plan = plan;
        this.amountPaid = amountPaid;
        this.paymentMethod = paymentMethod;
        this.paymentId = paymentId;
        this.startDate = LocalDateTime.now();
        if ("MONTHLY".equalsIgnoreCase(plan)) {
            this.expiryDate = LocalDateTime.now().plusMonths(1);
        } else {
            this.expiryDate = LocalDateTime.now().plusYears(1);
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Long getLifetimePv() {
        return lifetimePv != null ? lifetimePv : 0L;
    }

    public void setLifetimePv(Long lifetimePv) {
        this.lifetimePv = lifetimePv;
    }

    public BigDecimal getTotalSavings() {
        return totalSavings != null ? totalSavings : BigDecimal.ZERO;
    }

    public void setTotalSavings(BigDecimal totalSavings) {
        this.totalSavings = totalSavings;
    }

    public Boolean getWelcomeEmailSent() {
        return welcomeEmailSent;
    }

    public void setWelcomeEmailSent(Boolean welcomeEmailSent) {
        this.welcomeEmailSent = welcomeEmailSent;
    }

    public Boolean getExpiredEmailSent() {
        return expiredEmailSent;
    }

    public void setExpiredEmailSent(Boolean expiredEmailSent) {
        this.expiredEmailSent = expiredEmailSent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
