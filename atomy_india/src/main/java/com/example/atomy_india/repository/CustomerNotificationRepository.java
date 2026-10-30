package com.example.atomy_india.repository;

import com.example.atomy_india.model.CustomerNotification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerNotificationRepository extends MongoRepository<CustomerNotification, String> {

    List<CustomerNotification> findByEmailOrderByCreatedAtDesc(String email);

    List<CustomerNotification> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    List<CustomerNotification> findByEmailAndIsReadFalseOrderByCreatedAtDesc(String email);

    List<CustomerNotification> findByEmailIgnoreCaseAndIsReadFalseOrderByCreatedAtDesc(String email);

    long countByEmailAndIsReadFalse(String email);

    long countByEmailIgnoreCaseAndIsReadFalse(String email);

    void deleteByEmail(String email);

    void deleteByEmailIgnoreCase(String email);
}
