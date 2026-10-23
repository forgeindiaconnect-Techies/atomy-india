package com.example.atomy_india.repository;

import com.example.atomy_india.model.TicketMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketMessageRepository extends MongoRepository<TicketMessage, String> {
}
