package com.example.atomy_india.repository;

import com.example.atomy_india.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, String> {
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
    List<SupportTicket> findByStatusOrderByCreatedAtDesc(SupportTicket.TicketStatus status);
    List<SupportTicket> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    long countByStatus(SupportTicket.TicketStatus status);
}
