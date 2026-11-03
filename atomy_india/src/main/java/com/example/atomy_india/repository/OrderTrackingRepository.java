package com.example.atomy_india.repository;

import com.example.atomy_india.model.OrderTracking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderTrackingRepository extends MongoRepository<OrderTracking, String> {
    Optional<OrderTracking> findFirstByOrderIdOrderByUpdatedAtDesc(String orderId);
    Optional<OrderTracking> findFirstByOrderId(String orderId);
    java.util.List<OrderTracking> findAllByOrderId(String orderId);
    Optional<OrderTracking> findByOrderId(String orderId);
    Optional<OrderTracking> findFirstByTrackingNumberOrderByUpdatedAtDesc(String trackingNumber);
    Optional<OrderTracking> findFirstByTrackingNumber(String trackingNumber);
    Optional<OrderTracking> findByTrackingNumber(String trackingNumber);
}
