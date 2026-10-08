package com.example.atomy_india.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @Column(length = 32)
    private String id; // e.g. health, hemohim, beauty

    @Column(nullable = false)
    private String name;

    @Column(name = "disp_ctg_no")
    private String dispCtgNo;

    @Column(length = 1024)
    private String subcategories; // Comma-separated list of subcategories

    public Category() {}

    public Category(String id, String name, String dispCtgNo, String subcategories) {
        this.id = id;
        this.name = name;
        this.dispCtgNo = dispCtgNo;
        this.subcategories = subcategories;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDispCtgNo() { return dispCtgNo; }
    public void setDispCtgNo(String dispCtgNo) { this.dispCtgNo = dispCtgNo; }

    public String getSubcategories() { return subcategories; }
    public void setSubcategories(String subcategories) { this.subcategories = subcategories; }
}
