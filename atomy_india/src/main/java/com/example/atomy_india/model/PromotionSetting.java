package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "promotion_settings")
public class PromotionSetting {

    @Id
    private String id;

    @Field("json_content")
    private String jsonContent;

    @Field("updated_at")
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
