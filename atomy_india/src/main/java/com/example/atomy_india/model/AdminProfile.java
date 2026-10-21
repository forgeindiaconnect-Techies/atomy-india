package com.example.atomy_india.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_profiles")
public class AdminProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "department")
    private String department;

    @Column(name = "role")
    private String role;

    @Column(name = "location")
    private String location;

    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled = true;

    @Column(name = "last_login")
    private String lastLogin;

    @Column(name = "session_ip")
    private String sessionIp;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AdminProfile() {
        this.updatedAt = LocalDateTime.now();
    }

    public AdminProfile(String name, String email, String phone, String employeeId, String department, String role, String location, Boolean twoFactorEnabled, String sessionIp) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.employeeId = employeeId;
        this.department = department;
        this.role = role;
        this.location = location;
        this.twoFactorEnabled = twoFactorEnabled != null ? twoFactorEnabled : true;
        this.sessionIp = sessionIp;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getSessionIp() {
        return sessionIp;
    }

    public void setSessionIp(String sessionIp) {
        this.sessionIp = sessionIp;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
