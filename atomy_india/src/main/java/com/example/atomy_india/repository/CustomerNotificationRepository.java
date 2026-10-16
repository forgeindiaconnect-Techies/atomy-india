package com.example.atomy_india.repository;

import com.example.atomy_india.model.CustomerNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerNotificationRepository extends JpaRepository<CustomerNotification, Long> {

    List<CustomerNotification> findByEmailOrderByCreatedAtDesc(String email);

    List<CustomerNotification> findByEmailAndIsReadFalseOrderByCreatedAtDesc(String email);

    long countByEmailAndIsReadFalse(String email);

    void deleteByEmail(String email);
}
