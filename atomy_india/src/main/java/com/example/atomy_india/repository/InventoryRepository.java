package com.example.atomy_india.repository;

import com.example.atomy_india.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
    Optional<Inventory> findByProductId(String productId);

    @Query("{ '$expr': { '$lte': [ '$stock_quantity', '$low_stock_threshold' ] } }")
    List<Inventory> findLowStockItems();

    long countByStatus(Inventory.StockStatus status);
}
