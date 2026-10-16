package com.example.atomy_india.controller.customer;

import com.example.atomy_india.model.CustomerNotification;
import com.example.atomy_india.repository.CustomerNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/notifications", "/api/customer/notifications"})
@CrossOrigin(origins = "*")
public class CustomerNotificationController {

    @Autowired
    private CustomerNotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<CustomerNotification>> getNotifications(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(notificationRepository.findByEmailOrderByCreatedAtDesc(email.trim().toLowerCase()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        long count = notificationRepository.countByEmailAndIsReadFalse(email.trim().toLowerCase());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping
    public ResponseEntity<CustomerNotification> createNotification(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String title = (String) payload.get("title");
        String message = (String) payload.get("message");
        String type = (String) payload.getOrDefault("type", "general");
        String orderId = (String) payload.get("orderId");

        if (email == null || email.trim().isEmpty() || title == null || message == null) {
            return ResponseEntity.badRequest().build();
        }

        CustomerNotification notif = new CustomerNotification(
                email.trim().toLowerCase(),
                title.trim(),
                message.trim(),
                type,
                orderId
        );
        return ResponseEntity.ok(notificationRepository.save(notif));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setRead(true);
            notificationRepository.save(notif);
            return ResponseEntity.ok(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<CustomerNotification> unread = notificationRepository.findByEmailAndIsReadFalseOrderByCreatedAtDesc(email.trim().toLowerCase());
        for (CustomerNotification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok(Map.of("success", true, "markedCount", unread.size()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @Transactional
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAll(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        notificationRepository.deleteByEmail(email.trim().toLowerCase());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
