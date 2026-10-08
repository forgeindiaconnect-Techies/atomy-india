package com.example.atomy_india.controller.admin;

import com.example.atomy_india.dto.ReplyTicketRequest;
import com.example.atomy_india.model.SupportTicket;
import com.example.atomy_india.model.TicketMessage;
import com.example.atomy_india.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/support")
@CrossOrigin(origins = "*")
public class AdminSupportController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getAllTickets(
            @RequestParam(required = false) SupportTicket.TicketStatus status) {
        return ResponseEntity.ok(adminService.getAllTickets(status));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<SupportTicket> getTicketDetails(@PathVariable String ticketId) {
        return adminService.getTicketDetails(ticketId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/tickets/{ticketId}/status")
    public ResponseEntity<SupportTicket> updateTicketStatus(
            @PathVariable String ticketId,
            @RequestBody Map<String, String> body) {
        try {
            SupportTicket.TicketStatus status = SupportTicket.TicketStatus.valueOf(body.get("status"));
            return ResponseEntity.ok(adminService.updateTicketStatus(ticketId, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/tickets/{ticketId}/reply")
    public ResponseEntity<TicketMessage> replyToTicket(
            @PathVariable String ticketId,
            @RequestBody ReplyTicketRequest req) {
        return ResponseEntity.ok(adminService.adminReplyToTicket(ticketId, req.getMessage()));
    }
}
