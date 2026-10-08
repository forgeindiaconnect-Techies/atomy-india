package com.example.atomy_india.repository;

import com.example.atomy_india.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByActiveTrue();
    List<Product> findByCategoryIdAndActiveTrue(String categoryId);
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String query);
}
