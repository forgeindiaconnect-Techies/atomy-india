package com.example.atomy_india.repository;

import com.example.atomy_india.model.OrderTracking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderTrackingRepository extends MongoRepository<OrderTracking, String> {
    Optional<OrderTracking> findByOrderId(String orderId);
    Optional<OrderTracking> findByTrackingNumber(String trackingNumber);
}
