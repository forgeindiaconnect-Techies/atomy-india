package com.example.atomy_india.repository;

import com.example.atomy_india.model.CustomerUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerUserRepository extends JpaRepository<CustomerUser, Long> {

    Optional<CustomerUser> findByEmail(String email);

    Optional<CustomerUser> findByUsername(String username);

    Optional<CustomerUser> findByCustomerId(String customerId);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<CustomerUser> findAllByOrderByCreatedAtDesc();
}
