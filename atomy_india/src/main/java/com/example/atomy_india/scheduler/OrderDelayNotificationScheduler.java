package com.example.atomy_india.scheduler;

import com.example.atomy_india.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Background automated task scheduler that scans for customer orders
 * that have exceeded their delivery window (SLA) and automatically
 * sends an apology email via Brevo with updated transit status.
 */
@Component
public class OrderDelayNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrderDelayNotificationScheduler.class);

    @Autowired
    private AdminService adminService;

    // Run automatically every 4 hours, and 1 minute after application startup
    @Scheduled(initialDelay = 60000, fixedDelay = 14400000)
    public void scanAndNotifyDelayedOrders() {
        log.info("Running automated background scan for delayed orders...");
        try {
            int emailsSent = adminService.processAndSendAutomatedDelayEmails();
            if (emailsSent > 0) {
                log.info("Automated Delay Scanner: Dispatched apology emails for {} delayed order(s).", emailsSent);
            } else {
                log.info("Automated Delay Scanner: All active orders are within delivery SLA or already notified.");
            }
        } catch (Exception e) {
            log.error("Error during automated delayed orders scan: {}", e.getMessage(), e);
        }
    }
}
