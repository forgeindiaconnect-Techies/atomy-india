package com.example.atomy_india.repository;

import com.example.atomy_india.model.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findFirstByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(String email);
    void deleteByEmailIgnoreCase(String email);
}
