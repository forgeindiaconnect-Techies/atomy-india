package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "india_pincodes")
public class IndiaPincode {

    @Id
    private String pincode; // 6-digit PIN (e.g. "600001", "110001")

    @Field("office_name")
    private String officeName;

    private String district;

    private String state;

    private String division;

    private String circle;

    private String status = "VACANT"; // VACANT | ASSIGNED | RESERVED

    @Field("assigned_distributor_id")
    private String assignedDistributorId;

    @Field("assigned_distributor_name")
    private String assignedDistributorName;

    @Field("assigned_distributor_email")
    private String assignedDistributorEmail;

    @Field("assigned_distributor_phone")
    private String assignedDistributorPhone;

    @Field("assigned_at")
    private LocalDateTime assignedAt;

    @Field("territory_fee")
    private BigDecimal territoryFee = BigDecimal.valueOf(15000);

    @Field("commission_rate")
    private Double commissionRate = 8.5; // percentage

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public IndiaPincode() {}

    public IndiaPincode(String pincode, String officeName, String district, String state, String division, String circle) {
        this.pincode = pincode;
        this.officeName = officeName;
        this.district = district;
        this.state = state;
        this.division = division;
        this.circle = circle;
        this.status = "VACANT";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getOfficeName() { return officeName; }
    public void setOfficeName(String officeName) { this.officeName = officeName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public String getCircle() { return circle; }
    public void setCircle(String circle) { this.circle = circle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedDistributorId() { return assignedDistributorId; }
    public void setAssignedDistributorId(String assignedDistributorId) { this.assignedDistributorId = assignedDistributorId; }

    public String getAssignedDistributorName() { return assignedDistributorName; }
    public void setAssignedDistributorName(String assignedDistributorName) { this.assignedDistributorName = assignedDistributorName; }

    public String getAssignedDistributorEmail() { return assignedDistributorEmail; }
    public void setAssignedDistributorEmail(String assignedDistributorEmail) { this.assignedDistributorEmail = assignedDistributorEmail; }

    public String getAssignedDistributorPhone() { return assignedDistributorPhone; }
    public void setAssignedDistributorPhone(String assignedDistributorPhone) { this.assignedDistributorPhone = assignedDistributorPhone; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public BigDecimal getTerritoryFee() { return territoryFee; }
    public void setTerritoryFee(BigDecimal territoryFee) { this.territoryFee = territoryFee; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

