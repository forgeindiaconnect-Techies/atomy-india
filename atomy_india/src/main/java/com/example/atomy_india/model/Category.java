package com.example.atomy_india.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "categories")
public class Category {

    @Id
    private String id; // e.g. health, hemohim, beauty

    private String name;

    @Field("disp_ctg_no")
    private String dispCtgNo;

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
