package com.example.atomy_india.dto;

public class DispatchOrderRequest {
    private String courierPartner; // e.g. "Blue Dart", "Delhivery", "DTDC"
    private String trackingNumber;  // e.g. "BLUEDART-84920491"
    private String estimatedDelivery; // e.g. "3-5 Business Days"
    private String initialLocation; // e.g. "Gurugram Fulfillment Center"
    private String currentStatus;
    private String orderStatus;

    public String getCourierPartner() { return courierPartner; }
    public void setCourierPartner(String courierPartner) { this.courierPartner = courierPartner; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(String estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public String getInitialLocation() { return initialLocation; }
    public void setInitialLocation(String initialLocation) { this.initialLocation = initialLocation; }

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
}
