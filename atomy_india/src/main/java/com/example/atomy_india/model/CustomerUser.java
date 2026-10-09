package com.example.atomy_india.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class CustomerUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", unique = true, length = 64)
    private String customerId; // e.g. CUST-20261009-4821

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "username", unique = true, length = 64)
    private String username;

    @Column(name = "email", unique = true, nullable = false, length = 128)
    private String email;

    @Column(name = "phone", length = 32)
    private String phone;

    @Column(name = "password", length = 256)
    private String password;

    @Column(name = "address", length = 512)
    private String address;

    @Column(name = "city", length = 64)
    private String city;

    @Column(name = "state", length = 64)
    private String state;

    @Column(name = "pincode", length = 16)
    private String pincode;

    @Column(name = "role", length = 32)
    private String role; // CUSTOMER

    @Column(name = "is_member")
    private Boolean isMember = false;

    @Column(name = "registration_source", length = 64)
    private String registrationSource; // EMAIL_SIGNUP | GOOGLE_OAUTH | MANUAL

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    public CustomerUser() {
        this.createdAt = LocalDateTime.now();
        this.role = "CUSTOMER";
        this.isMember = false;
        this.registrationSource = "EMAIL_SIGNUP";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getIsMember() {
        return isMember;
    }

    public void setIsMember(Boolean member) {
        isMember = member;
    }

    public String getRegistrationSource() {
        return registrationSource;
    }

    public void setRegistrationSource(String registrationSource) {
        this.registrationSource = registrationSource;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}
