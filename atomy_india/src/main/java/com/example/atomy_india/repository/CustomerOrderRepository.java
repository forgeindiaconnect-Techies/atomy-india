package com.example.atomy_india.repository;

import com.example.atomy_india.model.CustomerOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Repository
public interface CustomerOrderRepository extends MongoRepository<CustomerOrder, String> {
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
    List<CustomerOrder> findByOrderStatusOrderByCreatedAtDesc(CustomerOrder.OrderStatus status);
    List<CustomerOrder> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    List<CustomerOrder> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);
    List<CustomerOrder> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);

    long countByOrderStatus(CustomerOrder.OrderStatus status);

    default BigDecimal calculateTotalRevenue() {
        return findAll().stream()
                .filter(o -> o.getOrderStatus() != CustomerOrder.OrderStatus.CANCELLED)
                .map(CustomerOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    default long countTodayOrders(LocalDateTime startOfDay) {
        return findAll().stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startOfDay))
                .count();
    }

    default BigDecimal calculateTodayRevenue(LocalDateTime startOfDay) {
        return findAll().stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startOfDay))
                .filter(o -> o.getOrderStatus() != CustomerOrder.OrderStatus.CANCELLED)
                .map(CustomerOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
