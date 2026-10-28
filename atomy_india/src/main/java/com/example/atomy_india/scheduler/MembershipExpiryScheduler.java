package com.example.atomy_india.scheduler;

import com.example.atomy_india.model.Membership;
import com.example.atomy_india.repository.CustomerUserRepository;
import com.example.atomy_india.repository.MembershipRepository;
import com.example.atomy_india.service.BrevoEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Background automated scheduler that scans for expired active memberships
 * and automatically dispatches an expiration notice email via Brevo.
 */
@Component
public class MembershipExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(MembershipExpiryScheduler.class);

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private CustomerUserRepository customerUserRepository;

    @Autowired
    private BrevoEmailService brevoEmailService;

    // Run automatically every 6 hours, and 2 minutes after startup
    @Scheduled(initialDelay = 120000, fixedDelay = 21600000)
    public void scanAndNotifyExpiredMemberships() {
        log.info("Running automated background scan for expired distributor memberships...");
        try {
            List<Membership> activeList = membershipRepository.findAllByOrderByCreatedAtDesc();
            LocalDateTime now = LocalDateTime.now();
            int notifiedCount = 0;

            for (Membership m : activeList) {
                if ("ACTIVE".equalsIgnoreCase(m.getStatus()) && m.getExpiryDate() != null && m.getExpiryDate().isBefore(now)) {
                    m.setStatus("EXPIRED");
                    if (!Boolean.TRUE.equals(m.getExpiredEmailSent())) {
                        m.setExpiredEmailSent(true);
                        brevoEmailService.sendMembershipExpiredEmail(m);
                        notifiedCount++;
                    }
                    membershipRepository.save(m);

                    if (m.getCustomerEmail() != null) {
                        customerUserRepository.findByEmail(m.getCustomerEmail()).ifPresent(u -> {
                            u.setIsMember(false);
                            customerUserRepository.save(u);
                        });
                    }
                }
            }

            if (notifiedCount > 0) {
                log.info("Membership Expiry Scanner: Dispatched expiration notice emails for {} member(s).", notifiedCount);
            } else {
                log.info("Membership Expiry Scanner: All active memberships are currently valid.");
            }
        } catch (Exception e) {
            log.error("Error during automated membership expiry scan: {}", e.getMessage(), e);
        }
    }
}
