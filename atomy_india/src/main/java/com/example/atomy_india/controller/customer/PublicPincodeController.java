package com.example.atomy_india.controller.customer;

import com.example.atomy_india.model.DistributorUser;
import com.example.atomy_india.model.IndiaPincode;
import com.example.atomy_india.repository.DistributorRepository;
import com.example.atomy_india.repository.IndiaPincodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/pincodes")
@CrossOrigin(origins = "*")
public class PublicPincodeController {

    @Autowired
    private IndiaPincodeRepository indiaPincodeRepository;

    @Autowired
    private DistributorRepository distributorRepository;

    @GetMapping("/active-hubs")
    public ResponseEntity<?> getActiveHubs() {
        List<Map<String, Object>> hubs = new ArrayList<>();
        Set<String> seenPins = new HashSet<>();

        // 1. Load registered active regional distributors from DB
        try {
            List<DistributorUser> dists = distributorRepository.findAll();
            for (DistributorUser d : dists) {
                if ("ACTIVE".equalsIgnoreCase(d.getStatus()) || d.getStatus() == null) {
                    String pin = d.getPrimaryPincode();
                    if (pin != null && !pin.trim().isEmpty() && !seenPins.contains(pin.trim())) {
                        Map<String, Object> h = new HashMap<>();
                        h.put("pin", pin.trim());
                        String name = d.getBusinessName() != null && !d.getBusinessName().trim().isEmpty()
                                ? d.getBusinessName().trim()
                                : (d.getContactPerson() != null && !d.getContactPerson().trim().isEmpty() ? d.getContactPerson().trim() : "Regional Hub");
                        h.put("name", name.toLowerCase().contains("hub") ? name : name + " Hub");
                        h.put("city", d.getCity() != null ? d.getCity() : "Regional Hub");
                        h.put("state", d.getState() != null ? d.getState() : "India");
                        h.put("isDistributor", true);
                        hubs.add(h);
                        seenPins.add(pin.trim());
                    }
                }
            }
        } catch (Exception e) {
            // Log and continue with default hubs
        }

        // 2. Ensure Krishnagiri Regional Hub and national hubs are present
        addDefaultHubIfNotPresent(hubs, seenPins, "635001", "Krishnagiri Regional Hub", "Krishnagiri", "Tamil Nadu");
        addDefaultHubIfNotPresent(hubs, seenPins, "110001", "Delhi Central Hub", "New Delhi", "Delhi");
        addDefaultHubIfNotPresent(hubs, seenPins, "560001", "Bengaluru South Hub", "Bengaluru", "Karnataka");
        addDefaultHubIfNotPresent(hubs, seenPins, "600001", "Chennai Super Hub", "Chennai", "Tamil Nadu");
        addDefaultHubIfNotPresent(hubs, seenPins, "400001", "Mumbai Super Hub", "Mumbai", "Maharashtra");
        addDefaultHubIfNotPresent(hubs, seenPins, "700001", "Kolkata Super Hub", "Kolkata", "West Bengal");
        addDefaultHubIfNotPresent(hubs, seenPins, "500001", "Hyderabad Hub", "Hyderabad", "Telangana");

        return ResponseEntity.ok(hubs);
    }

    private void addDefaultHubIfNotPresent(List<Map<String, Object>> hubs, Set<String> seenPins,
                                          String pin, String name, String city, String state) {
        if (!seenPins.contains(pin)) {
            Map<String, Object> h = new HashMap<>();
            h.put("pin", pin);
            h.put("name", name);
            h.put("city", city);
            h.put("state", state);
            h.put("isDistributor", true);
            hubs.add(h);
            seenPins.add(pin);
        }
    }

    @GetMapping("/lookup")
    public ResponseEntity<?> lookupPincode(@RequestParam String pincode) {
        if (pincode == null || pincode.trim().length() < 6) {
            Map<String, Object> err = new HashMap<>();
            err.put("valid", false);
            err.put("message", "Please enter a valid 6-digit Indian PIN code");
            return ResponseEntity.badRequest().body(err);
        }

        String pin = pincode.trim();
        Optional<IndiaPincode> pinOpt = indiaPincodeRepository.findByPincode(pin);

        Map<String, Object> res = new HashMap<>();
        if (pinOpt.isPresent()) {
            IndiaPincode p = pinOpt.get();
            res.put("valid", true);
            res.put("pincode", p.getPincode());
            res.put("officeName", p.getOfficeName());
            res.put("district", p.getDistrict());
            res.put("state", p.getState());
            res.put("circle", p.getCircle());
            res.put("isAssigned", "ASSIGNED".equalsIgnoreCase(p.getStatus()));
            res.put("distributorName", p.getAssignedDistributorName());
            res.put("isDeliverable", true);
            res.put("deliveryTimeFrame", "Within 2 Days via Nearby Hub");
            return ResponseEntity.ok(res);
        }

        // Generic fallback for any Indian 6-digit PIN code
        res.put("valid", true);
        res.put("pincode", pin);
        res.put("officeName", "Local Delivery Hub (" + pin + ")");
        res.put("district", "General Delivery Zone");
        res.put("state", "India");
        res.put("isAssigned", false);
        res.put("isDeliverable", true);
        res.put("deliveryTimeFrame", "Within 2-3 Days via Central Hub");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/hub-details")
    public ResponseEntity<?> getHubDetails(@RequestParam(required = false) String pincode) {
        String pin = (pincode != null) ? pincode.trim() : "";
        DistributorUser foundDist = null;

        if (!pin.isEmpty()) {
            Optional<DistributorUser> byPrimary = distributorRepository.findByPrimaryPincode(pin);
            if (byPrimary.isPresent() && ("ACTIVE".equalsIgnoreCase(byPrimary.get().getStatus()) || byPrimary.get().getStatus() == null)) {
                foundDist = byPrimary.get();
            } else {
                Optional<DistributorUser> byAssigned = distributorRepository.findByAssignedPincodesContaining(pin);
                if (byAssigned.isPresent() && ("ACTIVE".equalsIgnoreCase(byAssigned.get().getStatus()) || byAssigned.get().getStatus() == null)) {
                    foundDist = byAssigned.get();
                } else {
                    Optional<IndiaPincode> ipOpt = indiaPincodeRepository.findByPincode(pin);
                    if (ipOpt.isPresent() && ipOpt.get().getAssignedDistributorId() != null && !ipOpt.get().getAssignedDistributorId().trim().isEmpty()) {
                        Optional<DistributorUser> byId = distributorRepository.findByDistributorId(ipOpt.get().getAssignedDistributorId());
                        if (byId.isPresent() && ("ACTIVE".equalsIgnoreCase(byId.get().getStatus()) || byId.get().getStatus() == null)) {
                            foundDist = byId.get();
                        }
                    }
                }
            }
        }

        Map<String, Object> res = new HashMap<>();
        if (foundDist != null) {
            res.put("found", true);
            res.put("distributorId", foundDist.getDistributorId());
            res.put("hubName", foundDist.getBusinessName() != null ? foundDist.getBusinessName() : "Atomy Regional Logistics Hub");
            res.put("contactPerson", foundDist.getContactPerson() != null ? foundDist.getContactPerson() : "Hub Manager");
            res.put("phone", foundDist.getPhone() != null ? foundDist.getPhone() : "+91 98401 23456");
            res.put("email", foundDist.getEmail() != null ? foundDist.getEmail() : "support.logistics@atomy.com");
            res.put("pincode", foundDist.getPrimaryPincode() != null ? foundDist.getPrimaryPincode() : pin);
            res.put("city", foundDist.getCity() != null ? foundDist.getCity() : "Regional Hub");
            res.put("state", foundDist.getState() != null ? foundDist.getState() : "India");
            res.put("hubAddress", foundDist.getHubAddress() != null && !foundDist.getHubAddress().trim().isEmpty()
                    ? foundDist.getHubAddress()
                    : foundDist.getBusinessName() + ", Near Main Depot, " + foundDist.getCity() + " - " + foundDist.getPrimaryPincode());
            res.put("operatingHours", "Mon – Sat: 9:30 AM – 7:30 PM (Sun: 10:00 AM – 2:00 PM)");
            res.put("pickupInstructions", "Present your Order ID or downloaded Invoice PDF at the hub counter to collect your packed items.");
        } else {
            res.put("found", false);
            res.put("distributorId", null);
            res.put("hubName", "No Regional Hub Available");
            res.put("contactPerson", "Regional Delivery Desk");
            res.put("phone", "+91 1800 123 4567");
            res.put("email", "support.india@atomy.com");
            res.put("pincode", pin.isEmpty() ? "110001" : pin);
            res.put("city", "Unavailable");
            res.put("state", "India");
            res.put("hubAddress", "No regional distributor hub currently serves PIN " + pin);
            res.put("operatingHours", "N/A");
            res.put("pickupInstructions", "Delivery is currently unavailable for this PIN code.");
            res.put("isDeliverable", false);
            res.put("message", "Delivery is currently not available for PIN " + pin);
        }
        return ResponseEntity.ok(res);
    }
}

