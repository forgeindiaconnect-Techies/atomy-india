package com.example.atomy_india.repository;

import com.example.atomy_india.model.IndiaPincode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IndiaPincodeRepository extends MongoRepository<IndiaPincode, String> {

    Optional<IndiaPincode> findByPincode(String pincode);

    List<IndiaPincode> findByStatus(String status);

    List<IndiaPincode> findByAssignedDistributorId(String distributorId);

    long countByStatus(String status);

    Page<IndiaPincode> findByStateIgnoreCase(String state, Pageable pageable);

    Page<IndiaPincode> findByDistrictIgnoreCase(String district, Pageable pageable);

    @Query("{ '$or': [ " +
           "{ 'pincode': { $regex: ?0, $options: 'i' } }, " +
           "{ 'office_name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'district': { $regex: ?0, $options: 'i' } }, " +
           "{ 'state': { $regex: ?0, $options: 'i' } }, " +
           "{ 'assigned_distributor_name': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<IndiaPincode> searchPincodes(String query, Pageable pageable);

    @Query("{ 'status': ?1, '$or': [ " +
           "{ 'pincode': { $regex: ?0, $options: 'i' } }, " +
           "{ 'office_name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'district': { $regex: ?0, $options: 'i' } }, " +
           "{ 'state': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<IndiaPincode> searchPincodesWithStatus(String query, String status, Pageable pageable);
}

