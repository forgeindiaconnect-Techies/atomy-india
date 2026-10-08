package com.example.atomy_india.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotion_settings")
public class PromotionSetting {

    @Id
    @Column(length = 64)
    private String id;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String jsonContent;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PromotionSetting() {
        this.updatedAt = LocalDateTime.now();
    }

    public PromotionSetting(String id, String jsonContent) {
        this.id = id;
        this.jsonContent = jsonContent;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getJsonContent() {
        return jsonContent;
    }

    public void setJsonContent(String jsonContent) {
        this.jsonContent = jsonContent;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
