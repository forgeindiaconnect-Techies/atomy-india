package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
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
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

    @Field("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

    @Field("delay_email_sent")
    private Boolean delayEmailSent = false;

    @Field("delay_email_sent_at")
    private LocalDateTime delayEmailSentAt;

    @Field("estimated_delivery_date")
    private String estimatedDeliveryDate;

    @Field("estimated_delivery")
    private String estimatedDelivery;

    @Field("assigned_distributor_id")
    private String assignedDistributorId = "CENTRAL_SUPER_HUB";

    @Field("assigned_distributor_name")
    private String assignedDistributorName = "Central Super Admin Hub";

    @Field("fulfillment_type")
    private String fulfillmentType = "COURIER_DELIVERY"; // "STORE_PICKUP" or "COURIER_DELIVERY"

    @Field("pickup_status")
    private String pickupStatus; // "PENDING_PACKING", "READY_FOR_PICKUP", "COLLECTED"

    @Field("pickup_otp")
    private String pickupOtp;

    @Field("pickup_otp_expires_at")
    private LocalDateTime pickupOtpExpiresAt;

    @Field("pickup_otp_attempts")
    private Integer pickupOtpAttempts = 0;

    @Field("pickup_verified_at")
    private LocalDateTime pickupVerifiedAt;

    @Field("pickup_verified_by")
    private String pickupVerifiedBy;

    @Field("delivered_at")
    private LocalDateTime deliveredAt;

    @Field("hub_address")
    private String hubAddress;

    @Field("distributor_dispatch_status")
    private String distributorDispatchStatus = "RECEIVED";

    @Field("distributor_commission")
    private BigDecimal distributorCommission = BigDecimal.ZERO;

    @Field("return_status")
    private String returnStatus; // "NONE", "RETURN_REQUESTED", "RETURNED_AND_REFUNDED", "REPLACEMENT_DISPATCHED"

    @Field("return_reason")
    private String returnReason;

    @Field("replacement_notes")
    private String replacementNotes;

    @Field("order_source")
    private String orderSource = "WEB_BROWSER"; // "WEB_BROWSER" or "MOBILE_APP"

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
        READY_FOR_PICKUP,
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

    public String getAssignedDistributorId() { return assignedDistributorId; }
    public void setAssignedDistributorId(String assignedDistributorId) { this.assignedDistributorId = assignedDistributorId; }

    public String getAssignedDistributorName() { return assignedDistributorName; }
    public void setAssignedDistributorName(String assignedDistributorName) { this.assignedDistributorName = assignedDistributorName; }

    public String getDistributorDispatchStatus() { return distributorDispatchStatus; }
    public void setDistributorDispatchStatus(String distributorDispatchStatus) { this.distributorDispatchStatus = distributorDispatchStatus; }

    public BigDecimal getDistributorCommission() { return distributorCommission; }
    public void setDistributorCommission(BigDecimal distributorCommission) { this.distributorCommission = distributorCommission; }

    public String getFulfillmentType() { return fulfillmentType; }
    public void setFulfillmentType(String fulfillmentType) { this.fulfillmentType = fulfillmentType; }

    public String getPickupStatus() { return pickupStatus; }
    public void setPickupStatus(String pickupStatus) { this.pickupStatus = pickupStatus; }

    public String getPickupOtp() { return pickupOtp; }
    public void setPickupOtp(String pickupOtp) { this.pickupOtp = pickupOtp; }

    public LocalDateTime getPickupOtpExpiresAt() { return pickupOtpExpiresAt; }
    public void setPickupOtpExpiresAt(LocalDateTime pickupOtpExpiresAt) { this.pickupOtpExpiresAt = pickupOtpExpiresAt; }

    public Integer getPickupOtpAttempts() { return pickupOtpAttempts; }
    public void setPickupOtpAttempts(Integer pickupOtpAttempts) { this.pickupOtpAttempts = pickupOtpAttempts; }

    public LocalDateTime getPickupVerifiedAt() { return pickupVerifiedAt; }
    public void setPickupVerifiedAt(LocalDateTime pickupVerifiedAt) { this.pickupVerifiedAt = pickupVerifiedAt; }

    public String getPickupVerifiedBy() { return pickupVerifiedBy; }
    public void setPickupVerifiedBy(String pickupVerifiedBy) { this.pickupVerifiedBy = pickupVerifiedBy; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public String getHubAddress() { return hubAddress; }
    public void setHubAddress(String hubAddress) { this.hubAddress = hubAddress; }

    public String getReturnStatus() { return returnStatus; }
    public void setReturnStatus(String returnStatus) { this.returnStatus = returnStatus; }

    public String getReturnReason() { return returnReason; }
    public void setReturnReason(String returnReason) { this.returnReason = returnReason; }

    public String getReplacementNotes() { return replacementNotes; }
    public void setReplacementNotes(String replacementNotes) { this.replacementNotes = replacementNotes; }

    public String getOrderSource() { return orderSource; }
    public void setOrderSource(String orderSource) { this.orderSource = orderSource; }
}
