package com.example.atomy_india.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_tracking")
public class OrderTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true, length = 32)
    private String orderId;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 64)
    private String trackingNumber;

    @Column(name = "courier_partner", nullable = false, length = 64)
    private String courierPartner; // Blue Dart, Delhivery, DTDC

    @Column(name = "current_status", nullable = false, length = 64)
    private String currentStatus; // PLACED, MANIFESTED, DISPATCHED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED

    @Column(name = "current_location")
    private String currentLocation;

    @Column(name = "estimated_delivery")
    private String estimatedDelivery;

    @Lob
    @Column(name = "checkpoints_json", columnDefinition = "TEXT")
    private String checkpointsJson; // JSON array of checkpoints: [{timestamp, status, location, note}]

    @Column(name = "updated_at")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
