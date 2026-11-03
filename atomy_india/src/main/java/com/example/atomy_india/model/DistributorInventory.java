package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "distributor_inventory")
public class DistributorInventory {

    @Id
    private String id; // composite: distributorId + "_" + productId

    @Field("distributor_id")
    private String distributorId;

    private String pincode;

    @Field("product_id")
    private String productId;

    @Field("product_name")
    private String productName;

    private String sku;

    @Field("stock_quantity")
    private int stockQuantity = 0;

    @Field("low_stock_threshold")
    private int lowStockThreshold = 10;

    @Field("is_available")
    private boolean isAvailable = true;

    @Field("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public DistributorInventory() {}

    public DistributorInventory(String distributorId, String pincode, String productId, String productName, String sku, int stockQuantity, int lowStockThreshold) {
        this.id = distributorId + "_" + productId;
        this.distributorId = distributorId;
        this.pincode = pincode;
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.stockQuantity = Math.max(0, stockQuantity);
        this.lowStockThreshold = lowStockThreshold;
        this.isAvailable = this.stockQuantity > 0;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStock(int newQuantity, int threshold) {
        this.stockQuantity = Math.max(0, newQuantity);
        this.lowStockThreshold = threshold;
        this.isAvailable = this.stockQuantity > 0;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDistributorId() { return distributorId; }
    public void setDistributorId(String distributorId) { this.distributorId = distributorId; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = Math.max(0, stockQuantity);
        this.isAvailable = this.stockQuantity > 0;
        this.updatedAt = LocalDateTime.now();
    }

    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

