package com.example.atomy_india.controller.customer;

import com.example.atomy_india.model.Category;
import com.example.atomy_india.model.DistributorInventory;
import com.example.atomy_india.model.DistributorUser;
import com.example.atomy_india.model.IndiaPincode;
import com.example.atomy_india.model.Product;
import com.example.atomy_india.repository.DistributorInventoryRepository;
import com.example.atomy_india.repository.DistributorRepository;
import com.example.atomy_india.repository.IndiaPincodeRepository;
import com.example.atomy_india.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CustomerProductController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private DistributorRepository distributorRepository;

    @Autowired
    private DistributorInventoryRepository distributorInventoryRepository;

    @Autowired
    private IndiaPincodeRepository indiaPincodeRepository;

    private Optional<DistributorUser> resolveDistributorForPincode(String cleanPin) {
        if (cleanPin == null || cleanPin.trim().isEmpty()) return Optional.empty();
        String pin = cleanPin.trim();

        // 1. Direct primary PIN or explicitly assigned PIN match (strictly 1 distributor per PIN code)
        Optional<DistributorUser> distOpt = distributorRepository.findByPrimaryPincodeAndDistributorRole(pin, "PRIMARY_MANAGER")
                .or(() -> distributorRepository.findByPrimaryPincode(pin).stream().findFirst())
                .or(() -> distributorRepository.findByAssignedPincodesContaining(pin));
        if (distOpt.isPresent()) return distOpt;

        // 2. India Pincode master table assignment check
        Optional<IndiaPincode> pinDoc = indiaPincodeRepository.findByPincode(pin);
        if (pinDoc.isPresent() && pinDoc.get().getAssignedDistributorId() != null && !pinDoc.get().getAssignedDistributorId().trim().isEmpty()) {
            distOpt = distributorRepository.findByDistributorId(pinDoc.get().getAssignedDistributorId());
            if (distOpt.isPresent()) return distOpt;
        }

        return Optional.empty();
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String pincode) {

        List<Product> products;
        if (search != null && !search.trim().isEmpty()) {
            products = customerService.searchProducts(search.trim());
        } else if (categoryId != null && !categoryId.trim().isEmpty() && !categoryId.equalsIgnoreCase("all_products")) {
            products = customerService.getProductsByCategory(categoryId.trim());
        } else {
            products = customerService.getAllActiveProducts();
        }

        // Apply Zepto-style regional stock & availability by customer's location PIN code
        if (pincode != null && !pincode.trim().isEmpty()) {
            String cleanPin = pincode.trim();
            Optional<DistributorUser> distOpt = resolveDistributorForPincode(cleanPin);

            if (distOpt.isPresent()) {
                DistributorUser dist = distOpt.get();
                List<DistributorInventory> regionalInv = distributorInventoryRepository.findByDistributorId(dist.getDistributorId());
                Map<String, DistributorInventory> invMap = regionalInv.stream()
                        .collect(Collectors.toMap(DistributorInventory::getProductId, inv -> inv, (a, b) -> a));

                for (Product p : products) {
                    DistributorInventory di = invMap.get(p.getId());
                    if (di != null && di.isAvailable() && di.getStockQuantity() >= 2) {
                        p.setStockQuantity(di.getStockQuantity());
                        p.setInStock(true);
                    } else {
                        int remaining = (di != null) ? di.getStockQuantity() : 0;
                        p.setStockQuantity(remaining);
                        p.setInStock(false);
                    }
                    p.setRegionalHubId(dist.getDistributorId());
                    p.setRegionalHubName(dist.getBusinessName());
                    p.setRegionalPincode(cleanPin);
                }
            } else {
                for (Product p : products) {
                    p.setRegionalHubId("CENTRAL_HUB");
                    p.setRegionalHubName("Central National Fulfillment Center");
                    p.setRegionalPincode(cleanPin);
                    p.setStockQuantity(50);
                    p.setInStock(true);
                }
            }
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable String id,
            @RequestParam(required = false) String pincode) {
        Optional<Product> prodOpt = customerService.getProductById(id);
        if (prodOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Product p = prodOpt.get();

        if (pincode != null && !pincode.trim().isEmpty()) {
            String cleanPin = pincode.trim();
            Optional<DistributorUser> distOpt = resolveDistributorForPincode(cleanPin);

            if (distOpt.isPresent()) {
                DistributorUser dist = distOpt.get();
                DistributorInventory di = distributorInventoryRepository
                        .findByDistributorIdAndProductId(dist.getDistributorId(), id)
                        .orElse(null);

                if (di != null && di.isAvailable() && di.getStockQuantity() >= 2) {
                    p.setStockQuantity(di.getStockQuantity());
                    p.setInStock(true);
                } else {
                    int remaining = (di != null) ? di.getStockQuantity() : 0;
                    p.setStockQuantity(remaining);
                    p.setInStock(false);
                }
                p.setRegionalHubId(dist.getDistributorId());
                p.setRegionalHubName(dist.getBusinessName());
                p.setRegionalPincode(cleanPin);
            } else {
                p.setRegionalHubId("CENTRAL_HUB");
                p.setRegionalHubName("Central National Fulfillment Center");
                p.setRegionalPincode(cleanPin);
                p.setStockQuantity(50);
                p.setInStock(true);
            }
        }

        return ResponseEntity.ok(p);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(customerService.getAllCategories());
    }
}
