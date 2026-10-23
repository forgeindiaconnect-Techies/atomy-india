package com.example.atomy_india.repository;

import com.example.atomy_india.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByActiveTrue();
    List<Product> findByCategoryIdAndActiveTrue(String categoryId);
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String query);
}
