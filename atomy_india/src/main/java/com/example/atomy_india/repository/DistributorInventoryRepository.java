package com.example.atomy_india.repository;

import com.example.atomy_india.model.DistributorInventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DistributorInventoryRepository extends MongoRepository<DistributorInventory, String> {

    List<DistributorInventory> findByDistributorId(String distributorId);

    List<DistributorInventory> findByPincode(String pincode);

    Optional<DistributorInventory> findByDistributorIdAndProductId(String distributorId, String productId);

    Optional<DistributorInventory> findByPincodeAndProductId(String pincode, String productId);

    void deleteByDistributorId(String distributorId);
}

