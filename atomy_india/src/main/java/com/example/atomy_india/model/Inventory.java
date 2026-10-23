package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "inventory")
public class Inventory {

    @Id
    private String id;

    @Field("product_id")
    private String productId;

    @Field("product_name")
    private String productName;

    private String sku;

    @Field("stock_quantity")
    private int stockQuantity;

    @Field("low_stock_threshold")
    private int lowStockThreshold = 10;

    private StockStatus status = StockStatus.IN_STOCK;

    @Field("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum StockStatus {
        IN_STOCK,
        LOW_STOCK,
        OUT_OF_STOCK
    }

    public Inventory() {}

    public Inventory(String productId, String productName, String sku, int stockQuantity, int lowStockThreshold) {
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.stockQuantity = stockQuantity;
        this.lowStockThreshold = lowStockThreshold;
        this.status = calculateStatus(stockQuantity, lowStockThreshold);
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStock(int newQuantity) {
        this.stockQuantity = newQuantity;
        this.status = calculateStatus(newQuantity, this.lowStockThreshold);
        this.updatedAt = LocalDateTime.now();
    }

    public static StockStatus calculateStatus(int qty, int threshold) {
        if (qty <= 0) return StockStatus.OUT_OF_STOCK;
        if (qty <= threshold) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
        this.status = calculateStatus(stockQuantity, this.lowStockThreshold);
    }

    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
        this.status = calculateStatus(this.stockQuantity, lowStockThreshold);
    }

    public StockStatus getStatus() { return status; }
    public void setStatus(StockStatus status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
