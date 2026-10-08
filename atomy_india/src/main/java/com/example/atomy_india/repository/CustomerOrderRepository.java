package com.example.atomy_india.repository;

import com.example.atomy_india.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, String> {
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
    List<CustomerOrder> findByOrderStatusOrderByCreatedAtDesc(CustomerOrder.OrderStatus status);
    List<CustomerOrder> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    List<CustomerOrder> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);

    long countByOrderStatus(CustomerOrder.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM CustomerOrder o WHERE o.orderStatus <> com.example.atomy_india.model.CustomerOrder.OrderStatus.CANCELLED")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(o) FROM CustomerOrder o WHERE o.createdAt >= :startOfDay")
    long countTodayOrders(@org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM CustomerOrder o WHERE o.createdAt >= :startOfDay AND o.orderStatus <> com.example.atomy_india.model.CustomerOrder.OrderStatus.CANCELLED")
    BigDecimal calculateTodayRevenue(@org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay);
}
