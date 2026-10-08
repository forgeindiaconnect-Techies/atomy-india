package com.example.atomy_india.repository;

import com.example.atomy_india.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, String> {

    List<Membership> findAllByOrderByCreatedAtDesc();

    List<Membership> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);

    Optional<Membership> findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(String customerEmail, String status);

    long countByStatus(String status);

    long countByPlanAndStatus(String plan, String status);
}
