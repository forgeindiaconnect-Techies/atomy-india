package com.example.atomy_india.dto;

public class StockAdjustmentRequest {
    private int quantity; // Absolute quantity or adjustment
    private boolean isAbsolute; // If true, sets stock to this value. If false, adds to current stock.
    private Integer lowStockThreshold;

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public boolean isAbsolute() { return isAbsolute; }
    public void setAbsolute(boolean absolute) { isAbsolute = absolute; }

    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
}
