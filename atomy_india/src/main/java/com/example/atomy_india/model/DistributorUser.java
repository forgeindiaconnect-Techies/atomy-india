package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "distributors")
public class DistributorUser {

    @Id
    private String distributorId; // e.g. "DIST-600001" or "DIST-110001"

    @Field("business_name")
    private String businessName;

    @Field("contact_person")
    private String contactPerson;

    private String email;

    private String phone;

    @Field("password_hash")
    private String passwordHash;

    @Field("assigned_pincodes")
    private List<String> assignedPincodes = new ArrayList<>();

    @Field("primary_pincode")
    private String primaryPincode;

    @Field("hub_address")
    private String hubAddress;

    private String city;

    private String state;

    @Field("gst_number")
    private String gstNumber;

    @Field("commission_rate")
    private Double commissionRate = 8.5;

    @Field("territory_fee")
    private BigDecimal territoryFee = BigDecimal.valueOf(15000);

    private String status = "ACTIVE"; // ACTIVE | SUSPENDED | PENDING

    private String role = "DISTRIBUTOR_ADMIN";

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public DistributorUser() {}

    public DistributorUser(String distributorId, String businessName, String contactPerson,
                           String email, String phone, String primaryPincode, String city, String state) {
        this.distributorId = distributorId;
        this.businessName = businessName;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.primaryPincode = primaryPincode;
        if (primaryPincode != null) {
            this.assignedPincodes.add(primaryPincode);
        }
        this.city = city;
        this.state = state;
        this.status = "ACTIVE";
        this.role = "DISTRIBUTOR_ADMIN";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getDistributorId() { return distributorId; }
    public void setDistributorId(String distributorId) { this.distributorId = distributorId; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public List<String> getAssignedPincodes() { return assignedPincodes; }
    public void setAssignedPincodes(List<String> assignedPincodes) { this.assignedPincodes = assignedPincodes; }

    public String getPrimaryPincode() { return primaryPincode; }
    public void setPrimaryPincode(String primaryPincode) { this.primaryPincode = primaryPincode; }

    public String getHubAddress() { return hubAddress; }
    public void setHubAddress(String hubAddress) { this.hubAddress = hubAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public BigDecimal getTerritoryFee() { return territoryFee; }
    public void setTerritoryFee(BigDecimal territoryFee) { this.territoryFee = territoryFee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

