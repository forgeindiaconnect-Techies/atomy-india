package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "admin_profiles")
public class AdminProfile {

    @Id
    private String id;

    private String name;

    private String email;

    private String phone;

    @Field("employee_id")
    private String employeeId;

    private String department;

    private String role;

    private String location;

    @Field("two_factor_enabled")
    private Boolean twoFactorEnabled = true;

    @Field("last_login")
    private String lastLogin;

    @Field("session_ip")
    private String sessionIp;

    @Field("updated_at")
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
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
