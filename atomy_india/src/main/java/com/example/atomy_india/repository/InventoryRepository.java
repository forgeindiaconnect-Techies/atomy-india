package com.example.atomy_india.repository;

import com.example.atomy_india.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(String productId);

    @Query("SELECT i FROM Inventory i WHERE i.stockQuantity <= i.lowStockThreshold")
    List<Inventory> findLowStockItems();

    long countByStatus(Inventory.StockStatus status);
}
