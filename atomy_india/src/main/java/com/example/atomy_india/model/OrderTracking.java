package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "order_tracking")
public class OrderTracking {

    @Id
    private String id;

    @Field("order_id")
    private String orderId;

    @Field("tracking_number")
    private String trackingNumber;

    @Field("courier_partner")
    private String courierPartner; // Blue Dart, Delhivery, DTDC

    @Field("current_status")
    private String currentStatus; // PLACED, MANIFESTED, DISPATCHED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED

    @Field("current_location")
    private String currentLocation;

    @Field("estimated_delivery")
    private String estimatedDelivery;

    @Field("checkpoints_json")
    private String checkpointsJson; // JSON array of checkpoints: [{timestamp, status, location, note}]

    @Field("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public OrderTracking() {}

    public OrderTracking(String orderId, String trackingNumber, String courierPartner,
                         String currentStatus, String currentLocation, String estimatedDelivery,
                         String checkpointsJson) {
        this.orderId = orderId;
        this.trackingNumber = trackingNumber;
        this.courierPartner = courierPartner;
        this.currentStatus = currentStatus;
        this.currentLocation = currentLocation;
        this.estimatedDelivery = estimatedDelivery;
        this.checkpointsJson = checkpointsJson;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getCourierPartner() { return courierPartner; }
    public void setCourierPartner(String courierPartner) { this.courierPartner = courierPartner; }

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(String estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public String getCheckpointsJson() { return checkpointsJson; }
    public void setCheckpointsJson(String checkpointsJson) {
        this.checkpointsJson = checkpointsJson;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
