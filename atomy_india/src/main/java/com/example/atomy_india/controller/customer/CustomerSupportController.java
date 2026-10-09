package com.example.atomy_india.controller.customer;

import com.example.atomy_india.dto.CreateTicketRequest;
import com.example.atomy_india.dto.ReplyTicketRequest;
import com.example.atomy_india.model.SupportTicket;
import com.example.atomy_india.model.TicketMessage;
import com.example.atomy_india.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class CustomerSupportController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/tickets")
    public ResponseEntity<java.util.List<SupportTicket>> getTicketsByEmail(@RequestParam(required = false) String email) {
        if (email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(customerService.getTicketsByEmail(email.trim()));
        }
        return ResponseEntity.ok(customerService.getAllRecentTickets());
    }

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicket> createTicket(@RequestBody CreateTicketRequest req) {
        return ResponseEntity.ok(customerService.createTicket(req));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<SupportTicket> getTicket(@PathVariable String ticketId) {
        return customerService.getTicketById(ticketId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping({"/tickets/{ticketId}/messages", "/tickets/{ticketId}/reply"})
    public ResponseEntity<TicketMessage> replyTicket(
            @PathVariable String ticketId,
            @RequestBody ReplyTicketRequest req) {
        return ResponseEntity.ok(customerService.addCustomerMessageToTicket(ticketId, req.getMessage()));
    }
}
