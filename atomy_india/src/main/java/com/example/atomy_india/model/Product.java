package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.util.List;

@Document(collection = "products")
public class Product {

    @Id
    private String id; // e.g. D90178

    private String name;

    private BigDecimal price;

    private BigDecimal originalPrice;

    @Field("category_id")
    private String categoryId;

    private String subcategory;

    private String image;

    @Field("gallery_images")
    private List<String> galleryImages;

    @Field("gst_reduced")
    private Boolean gstReduced = false;

    @Field("is_veg")
    private Boolean isVeg = false;

    @Field("is_non_veg")
    private Boolean isNonVeg = false;

    @Field("likes_count")
    private Integer likesCount = 0;

    private String tags; // Comma-separated tags

    @Field("free_delivery")
    private Boolean freeDelivery = false;

    private Long pv = 0L;

    @Field("discount_percent")
    private Integer discountPercent = 0;

    @Field("dp_price")
    private BigDecimal dpPrice;

    private Boolean active = true;

    public Product() {}

    public Product(String id, String name, BigDecimal price, BigDecimal originalPrice,
                   String categoryId, String subcategory, String image, Boolean gstReduced,
                   Boolean isVeg, Boolean isNonVeg, Integer likesCount, String tags, Boolean freeDelivery) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.originalPrice = originalPrice;
        this.categoryId = categoryId;
        this.subcategory = subcategory;
        this.image = image;
        this.gstReduced = gstReduced != null ? gstReduced : false;
        this.isVeg = isVeg != null ? isVeg : false;
        this.isNonVeg = isNonVeg != null ? isNonVeg : false;
        this.likesCount = likesCount != null ? likesCount : 0;
        this.tags = tags;
        this.freeDelivery = freeDelivery != null ? freeDelivery : false;
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

    public List<String> getGalleryImages() { return galleryImages; }
    public void setGalleryImages(List<String> galleryImages) { this.galleryImages = galleryImages; }

    public Boolean isGstReduced() { return gstReduced != null ? gstReduced : false; }
    public Boolean getGstReduced() { return gstReduced != null ? gstReduced : false; }
    public void setGstReduced(Boolean gstReduced) { this.gstReduced = gstReduced != null ? gstReduced : false; }

    public Boolean isVeg() { return isVeg != null ? isVeg : false; }
    public Boolean getIsVeg() { return isVeg != null ? isVeg : false; }
    public void setVeg(Boolean veg) { isVeg = veg != null ? veg : false; }
    public void setIsVeg(Boolean veg) { isVeg = veg != null ? veg : false; }

    public Boolean isNonVeg() { return isNonVeg != null ? isNonVeg : false; }
    public Boolean getIsNonVeg() { return isNonVeg != null ? isNonVeg : false; }
    public void setNonVeg(Boolean nonVeg) { isNonVeg = nonVeg != null ? nonVeg : false; }
    public void setIsNonVeg(Boolean nonVeg) { isNonVeg = nonVeg != null ? nonVeg : false; }

    public Integer getLikesCount() { return likesCount != null ? likesCount : 0; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount != null ? likesCount : 0; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Boolean isFreeDelivery() { return freeDelivery != null ? freeDelivery : false; }
    public Boolean getFreeDelivery() { return freeDelivery != null ? freeDelivery : false; }
    public void setFreeDelivery(Boolean freeDelivery) { this.freeDelivery = freeDelivery != null ? freeDelivery : false; }

    public Long getPv() { return pv != null ? pv : 0L; }
    public void setPv(Long pv) { this.pv = pv != null ? pv : 0L; }

    public Integer getDiscountPercent() { return discountPercent != null ? discountPercent : 0; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent != null ? discountPercent : 0; }

    public BigDecimal getDpPrice() { return dpPrice; }
    public void setDpPrice(BigDecimal dpPrice) { this.dpPrice = dpPrice; }

    public Boolean isActive() { return active != null ? active : true; }
    public Boolean getActive() { return active != null ? active : true; }
    public void setActive(Boolean active) { this.active = active != null ? active : true; }
}
