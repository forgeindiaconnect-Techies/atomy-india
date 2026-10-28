package com.example.atomy_india.dto;

import com.example.atomy_india.model.CustomerOrder;
import java.util.List;

public class CreateOrderRequest {
    private String orderId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String shippingAddress;
    private String city;
    private String state;
    private String pincode;
    private CustomerOrder.PaymentMethod paymentMethod;
    private java.math.BigDecimal shippingFee;
    private java.math.BigDecimal totalAmount;
    private List<OrderItemDto> items;

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public java.math.BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(java.math.BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public java.math.BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(java.math.BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public static class OrderItemDto {
        private String productId;
        private String name;
        private String productName;
        private java.math.BigDecimal price;
        private String image;
        private int quantity;

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public java.math.BigDecimal getPrice() { return price; }
        public void setPrice(java.math.BigDecimal price) { this.price = price; }

        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

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

    public CustomerOrder.PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(CustomerOrder.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
}
