package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "coupons")
public class Coupon {

    @Id
    private String id;

    private String code;
    private String title;
    private String description;

    @Field("discount_type")
    private String discountType; // PERCENTAGE, FLAT, FREE_SHIPPING

    @Field("discount_value")
    private double discountValue;

    @Field("discount_display")
    private String discountDisplay;

    @Field("min_order_value")
    private double minOrderValue;

    @Field("max_discount_cap")
    private double maxDiscountCap;

    @Field("category_scope")
    private String categoryScope; // ALL, HEALTH, BEAUTY, PERSONAL, FOOD

    @Field("valid_till")
    private String validTill;

    private String status; // ACTIVE, PAUSED, EXPIRED

    @Field("usage_limit")
    private int usageLimit;

    @Field("usage_count")
    private int usageCount;

    @Field("target_product")
    private String targetProduct; // e.g. "HEMOHIM", "ABSOLUTE", "ALL"

    @Field("first_order_only")
    private Boolean firstOrderOnly; // true if restricted to first-time orders

    @Field("created_at")
    private String createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    public Coupon() {
        this.updatedAt = LocalDateTime.now();
    }

    public Coupon(String id, String code, String title, String description,
                  String discountType, double discountValue, String discountDisplay,
                  double minOrderValue, double maxDiscountCap, String categoryScope,
                  String validTill, String status, int usageLimit, int usageCount, String createdAt) {
        this(id, code, title, description, discountType, discountValue, discountDisplay,
             minOrderValue, maxDiscountCap, categoryScope, "ALL", false, validTill, status,
             usageLimit, usageCount, createdAt);
    }

    public Coupon(String id, String code, String title, String description,
                  String discountType, double discountValue, String discountDisplay,
                  double minOrderValue, double maxDiscountCap, String categoryScope,
                  String targetProduct, Boolean firstOrderOnly,
                  String validTill, String status, int usageLimit, int usageCount, String createdAt) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.discountDisplay = discountDisplay;
        this.minOrderValue = minOrderValue;
        this.maxDiscountCap = maxDiscountCap;
        this.categoryScope = categoryScope;
        this.targetProduct = targetProduct;
        this.firstOrderOnly = firstOrderOnly;
        this.validTill = validTill;
        this.status = status;
        this.usageLimit = usageLimit;
        this.usageCount = usageCount;
        this.createdAt = createdAt;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(double discountValue) {
        this.discountValue = discountValue;
    }

    public String getDiscountDisplay() {
        return discountDisplay;
    }

    public void setDiscountDisplay(String discountDisplay) {
        this.discountDisplay = discountDisplay;
    }

    public double getMinOrderValue() {
        return minOrderValue;
    }

    public void setMinOrderValue(double minOrderValue) {
        this.minOrderValue = minOrderValue;
    }

    public double getMaxDiscountCap() {
        return maxDiscountCap;
    }

    public void setMaxDiscountCap(double maxDiscountCap) {
        this.maxDiscountCap = maxDiscountCap;
    }

    public String getCategoryScope() {
        return categoryScope;
    }

    public void setCategoryScope(String categoryScope) {
        this.categoryScope = categoryScope;
    }

    public String getValidTill() {
        return validTill;
    }

    public void setValidTill(String validTill) {
        this.validTill = validTill;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(int usageLimit) {
        this.usageLimit = usageLimit;
    }

    public int getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(int usageCount) {
        this.usageCount = usageCount;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getTargetProduct() {
        return targetProduct;
    }

    public void setTargetProduct(String targetProduct) {
        this.targetProduct = targetProduct;
    }

    public Boolean getFirstOrderOnly() {
        return firstOrderOnly != null && firstOrderOnly;
    }

    public void setFirstOrderOnly(Boolean firstOrderOnly) {
        this.firstOrderOnly = firstOrderOnly;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
