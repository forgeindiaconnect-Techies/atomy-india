package com.example.atomy_india.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "memberships")
public class Membership {

    @Id
    @Column(name = "id", length = 64)
    private String id; // e.g. ATM-MEM-001

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "plan", nullable = false, length = 32)
    private String plan; // ANNUAL | MONTHLY

    @Column(name = "status", nullable = false, length = 32)
    private String status; // ACTIVE | INACTIVE | EXPIRED

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "payment_method", length = 64)
    private String paymentMethod; // RAZORPAY_UPI | CARD | NETBANKING | TEST_GATEWAY

    @Column(name = "payment_id", length = 128)
    private String paymentId; // e.g. pay_atomy_912834

    @Column(name = "payment_status", length = 32)
    private String paymentStatus; // PAID | PENDING | FAILED

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "lifetime_pv")
    private Long lifetimePv;

    @Column(name = "total_savings", precision = 10, scale = 2)
    private BigDecimal totalSavings;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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
