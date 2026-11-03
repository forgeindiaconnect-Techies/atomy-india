package com.example.atomy_india.repository;

import com.example.atomy_india.model.DistributorUser;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DistributorRepository extends MongoRepository<DistributorUser, String> {

    Optional<DistributorUser> findByEmailIgnoreCase(String email);

    Optional<DistributorUser> findByDistributorId(String distributorId);

    Optional<DistributorUser> findByPrimaryPincode(String primaryPincode);

    Optional<DistributorUser> findByAssignedPincodesContaining(String pincode);

    List<DistributorUser> findByStatus(String status);

    long countByStatus(String status);
}

