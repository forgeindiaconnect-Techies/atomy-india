package com.example.atomy_india.repository;

import com.example.atomy_india.model.ProductReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends MongoRepository<ProductReview, String> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(String productId);
    List<ProductReview> findByProductId(String productId);
    List<ProductReview> findByOrderId(String orderId);
    Optional<ProductReview> findByOrderIdAndProductId(String orderId, String productId);
    boolean existsByOrderIdAndProductId(String orderId, String productId);
    long countByProductId(String productId);
}

