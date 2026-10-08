package com.example.atomy_india.dto;

public class AddCheckpointRequest {
    private String status;    // e.g. "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"
    private String location;  // e.g. "Delhi Hub", "Near Customer Destination"
    private String description; // e.g. "Package has left transit hub"

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
