package com.example.atomy_india.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @Column(length = 32)
    private String id; // e.g. D90178

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "category_id", nullable = false)
    private String categoryId;

    @Column(name = "subcategory")
    private String subcategory;

    @Column(length = 1024)
    private String image;

    @Column(name = "gst_reduced")
    private boolean gstReduced;

    @Column(name = "is_veg")
    private boolean isVeg;

    @Column(name = "is_non_veg")
    private boolean isNonVeg;

    @Column(name = "likes_count")
    private int likesCount;

    @Column(name = "tags")
    private String tags; // Comma-separated tags

    @Column(name = "free_delivery")
    private boolean freeDelivery;

    @Column(name = "pv")
    private Long pv;

    @Column(name = "discount_percent")
    private Integer discountPercent;

    @Column(name = "dp_price", precision = 10, scale = 2)
    private BigDecimal dpPrice;

    @Column(nullable = false)
    private boolean active = true;

    public Product() {}

    public Product(String id, String name, BigDecimal price, BigDecimal originalPrice,
                   String categoryId, String subcategory, String image, boolean gstReduced,
                   boolean isVeg, boolean isNonVeg, int likesCount, String tags, boolean freeDelivery) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.originalPrice = originalPrice;
        this.categoryId = categoryId;
        this.subcategory = subcategory;
        this.image = image;
        this.gstReduced = gstReduced;
        this.isVeg = isVeg;
        this.isNonVeg = isNonVeg;
        this.likesCount = likesCount;
        this.tags = tags;
        this.freeDelivery = freeDelivery;
        this.active = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public boolean isGstReduced() { return gstReduced; }
    public void setGstReduced(boolean gstReduced) { this.gstReduced = gstReduced; }

    public boolean isVeg() { return isVeg; }
    public void setVeg(boolean veg) { isVeg = veg; }

    public boolean isNonVeg() { return isNonVeg; }
    public void setNonVeg(boolean nonVeg) { isNonVeg = nonVeg; }

    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public boolean isFreeDelivery() { return freeDelivery; }
    public void setFreeDelivery(boolean freeDelivery) { this.freeDelivery = freeDelivery; }

    public Long getPv() { return pv; }
    public void setPv(Long pv) { this.pv = pv; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public BigDecimal getDpPrice() { return dpPrice; }
    public void setDpPrice(BigDecimal dpPrice) { this.dpPrice = dpPrice; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
