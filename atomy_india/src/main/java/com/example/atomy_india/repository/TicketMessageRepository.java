package com.example.atomy_india.repository;

import com.example.atomy_india.model.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicket_TicketIdOrderBySentAtAsc(String ticketId);
}
