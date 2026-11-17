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
                if ("ACTIVE".equalsIgnoreCase(d.getStatus()) || "ON_LEAVE".equalsIgnoreCase(d.getStatus()) || d.getStatus() == null) {
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

        // 2. Fallback to only registered active distributor hubs (no dummy Central Hubs)
        return ResponseEntity.ok(hubs);
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
            boolean isAssigned = "ASSIGNED".equalsIgnoreCase(p.getStatus()) && p.getAssignedDistributorId() != null;
            res.put("isAssigned", isAssigned);
            res.put("distributorName", p.getAssignedDistributorName());
            res.put("isDeliverable", isAssigned);
            res.put("deliveryTimeFrame", isAssigned ? "Within 2 Days via Regional Hub" : "No Regional Hub Serving This Location");
            return ResponseEntity.ok(res);
        }

        // Generic fallback for any Indian 6-digit PIN code without an active hub
        res.put("valid", true);
        res.put("pincode", pin);
        res.put("officeName", "Local Area (" + pin + ")");
        res.put("district", "General Delivery Zone");
        res.put("state", "India");
        res.put("isAssigned", false);
        res.put("isDeliverable", false);
        res.put("deliveryTimeFrame", "No Regional Hub Serving This Location");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/hub-details")
    public ResponseEntity<?> getHubDetails(@RequestParam(required = false) String pincode) {
        String pin = (pincode != null) ? pincode.trim() : "";
        DistributorUser primaryDist = null;

        if (!pin.isEmpty()) {
            // 1. Try finding primary manager for this pincode
            List<DistributorUser> byPrimaryRoleList = distributorRepository.findByPrimaryPincodeAndDistributorRole(pin, "PRIMARY_MANAGER");
            if (!byPrimaryRoleList.isEmpty()) {
                primaryDist = byPrimaryRoleList.get(0);
            } else {
                List<DistributorUser> byPinList = distributorRepository.findByPrimaryPincode(pin);
                if (!byPinList.isEmpty()) {
                    primaryDist = byPinList.stream()
                            .filter(d -> !"SUB_DISTRIBUTOR".equalsIgnoreCase(d.getDistributorRole()))
                            .findFirst()
                            .orElse(byPinList.get(0));
                }
            }

            // 2. Try assigned pincodes
            if (primaryDist == null) {
                List<DistributorUser> byAssignedList = distributorRepository.findByAssignedPincodesContaining(pin);
                if (!byAssignedList.isEmpty()) {
                    primaryDist = byAssignedList.stream()
                            .filter(d -> !"SUB_DISTRIBUTOR".equalsIgnoreCase(d.getDistributorRole()))
                            .findFirst()
                            .orElse(byAssignedList.get(0));
                }
            }

            // 3. Try IndiaPincode table
            if (primaryDist == null) {
                Optional<IndiaPincode> ipOpt = indiaPincodeRepository.findByPincode(pin);
                if (ipOpt.isPresent() && ipOpt.get().getAssignedDistributorId() != null && !ipOpt.get().getAssignedDistributorId().trim().isEmpty()) {
                    primaryDist = distributorRepository.findByDistributorId(ipOpt.get().getAssignedDistributorId()).orElse(null);
                }
            }
        }

        // If the distributor found happens to be a SUB_DISTRIBUTOR, resolve to their parent hub owner
        if (primaryDist != null && "SUB_DISTRIBUTOR".equalsIgnoreCase(primaryDist.getDistributorRole()) && primaryDist.getParentHubId() != null) {
            Optional<DistributorUser> parent = distributorRepository.findByDistributorId(primaryDist.getParentHubId());
            if (parent.isPresent()) {
                primaryDist = parent.get();
            }
        }

        Map<String, Object> res = new HashMap<>();
        if (primaryDist != null) {
            boolean isPrimaryOnLeave = primaryDist.isOnLeave() || "ON_LEAVE".equalsIgnoreCase(primaryDist.getStatus());

            DistributorUser substitute = null;
            if (isPrimaryOnLeave) {
                // Find designated substitute / co-manager dynamically
                if (primaryDist.getDelegatedToId() != null && !primaryDist.getDelegatedToId().trim().isEmpty()) {
                    substitute = distributorRepository.findByDistributorId(primaryDist.getDelegatedToId()).orElse(null);
                }
                if (substitute == null) {
                    List<DistributorUser> subList = distributorRepository.findByParentHubId(primaryDist.getDistributorId());
                    if (!subList.isEmpty()) {
                        substitute = subList.stream()
                                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) || !s.isOnLeave())
                                .findFirst()
                                .orElse(subList.get(0));
                    }
                }
            }

            boolean isSubActive = isPrimaryOnLeave && substitute != null;

            res.put("found", true);
            res.put("distributorId", primaryDist.getDistributorId());
            res.put("hubName", primaryDist.getBusinessName() != null ? primaryDist.getBusinessName() : "Atomy Regional Logistics Hub");
            res.put("pincode", primaryDist.getPrimaryPincode() != null ? primaryDist.getPrimaryPincode() : pin);
            res.put("city", primaryDist.getCity() != null ? primaryDist.getCity() : "Regional Hub");
            res.put("state", primaryDist.getState() != null ? primaryDist.getState() : "India");
            res.put("hubAddress", primaryDist.getHubAddress() != null && !primaryDist.getHubAddress().trim().isEmpty()
                    ? primaryDist.getHubAddress()
                    : primaryDist.getBusinessName() + ", Near Main Depot, " + primaryDist.getCity() + " - " + primaryDist.getPrimaryPincode());
            res.put("operatingHours", "Mon – Sat: 9:30 AM – 7:30 PM (Sun: 10:00 AM – 2:00 PM)");
            res.put("pickupInstructions", "Present your Order ID or downloaded Invoice PDF at the hub counter to collect your packed items.");

            res.put("isSubstituteActive", isSubActive);
            res.put("onLeave", isPrimaryOnLeave);
            res.put("leaveReason", primaryDist.getLeaveReason());
            res.put("primaryManagerName", primaryDist.getContactPerson());

            if (isSubActive) {
                res.put("actingManagerName", substitute.getContactPerson());
                res.put("actingDistributorId", substitute.getDistributorId());
                res.put("contactPerson", substitute.getContactPerson() + " (Acting Hub Manager)");
                res.put("phone", substitute.getPhone() != null ? substitute.getPhone() : primaryDist.getPhone());
                res.put("email", substitute.getEmail() != null ? substitute.getEmail() : primaryDist.getEmail());
                res.put("distributorRole", "SUB_DISTRIBUTOR");
            } else {
                res.put("actingManagerName", null);
                res.put("actingDistributorId", null);
                res.put("contactPerson", primaryDist.getContactPerson() != null ? primaryDist.getContactPerson() + " (Hub Manager)" : "Hub Manager");
                res.put("phone", primaryDist.getPhone() != null ? primaryDist.getPhone() : "+91 98401 23456");
                res.put("email", primaryDist.getEmail() != null ? primaryDist.getEmail() : "support.logistics@atomy.com");
                res.put("distributorRole", "PRIMARY_MANAGER");
            }
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
            res.put("isSubstituteActive", false);
            res.put("onLeave", false);
            res.put("message", "Delivery is currently not available for PIN " + pin);
        }
        return ResponseEntity.ok(res);
    }

    private String extractJsonField(String json, String field) {
        if (json == null || json.isEmpty()) return "";
        try {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"" + field + "\"\\s*:\\s*\"([^\"]+)\"");
            java.util.regex.Matcher m = p.matcher(json);
            if (m.find()) {
                return m.group(1).trim();
            }
        } catch (Exception ignored) {}
        return "";
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<?> reverseGeocode(@RequestParam double lat, @RequestParam double lon) {
        Map<String, Object> resp = new HashMap<>();

        // 1. Primary: Server-side OpenStreetMap Nominatim with valid User-Agent
        try {
            String nomUrl = "https://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lon + "&format=json&zoom=16&addressdetails=1";
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(nomUrl))
                    .header("User-Agent", "AtomyIndiaServer/2.0 (contact@atomy.in)")
                    .header("Accept", "application/json")
                    .timeout(java.time.Duration.ofSeconds(6))
                    .build();
            java.net.http.HttpResponse<String> httpRes = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (httpRes.statusCode() == 200) {
                String body = httpRes.body();
                String postcode = extractJsonField(body, "postcode").replaceAll("\\D", "").trim();
                if (postcode.length() == 6) {
                    String suburb = extractJsonField(body, "suburb");
                    if (suburb.isEmpty()) suburb = extractJsonField(body, "neighbourhood");
                    if (suburb.isEmpty()) suburb = extractJsonField(body, "village");
                    if (suburb.isEmpty()) suburb = extractJsonField(body, "town");
                    if (suburb.isEmpty()) suburb = extractJsonField(body, "city");
                    if (suburb.isEmpty()) suburb = extractJsonField(body, "county");
                    if (suburb.isEmpty()) suburb = "Local Area";

                    String district = extractJsonField(body, "state_district");
                    if (district.isEmpty()) district = extractJsonField(body, "county");
                    if (district.isEmpty()) district = suburb;

                    String state = extractJsonField(body, "state");
                    if (state.isEmpty()) state = "India";

                    Optional<IndiaPincode> ipOpt = indiaPincodeRepository.findByPincode(postcode);
                    if (ipOpt.isPresent()) {
                        IndiaPincode ip = ipOpt.get();
                        if (ip.getDistrict() != null && !ip.getDistrict().isEmpty()) district = ip.getDistrict();
                        if (ip.getState() != null && !ip.getState().isEmpty()) state = ip.getState();
                        if (ip.getOfficeName() != null && !ip.getOfficeName().isEmpty()) suburb = ip.getOfficeName();
                    }

                    resp.put("valid", true);
                    resp.put("pincode", postcode);
                    resp.put("city", suburb);
                    resp.put("district", district);
                    resp.put("state", state);
                    resp.put("method", "gps");
                    return ResponseEntity.ok(resp);
                }
            }
        } catch (Exception e) {
            // Log and fallback to secondary
        }

        // 2. Secondary: BigDataCloud reverse geocode client
        try {
            String bdcUrl = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=en";
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(bdcUrl))
                    .timeout(java.time.Duration.ofSeconds(5))
                    .build();
            java.net.http.HttpResponse<String> httpRes = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (httpRes.statusCode() == 200) {
                String body = httpRes.body();
                String postcode = extractJsonField(body, "postcode").replaceAll("\\D", "").trim();
                if (postcode.length() == 6) {
                    String locality = extractJsonField(body, "locality");
                    if (locality.isEmpty()) locality = extractJsonField(body, "city");
                    if (locality.isEmpty()) locality = "Local Area";

                    String state = extractJsonField(body, "principalSubdivision");
                    if (state.isEmpty()) state = "India";

                    String district = extractJsonField(body, "city");
                    if (district.isEmpty()) district = locality;

                    Optional<IndiaPincode> ipOpt = indiaPincodeRepository.findByPincode(postcode);
                    if (ipOpt.isPresent()) {
                        IndiaPincode ip = ipOpt.get();
                        if (ip.getDistrict() != null && !ip.getDistrict().isEmpty()) district = ip.getDistrict();
                        if (ip.getState() != null && !ip.getState().isEmpty()) state = ip.getState();
                        if (ip.getOfficeName() != null && !ip.getOfficeName().isEmpty()) locality = ip.getOfficeName();
                    }

                    resp.put("valid", true);
                    resp.put("pincode", postcode);
                    resp.put("city", locality);
                    resp.put("district", district);
                    resp.put("state", state);
                    resp.put("method", "gps");
                    return ResponseEntity.ok(resp);
                }
            }
        } catch (Exception e) {
            // Log and finish
        }

        resp.put("valid", false);
        resp.put("message", "Could not resolve postal PIN code from coordinates");
        return ResponseEntity.ok(resp);
    }
}

