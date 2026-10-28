package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "customer_orders")
public class CustomerOrder {

    @Id
    private String orderId; // e.g. ORD-20261003-8941

    @Field("customer_name")
    private String customerName;

    @Field("customer_email")
    private String customerEmail;

    @Field("customer_phone")
    private String customerPhone;

    @Field("shipping_address")
    private String shippingAddress;

    private String city;

    private String state;

    private String pincode;

    @Field("total_amount")
    private BigDecimal totalAmount;

    @Field("shipping_fee")
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Field("payment_method")
    private PaymentMethod paymentMethod = PaymentMethod.ONLINE_UPI;

    @Field("payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Field("order_status")
    private OrderStatus orderStatus = OrderStatus.PLACED;

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Field("delay_email_sent")
    private Boolean delayEmailSent = false;

    @Field("delay_email_sent_at")
    private LocalDateTime delayEmailSentAt;

    @Field("estimated_delivery_date")
    private String estimatedDeliveryDate;

    @Field("estimated_delivery")
    private String estimatedDelivery;

    private List<OrderItem> items = new ArrayList<>();

    public enum PaymentMethod {
        ONLINE_UPI,
        CREDIT_DEBIT_CARD,
        NET_BANKING,
        CASH_ON_DELIVERY
    }

    public enum PaymentStatus {
        PENDING,
        PAID,
        FAILED,
        REFUNDED
    }

    public enum OrderStatus {
        PLACED,
        PROCESSING,
        SHIPPED,
        OUT_FOR_DELIVERY,
        DELIVERED,
        CANCELLED
    }

    public CustomerOrder() {}

    public CustomerOrder(String orderId, String customerName, String customerEmail, String customerPhone,
                         String shippingAddress, String city, String state, String pincode,
                         BigDecimal totalAmount, BigDecimal shippingFee, PaymentMethod paymentMethod) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.shippingAddress = shippingAddress;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.totalAmount = totalAmount;
        this.shippingFee = shippingFee;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = (paymentMethod == PaymentMethod.CASH_ON_DELIVERY) ? PaymentStatus.PENDING : PaymentStatus.PAID;
        this.orderStatus = OrderStatus.PLACED;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public OrderStatus getOrderStatus() { return orderStatus; }
    public void setOrderStatus(OrderStatus orderStatus) {
        this.orderStatus = orderStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public Boolean getDelayEmailSent() { return delayEmailSent; }
    public void setDelayEmailSent(Boolean delayEmailSent) { this.delayEmailSent = delayEmailSent; }

    public LocalDateTime getDelayEmailSentAt() { return delayEmailSentAt; }
    public void setDelayEmailSentAt(LocalDateTime delayEmailSentAt) { this.delayEmailSentAt = delayEmailSentAt; }

    public String getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(String estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }

    public String getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(String estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }
}
