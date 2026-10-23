package com.example.atomy_india.repository;

import com.example.atomy_india.model.AdminProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminProfileRepository extends MongoRepository<AdminProfile, String> {
    Optional<AdminProfile> findFirstByOrderByIdAsc();
    Optional<AdminProfile> findByEmailIgnoreCase(String email);
}
