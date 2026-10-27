package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "password_resets")
public class PasswordResetToken {

    @Id
    private String id;

    @Indexed
    private String email;

    private String otp;

    private LocalDateTime expiresAt;

    private boolean used = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public PasswordResetToken() {}

    public PasswordResetToken(String email, String otp, LocalDateTime expiresAt) {
        this.email = (email != null) ? email.trim().toLowerCase() : "";
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.used = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isExpired() {
        return expiresAt == null || LocalDateTime.now().isAfter(expiresAt);
    }
}
