package com.example.atomy_india.controller.admin;

import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.CustomerUser;
import com.example.atomy_india.model.Membership;
import com.example.atomy_india.repository.CustomerOrderRepository;
import com.example.atomy_india.repository.CustomerUserRepository;
import com.example.atomy_india.repository.MembershipRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/customers")
@CrossOrigin(origins = "*")
public class AdminCustomerController {

    private final CustomerUserRepository customerUserRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final MembershipRepository membershipRepository;

    public AdminCustomerController(CustomerUserRepository customerUserRepository,
                                   CustomerOrderRepository customerOrderRepository,
                                   MembershipRepository membershipRepository) {
        this.customerUserRepository = customerUserRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.membershipRepository = membershipRepository;
    }

    /**
     * GET /api/admin/customers
     * Returns all registered customers enriched with order history, spend amount, and membership status
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCustomers() {
        List<CustomerUser> registered = customerUserRepository.findAllByOrderByCreatedAtDesc();
        List<CustomerOrder> allOrders = customerOrderRepository.findAll();
        List<Membership> allMemberships = membershipRepository.findAll();

        // Index orders by customer email (case-insensitive)
        Map<String, List<CustomerOrder>> ordersByEmail = new HashMap<>();
        for (CustomerOrder o : allOrders) {
            if (o.getCustomerEmail() != null) {
                String emailKey = o.getCustomerEmail().trim().toLowerCase();
                ordersByEmail.computeIfAbsent(emailKey, k -> new ArrayList<>()).add(o);
            }
        }

        // Index active memberships by customer email
        Set<String> memberEmails = new HashSet<>();
        for (Membership m : allMemberships) {
            if (m.getCustomerEmail() != null && "ACTIVE".equalsIgnoreCase(m.getStatus())) {
                memberEmails.add(m.getCustomerEmail().trim().toLowerCase());
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        Set<String> processedEmails = new HashSet<>();

        // 1. Process all newly registered customers from the customers table
        for (CustomerUser u : registered) {
            String email = u.getEmail() != null ? u.getEmail().trim().toLowerCase() : "";
            processedEmails.add(email);

            List<CustomerOrder> userOrders = ordersByEmail.getOrDefault(email, Collections.emptyList());
            BigDecimal totalSpent = BigDecimal.ZERO;
            for (CustomerOrder ord : userOrders) {
                if (ord.getTotalAmount() != null) {
                    totalSpent = totalSpent.add(ord.getTotalAmount());
                }
            }

            boolean isDistributorMember = (u.getIsMember() != null && u.getIsMember()) || memberEmails.contains(email);

            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("customerId", u.getCustomerId());
            map.put("name", u.getFullName());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("address", u.getAddress());
            map.put("city", u.getCity() != null && !u.getCity().isEmpty() ? u.getCity() : "New Delhi");
            map.put("state", u.getState() != null && !u.getState().isEmpty() ? u.getState() : "Delhi");
            map.put("pincode", u.getPincode());
            map.put("totalOrders", userOrders.size());
            map.put("totalSpent", totalSpent);
            map.put("isMember", isDistributorMember);
            map.put("tier", totalSpent.compareTo(new BigDecimal(25000)) >= 0 ? "VIP Member" :
                    totalSpent.compareTo(new BigDecimal(10000)) >= 0 ? "Gold Customer" :
                    isDistributorMember ? "Distributor Member" : "Standard Customer");
            map.put("source", u.getRegistrationSource());
            map.put("createdAt", u.getCreatedAt());
            map.put("lastLoginAt", u.getLastLoginAt());
            result.add(map);
        }

        // 2. Also include any legacy guest customers who placed an order before signing up
        for (CustomerOrder o : allOrders) {
            if (o.getCustomerEmail() != null) {
                String email = o.getCustomerEmail().trim().toLowerCase();
                if (!processedEmails.contains(email)) {
                    processedEmails.add(email);
                    List<CustomerOrder> userOrders = ordersByEmail.getOrDefault(email, Collections.emptyList());
                    BigDecimal totalSpent = BigDecimal.ZERO;
                    for (CustomerOrder ord : userOrders) {
                        if (ord.getTotalAmount() != null) {
                            totalSpent = totalSpent.add(ord.getTotalAmount());
                        }
                    }
                    boolean isMember = memberEmails.contains(email);

                    Map<String, Object> map = new HashMap<>();
                    map.put("customerId", "CUST-GUEST-" + Math.abs(email.hashCode() % 100000));
                    map.put("name", o.getCustomerName());
                    map.put("email", o.getCustomerEmail());
                    map.put("phone", o.getCustomerPhone());
                    map.put("city", o.getCity() != null ? o.getCity() : "New Delhi");
                    map.put("state", o.getState() != null ? o.getState() : "Delhi");
                    map.put("totalOrders", userOrders.size());
                    map.put("totalSpent", totalSpent);
                    map.put("isMember", isMember);
                    map.put("tier", totalSpent.compareTo(new BigDecimal(25000)) >= 0 ? "VIP Member" : "Standard Customer");
                    map.put("source", "ORDER_CHECKOUT");
                    map.put("createdAt", o.getCreatedAt());
                    result.add(map);
                }
            }
        }

        return ResponseEntity.ok(result);
    }

    /**
     * PUT /api/admin/customers/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return customerUserRepository.findById(id).map(customer -> {
            if (payload.containsKey("email") && payload.get("email") != null) {
                customer.setEmail(String.valueOf(payload.get("email")).trim());
            }
            if (payload.containsKey("name") && payload.get("name") != null) {
                customer.setFullName(String.valueOf(payload.get("name")).trim());
            }
            if (payload.containsKey("phone") && payload.get("phone") != null) {
                customer.setPhone(String.valueOf(payload.get("phone")).trim());
            }
            if (payload.containsKey("city") && payload.get("city") != null) {
                customer.setCity(String.valueOf(payload.get("city")).trim());
            }
            if (payload.containsKey("state") && payload.get("state") != null) {
                customer.setState(String.valueOf(payload.get("state")).trim());
            }
            if (payload.containsKey("address") && payload.get("address") != null) {
                customer.setAddress(String.valueOf(payload.get("address")).trim());
            }
            if (payload.containsKey("pincode") && payload.get("pincode") != null) {
                customer.setPincode(String.valueOf(payload.get("pincode")).trim());
            }
            customerUserRepository.save(customer);
            return ResponseEntity.ok(Map.of("success", true, "message", "Customer updated", "customer", customer));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/admin/customers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        if (customerUserRepository.existsById(id)) {
            customerUserRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Customer removed"));
        }
        return ResponseEntity.notFound().build();
    }
}
