package com.example.atomy_india.controller.customer;

import com.example.atomy_india.dto.SubmitReviewRequest;
import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.Product;
import com.example.atomy_india.model.ProductReview;
import com.example.atomy_india.repository.CustomerOrderRepository;
import com.example.atomy_india.repository.ProductRepository;
import com.example.atomy_india.repository.ProductReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer/reviews")
@CrossOrigin(origins = "*")
public class ProductReviewController {

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Submit a customer rating & review (Strictly for DELIVERED orders)
     */
    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody SubmitReviewRequest req) {
        if (req.getProductId() == null || req.getProductId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product ID is required"));
        }
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5 stars"));
        }
        if (req.getComment() == null || req.getComment().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Review text is required"));
        }

        // Validate that the order is delivered
        String orderId = req.getOrderId();
        if (orderId != null && !orderId.trim().isEmpty()) {
            Optional<CustomerOrder> orderOpt = customerOrderRepository.findById(orderId.trim());
            if (orderOpt.isPresent()) {
                CustomerOrder order = orderOpt.get();
                if (order.getOrderStatus() != CustomerOrder.OrderStatus.DELIVERED) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "Reviews can only be submitted once the order is Delivered"
                    ));
                }
            }
        }

        // Check if an existing review exists for this order & product
        ProductReview review;
        Optional<ProductReview> existing = (orderId != null && !orderId.trim().isEmpty())
                ? productReviewRepository.findByOrderIdAndProductId(orderId.trim(), req.getProductId().trim())
                : Optional.empty();

        if (existing.isPresent()) {
            review = existing.get();
            review.setRating(req.getRating());
            review.setTitle(req.getTitle() != null ? req.getTitle().trim() : "");
            review.setComment(req.getComment().trim());
            review.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            if (req.getCustomerName() != null && !req.getCustomerName().trim().isEmpty()) {
                review.setCustomerName(req.getCustomerName().trim());
            }
        } else {
            String authorName = (req.getCustomerName() != null && !req.getCustomerName().trim().isEmpty())
                    ? req.getCustomerName().trim()
                    : "Verified Buyer";

            review = new ProductReview(
                    req.getProductId().trim(),
                    req.getProductName() != null ? req.getProductName().trim() : "",
                    orderId != null ? orderId.trim() : "",
                    req.getCustomerEmail() != null ? req.getCustomerEmail().trim() : "",
                    authorName,
                    req.getRating(),
                    req.getTitle() != null ? req.getTitle().trim() : "",
                    req.getComment().trim()
            );
        }

        ProductReview savedReview = productReviewRepository.save(review);

        // Recalculate average rating and total review count for the product
        List<ProductReview> allReviews = productReviewRepository.findByProductId(req.getProductId().trim());
        int reviewsCount = allReviews.size();
        double avgRating = allReviews.stream().mapToInt(ProductReview::getRating).average().orElse(5.0);
        double roundedRating = Math.round(avgRating * 10.0) / 10.0;

        // Update product in catalog database
        Optional<Product> prodOpt = productRepository.findById(req.getProductId().trim());
        if (prodOpt.isPresent()) {
            Product p = prodOpt.get();
            p.setRating(roundedRating);
            p.setReviewsCount(reviewsCount);
            productRepository.save(p);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Review submitted successfully");
        resp.put("review", savedReview);
        resp.put("rating", roundedRating);
        resp.put("reviewsCount", reviewsCount);
        resp.put("productId", req.getProductId().trim());

        return ResponseEntity.ok(resp);
    }

    /**
     * Get all verified reviews for a specific product
     */
    @GetMapping
    public ResponseEntity<List<ProductReview>> getProductReviews(@RequestParam String productId) {
        if (productId == null || productId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId.trim()));
    }

    /**
     * Get reviews submitted for a specific order
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<ProductReview>> getReviewsByOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(productReviewRepository.findByOrderId(orderId.trim()));
    }
}

