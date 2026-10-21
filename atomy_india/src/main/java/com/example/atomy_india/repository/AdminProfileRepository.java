package com.example.atomy_india.repository;

import com.example.atomy_india.model.AdminProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminProfileRepository extends JpaRepository<AdminProfile, Long> {
    Optional<AdminProfile> findFirstByOrderByIdAsc();
    Optional<AdminProfile> findByEmailIgnoreCase(String email);
}
