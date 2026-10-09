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
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String statusStr = status;
            if ((statusStr == null || statusStr.isEmpty()) && body != null && body.containsKey("status")) {
                statusStr = body.get("status");
            }
            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            SupportTicket.TicketStatus newStatus = SupportTicket.TicketStatus.valueOf(statusStr.toUpperCase());
            return ResponseEntity.ok(adminService.updateTicketStatus(ticketId, newStatus));
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

    @DeleteMapping("/tickets")
    public ResponseEntity<Map<String, String>> clearAllTickets() {
        adminService.clearAllTickets();
        return ResponseEntity.ok(Map.of("message", "All support tickets cleared successfully"));
    }

    @DeleteMapping("/tickets/{ticketId}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String ticketId) {
        adminService.deleteTicket(ticketId);
        return ResponseEntity.ok().build();
    }
}
