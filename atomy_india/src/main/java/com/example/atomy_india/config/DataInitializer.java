package com.example.atomy_india.config;

import com.example.atomy_india.model.*;
import com.example.atomy_india.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CustomerUserRepository customerUserRepository;
    private final MembershipRepository membershipRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PromotionSettingRepository promotionSettingRepository;
    private final IndiaPincodeRepository indiaPincodeRepository;
    private final DistributorRepository distributorRepository;
    private final DistributorInventoryRepository distributorInventoryRepository;
    private final MongoTemplate mongoTemplate;

    public DataInitializer(CustomerUserRepository customerUserRepository,
                           MembershipRepository membershipRepository,
                           AdminProfileRepository adminProfileRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository,
                           PromotionSettingRepository promotionSettingRepository,
                           IndiaPincodeRepository indiaPincodeRepository,
                           DistributorRepository distributorRepository,
                           DistributorInventoryRepository distributorInventoryRepository,
                           MongoTemplate mongoTemplate) {
        this.customerUserRepository = customerUserRepository;
        this.membershipRepository = membershipRepository;
        this.adminProfileRepository = adminProfileRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.promotionSettingRepository = promotionSettingRepository;
        this.indiaPincodeRepository = indiaPincodeRepository;
        this.distributorRepository = distributorRepository;
        this.distributorInventoryRepository = distributorInventoryRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        // 1. Ensure all collections from the schema are created upfront in MongoDB Compass
        String[] requiredCollections = {
                "categories",
                "customer_orders",
                "customers",
                "inventory",
                "memberships",
                "order_items",
                "order_tracking",
                "products",
                "promotion_settings",
                "support_tickets",
                "ticket_messages",
                "customer_notifications",
                "admin_profiles",
                "india_pincodes",
                "distributors"
        };
        for (String col : requiredCollections) {
            try {
                if (!mongoTemplate.collectionExists(col)) {
                    mongoTemplate.createCollection(col);
                }
            } catch (Exception ex) {
                System.err.println("Notice: collection check for " + col + ": " + ex.getMessage());
            }
        }

        // 2. Ensure default AdminProfile is seeded in database
        if (adminProfileRepository.count() == 0) {
            AdminProfile defaultProfile = new AdminProfile(
                    "Naveen Sourabh Pal",
                    "naveen.admin@atomy.com",
                    "+91 98765 43210",
                    "AT-IN-001",
                    "E-Commerce Operations & Supply Chain",
                    "Super Administrator",
                    "Gurugram HQ, India",
                    true,
                    "192.168.1.104 (Secure VPN)"
            );
            defaultProfile.setLastLogin("Today, 09:30 AM (IST)");
            defaultProfile.setUpdatedAt(LocalDateTime.now());
            adminProfileRepository.save(defaultProfile);
        }

        // 3. Ensure customer naveen.mj2.45@gmail.com is present with password Naveen@123
        CustomerUser naveen = customerUserRepository.findByCustomerId("CUST-20261009-1001")
                .or(() -> customerUserRepository.findByEmail("naveen.mj2.45@gmail.com"))
                .or(() -> customerUserRepository.findByEmail("naveen@gmail.com"))
                .orElseGet(() -> {
                    CustomerUser u = new CustomerUser();
                    u.setCustomerId("CUST-20261009-1001");
                    u.setCreatedAt(LocalDateTime.now());
                    u.setRole("CUSTOMER");
                    u.setIsMember(false);
                    u.setRegistrationSource("EMAIL_SIGNUP");
                    return u;
                });

        naveen.setEmail("naveen.mj2.45@gmail.com");
        naveen.setPassword("Naveen@123");
        naveen.setFullName("Naveen");
        naveen.setUsername("naveen");
        if (naveen.getPhone() == null || naveen.getPhone().isEmpty()) {
            naveen.setPhone("+91 9876543210");
        }
        customerUserRepository.save(naveen);

        // 4. Ensure default membership promotion setting is seeded
        if (promotionSettingRepository.count() == 0) {
            String defaultMembership = "{"
                    + "\"className\":\"Atomy Distributor Membership\","
                    + "\"code\":\"DISTRIBUTOR_MEMBER\","
                    + "\"monthlyFee\":299,"
                    + "\"annualFee\":2499,"
                    + "\"annualDiscountLabel\":\"Save 30%\","
                    + "\"wholesaleDiscountPercent\":18,"
                    + "\"pvMultiplier\":1.0,"
                    + "\"active\":true,"
                    + "\"description\":\"Unlocks wholesale Distributor Price (DP) and earns Personal PV on every purchase.\""
                    + "}";
            promotionSettingRepository.save(new PromotionSetting("membership_settings", defaultMembership));
        }

        // 5. Seed Categories, Products, and Inventory using zero-dependency SeedDataLoader if empty
        if (productRepository.count() == 0) {
            try {
                SeedDataLoader.SeedPayload payload = SeedDataLoader.load();

                // Seed Categories
                if (categoryRepository.count() == 0 && !payload.categories.isEmpty()) {
                    categoryRepository.saveAll(payload.categories);
                    System.out.println("Seeded " + payload.categories.size() + " categories into MongoDB.");
                }

                // Seed Products
                if (!payload.products.isEmpty()) {
                    productRepository.saveAll(payload.products);
                    System.out.println("Seeded " + payload.products.size() + " products into MongoDB.");
                }

                // Seed Inventory
                if (inventoryRepository.count() == 0 && !payload.inventory.isEmpty()) {
                    inventoryRepository.saveAll(payload.inventory);
                    System.out.println("Seeded " + payload.inventory.size() + " inventory items into MongoDB.");
                }
            } catch (Exception e) {
                System.err.println("Notice: Could not load initial catalog seeds: " + e.getMessage());
            }
        }

        // 6. Sync any customer who has an ACTIVE membership in the database (e.g. Rithan)
        customerUserRepository.findAll().forEach(cust -> {
            if (cust.getEmail() != null) {
                boolean activeMem = membershipRepository
                        .findFirstByCustomerEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(cust.getEmail().trim().toLowerCase(), "ACTIVE")
                        .isPresent();
                if (activeMem && (cust.getIsMember() == null || !cust.getIsMember())) {
                    cust.setIsMember(true);
                    customerUserRepository.save(cust);
                }
            }
        });

        // 7. Sync order_items collection with customer_orders
        try {
            long itemCount = mongoTemplate.getCollection("order_items").countDocuments();
            if (itemCount == 0) {
                for (org.bson.Document orderDoc : mongoTemplate.getCollection("customer_orders").find()) {
                    String orderId = orderDoc.getString("_id");
                    @SuppressWarnings("unchecked")
                    java.util.List<org.bson.Document> items = (java.util.List<org.bson.Document>) orderDoc.get("items");
                    boolean orderModified = false;
                    if (items != null) {
                        for (org.bson.Document it : items) {
                            String itemId = it.getString("_id");
                            if (itemId == null || itemId.isEmpty()) {
                                itemId = it.getString("id");
                            }
                            if (itemId == null || itemId.isEmpty()) {
                                itemId = "ITEM-" + java.util.UUID.randomUUID().toString().substring(0, 8);
                                it.put("_id", itemId);
                                it.put("id", itemId);
                                orderModified = true;
                            }

                            String pId = it.getString("product_id");
                            if (pId == null) pId = it.getString("productId");
                            if (pId == null) pId = "D92676";
                            it.put("product_id", pId);
                            it.put("productId", pId);

                            String pName = it.getString("product_name");
                            if (pName == null) pName = it.getString("productName");
                            if (pName == null) pName = "Atomy Premium Cotton T-Shirt";
                            it.put("product_name", pName);
                            it.put("productName", pName);

                            String pImg = it.getString("product_image");
                            if (pImg == null) pImg = it.getString("productImage");
                            if (pImg == null) pImg = "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
                            it.put("product_image", pImg);
                            it.put("productImage", pImg);

                            it.put("order_id", orderId);
                            it.put("orderId", orderId);

                            org.bson.Document orderItemDoc = new org.bson.Document();
                            orderItemDoc.put("_id", itemId);
                            orderItemDoc.put("id", itemId);
                            orderItemDoc.put("order_id", orderId);
                            orderItemDoc.put("orderId", orderId);
                            orderItemDoc.put("product_id", pId);
                            orderItemDoc.put("productId", pId);
                            orderItemDoc.put("product_name", pName);
                            orderItemDoc.put("productName", pName);
                            orderItemDoc.put("product_image", pImg);
                            orderItemDoc.put("productImage", pImg);
                            orderItemDoc.put("price", it.get("price"));
                            orderItemDoc.put("quantity", it.get("quantity"));
                            orderItemDoc.put("subtotal", it.get("subtotal"));

                            mongoTemplate.getCollection("order_items").replaceOne(
                                    new org.bson.Document("_id", itemId),
                                    orderItemDoc,
                                    new com.mongodb.client.model.ReplaceOptions().upsert(true)
                            );
                        }
                        if (orderModified) {
                            mongoTemplate.getCollection("customer_orders").replaceOne(
                                    new org.bson.Document("_id", orderId),
                                    orderDoc
                            );
                        }
                    }
                }
                System.out.println("Synchronized order_items collection with customer_orders.");
            }
        } catch (Exception ex) {
            System.err.println("Notice: sync order_items: " + ex.getMessage());
        }

        // 7. Seed India Pincodes and Initial Regional Distributors
        seedIndiaPincodesAndDistributors();
    }

    private void seedIndiaPincodesAndDistributors() {
        try {
            // Clean up specific legacy demo/mock distributors only (DIST-DEL-110001, DIST-BLR-560001, DIST-KG-635001)
            Set<String> demoDistributorIds = new HashSet<>(Arrays.asList("DIST-DEL-110001", "DIST-BLR-560001", "DIST-KG-635001"));
            distributorRepository.findAll().forEach(d -> {
                if (d.getDistributorId() != null && demoDistributorIds.contains(d.getDistributorId())) {
                    distributorRepository.delete(d);
                    System.out.println("Removed demo distributor from MongoDB: " + d.getDistributorId());
                }
            });

            // Ensure Selva's hub (DIST-635002) is registered as the active regional distributor for Krishnagiri
            List<String> selvaTerritoryPins = Arrays.asList(
                    "635001", "635002", "635101", "635104", "635109",
                    "635115", "635201", "635202", "635203", "635204", "635206", "635207"
            );
            if (distributorRepository.findByDistributorId("DIST-635002").isEmpty()) {
                DistributorUser selva = new DistributorUser(
                        "DIST-635002",
                        "Selva Atomy Regional Hub",
                        "Selva",
                        "selva.hub@atomy.in",
                        "+91 94432 10000",
                        "635002",
                        "Krishnagiri",
                        "Tamil Nadu"
                );
                selva.setPrimaryPincode("635002");
                selva.setAssignedPincodes(new ArrayList<>(selvaTerritoryPins));
                selva.setHubAddress("Gandhi Road, Regional Logistics Hub, Krishnagiri");
                selva.setCommissionRate(8.0);
                selva.setTerritoryFee(new BigDecimal("35000"));
                selva.setPasswordHash("Admin@123");
                selva.setStatus("ACTIVE");
                distributorRepository.save(selva);
                System.out.println("Ensured active regional distributor: Selva (DIST-635002) with " + selvaTerritoryPins.size() + " territory PINs");
            } else {
                distributorRepository.findAll().forEach(d -> {
                    if ("DIST-635002".equalsIgnoreCase(d.getDistributorId())) {
                        d.setPrimaryPincode("635002");
                        d.setAssignedPincodes(new ArrayList<>(selvaTerritoryPins));
                        distributorRepository.save(d);
                    }
                });
            }

            // Ensure india_pincodes resets any legacy demo hub links to VACANT
            indiaPincodeRepository.findAll().forEach(pin -> {
                String assignedId = pin.getAssignedDistributorId();
                if (assignedId != null && demoDistributorIds.contains(assignedId)) {
                    pin.setAssignedDistributorId(null);
                    pin.setAssignedDistributorName(null);
                    pin.setAssignedDistributorEmail(null);
                    pin.setAssignedDistributorPhone(null);
                    pin.setStatus("VACANT");
                    indiaPincodeRepository.save(pin);
                }
            });

            // Ensure Krishnagiri territory PINs (including 635202) are registered and assigned to DIST-635002
            for (String p : selvaTerritoryPins) {
                IndiaPincode pinObj = indiaPincodeRepository.findByPincode(p)
                        .orElseGet(() -> new IndiaPincode(p, "Krishnagiri Territory SO", "Krishnagiri", "Tamil Nadu", "Krishnagiri Division", "Tamil Nadu Circle"));
                pinObj.setStatus("ASSIGNED");
                pinObj.setAssignedDistributorId("DIST-635002");
                pinObj.setAssignedDistributorName("Selva Atomy Regional Hub");
                pinObj.setAssignedDistributorEmail("selva.hub@atomy.in");
                pinObj.setAssignedDistributorPhone("+91 94432 10000");
                pinObj.setTerritoryFee(new BigDecimal("35000"));
                pinObj.setCommissionRate(8.0);
                indiaPincodeRepository.save(pinObj);
            }

            // Re-route Krishnagiri territory orders (including 635202 order ORD-20261103-2640) to Selva (DIST-635002)
            Query krishnagiriOrders = new Query(Criteria.where("pincode").regex("^635"));
            Update updateDist = new Update()
                    .set("assignedDistributorId", "DIST-635002")
                    .set("assigned_distributor_id", "DIST-635002")
                    .set("assignedDistributorName", "Selva Atomy Regional Hub")
                    .set("assigned_distributor_name", "Selva Atomy Regional Hub")
                    .set("distributorDispatchStatus", "RECEIVED")
                    .set("distributor_dispatch_status", "RECEIVED");
            mongoTemplate.updateMulti(krishnagiriOrders, updateDist, "customer_orders");

            // Deduplicate order_tracking documents to avoid Spring Data non-unique result exceptions
            try {
                List<org.bson.Document> allTrackings = mongoTemplate.findAll(org.bson.Document.class, "order_tracking");
                Set<String> seenOrderIds = new HashSet<>();
                for (org.bson.Document doc : allTrackings) {
                    String ordId = doc.getString("order_id");
                    if (ordId == null) ordId = doc.getString("orderId");
                    if (ordId != null) {
                        if (seenOrderIds.contains(ordId)) {
                            mongoTemplate.remove(doc, "order_tracking");
                        } else {
                            seenOrderIds.add(ordId);
                        }
                    }
                }
            } catch (Exception ignored) {}

            // 2. Seed Indian PIN codes if catalog is empty
            if (indiaPincodeRepository.count() == 0) {
                List<IndiaPincode> pincodes = new ArrayList<>();

                // Delhi primary PIN codes
                pincodes.add(createUnassignedPincode("110001", "Connaught Place SO", "New Delhi", "Delhi", "New Delhi Central", "Delhi Circle", new BigDecimal("25000"), 7.5));
                pincodes.add(createUnassignedPincode("110002", "Darya Ganj SO", "Central Delhi", "Delhi", "Central Division", "Delhi Circle", new BigDecimal("20000"), 7.5));
                pincodes.add(createUnassignedPincode("110003", "Aliganj SO", "South Delhi", "Delhi", "South Division", "Delhi Circle", new BigDecimal("20000"), 7.5));
                pincodes.add(createUnassignedPincode("110006", "Chandni Chowk SO", "North Delhi", "Delhi", "North Division", "Delhi Circle", new BigDecimal("22000"), 7.5));

                // Bengaluru primary PIN codes
                pincodes.add(createUnassignedPincode("560001", "Bengaluru GPO", "Bengaluru Urban", "Karnataka", "Bangalore East", "Karnataka Circle", new BigDecimal("30000"), 8.0));
                pincodes.add(createUnassignedPincode("560002", "City Market SO", "Bengaluru Urban", "Karnataka", "Bangalore West", "Karnataka Circle", new BigDecimal("25000"), 8.0));
                pincodes.add(createUnassignedPincode("560004", "Basavanagudi SO", "Bengaluru Urban", "Karnataka", "Bangalore South", "Karnataka Circle", new BigDecimal("25000"), 8.0));
                pincodes.add(createUnassignedPincode("560025", "Richmond Town SO", "Bengaluru Urban", "Karnataka", "Bangalore East", "Karnataka Circle", new BigDecimal("25000"), 8.0));
                pincodes.add(createUnassignedPincode("560034", "Koramangala SO", "Bengaluru Urban", "Karnataka", "Bangalore South", "Karnataka Circle", new BigDecimal("30000"), 8.0));

                // Vacant / Super Platform Hub PINs
                pincodes.add(createUnassignedPincode("400001", "Mumbai GPO", "Mumbai", "Maharashtra", "Mumbai Division", "Maharashtra Circle", new BigDecimal("35000"), 8.5));
                pincodes.add(createUnassignedPincode("400050", "Bandra West SO", "Mumbai Suburban", "Maharashtra", "Mumbai West", "Maharashtra Circle", new BigDecimal("30000"), 8.0));
                pincodes.add(createUnassignedPincode("411001", "Pune GPO", "Pune", "Maharashtra", "Pune Division", "Maharashtra Circle", new BigDecimal("25000"), 7.5));
                pincodes.add(createUnassignedPincode("600001", "Chennai GPO", "Chennai", "Tamil Nadu", "Chennai Central", "Tamil Nadu Circle", new BigDecimal("28000"), 7.5));
                pincodes.add(createUnassignedPincode("600018", "Alwarpet SO", "Chennai", "Tamil Nadu", "Chennai South", "Tamil Nadu Circle", new BigDecimal("25000"), 7.5));
                pincodes.add(createUnassignedPincode("700001", "Kolkata GPO", "Kolkata", "West Bengal", "Kolkata Division", "West Bengal Circle", new BigDecimal("25000"), 7.0));
                pincodes.add(createUnassignedPincode("700020", "Bhowanipore SO", "Kolkata", "West Bengal", "Kolkata South", "West Bengal Circle", new BigDecimal("22000"), 7.0));
                pincodes.add(createUnassignedPincode("500001", "Hyderabad GPO", "Hyderabad", "Telangana", "Hyderabad Division", "Telangana Circle", new BigDecimal("28000"), 8.0));
                pincodes.add(createUnassignedPincode("500034", "Banjara Hills SO", "Hyderabad", "Telangana", "Hyderabad South", "Telangana Circle", new BigDecimal("28000"), 8.0));
                pincodes.add(createUnassignedPincode("380001", "Ahmedabad GPO", "Ahmedabad", "Gujarat", "Ahmedabad Division", "Gujarat Circle", new BigDecimal("25000"), 7.5));
                pincodes.add(createUnassignedPincode("380015", "Vastrapur SO", "Ahmedabad", "Gujarat", "Ahmedabad West", "Gujarat Circle", new BigDecimal("25000"), 7.5));
                pincodes.add(createUnassignedPincode("302001", "Jaipur GPO", "Jaipur", "Rajasthan", "Jaipur Division", "Rajasthan Circle", new BigDecimal("20000"), 7.0));
                pincodes.add(createUnassignedPincode("226001", "Lucknow GPO", "Lucknow", "Uttar Pradesh", "Lucknow Division", "Uttar Pradesh Circle", new BigDecimal("20000"), 7.0));
                pincodes.add(createUnassignedPincode("122001", "Gurugram HO", "Gurugram", "Haryana", "Gurgaon Division", "Haryana Circle", new BigDecimal("25000"), 7.5));
                pincodes.add(createUnassignedPincode("201301", "Noida Sector 16 HO", "Gautam Buddha Nagar", "Uttar Pradesh", "Noida Division", "Uttar Pradesh Circle", new BigDecimal("25000"), 7.5));
                pincodes.add(createUnassignedPincode("682001", "Kochi GPO", "Ernakulam", "Kerala", "Ernakulam Division", "Kerala Circle", new BigDecimal("22000"), 7.0));
                pincodes.add(createUnassignedPincode("160017", "Chandigarh Sector 17 HO", "Chandigarh", "Chandigarh", "Chandigarh Division", "Punjab Circle", new BigDecimal("25000"), 7.5));
                pincodes.add(createUnassignedPincode("800001", "Patna GPO", "Patna", "Bihar", "Patna Division", "Bihar Circle", new BigDecimal("18000"), 6.5));
                pincodes.add(createUnassignedPincode("781001", "Guwahati GPO", "Kamrup", "Assam", "Guwahati Division", "Assam Circle", new BigDecimal("18000"), 6.5));

                indiaPincodeRepository.saveAll(pincodes);
                System.out.println("Seeded India Post PIN codes catalog.");
            }

            // 3. Purge orphaned demo records from distributor_inventory collection in MongoDB
            // Only remove records from demo hubs (DIST-DEL-110001, DIST-BLR-560001, etc.) or distributors that no longer exist
            Set<String> demoHubIds = new HashSet<>(Arrays.asList("DIST-DEL-110001", "DIST-BLR-560001", "DIST-KG-635001"));
            Query demoQuery = new Query(Criteria.where("distributorId").in(demoHubIds));
            mongoTemplate.remove(demoQuery, DistributorInventory.class);
            Query demoFieldQuery = new Query(Criteria.where("distributor_id").in(demoHubIds));
            mongoTemplate.remove(demoFieldQuery, "distributor_inventory");

            List<String> validDistributorIds = distributorRepository.findAll().stream()
                    .map(DistributorUser::getDistributorId)
                    .toList();
            if (!validDistributorIds.isEmpty()) {
                Query orphanQuery = new Query(Criteria.where("distributorId").nin(validDistributorIds));
                mongoTemplate.remove(orphanQuery, DistributorInventory.class);
                Query orphanFieldQuery = new Query(Criteria.where("distributor_id").nin(validDistributorIds));
                mongoTemplate.remove(orphanFieldQuery, "distributor_inventory");
            }

            // For Selva (DIST-635002), keep strictly the 82 live stocked products and remove duplicates or merchandise
            List<DistributorInventory> selvaExisting = distributorInventoryRepository.findByDistributorId("DIST-635002");
            Set<String> seenProductIds = new HashSet<>();
            for (DistributorInventory inv : selvaExisting) {
                boolean isMerchandise = inv.getProductName() != null &&
                        (inv.getProductName().toLowerCase().contains("t-shirt") ||
                         inv.getProductName().toLowerCase().contains("pamphlet") ||
                         inv.getProductName().toLowerCase().contains("scenario"));

                if (isMerchandise || seenProductIds.contains(inv.getProductId())) {
                    distributorInventoryRepository.delete(inv);
                } else {
                    seenProductIds.add(inv.getProductId());
                    inv.setStockQuantity(50);
                    inv.setAvailable(true);
                    distributorInventoryRepository.save(inv);
                }
            }

            // Ensure all 82 catalog products are present in Selva's live stock
            List<Product> allProducts = productRepository.findAll();
            for (Product p : allProducts) {
                boolean isMerchandise = p.getName() != null &&
                        (p.getName().toLowerCase().contains("t-shirt") ||
                         p.getName().toLowerCase().contains("pamphlet") ||
                         p.getName().toLowerCase().contains("scenario"));

                if (!isMerchandise && !seenProductIds.contains(p.getId())) {
                    DistributorInventory item = new DistributorInventory(
                            "DIST-635002",
                            "635002",
                            p.getId(),
                            p.getName(),
                            p.getId(),
                            50,
                            10
                    );
                    item.setAvailable(true);
                    distributorInventoryRepository.save(item);
                    seenProductIds.add(p.getId());
                }
            }
            System.out.println(">>> Cleaned distributor_inventory: Selva (DIST-635002) now has exactly " + seenProductIds.size() + " live stocked products in MongoDB.");

            // 6. Reconcile Absolute Skincare Set price to 17228.00 in products catalog
            for (Product p : productRepository.findAll()) {
                if (p.getName() != null && p.getName().toLowerCase().contains("absolute skincare set")) {
                    p.setPrice(new BigDecimal("17228.00"));
                    productRepository.save(p);
                }
            }

            // Ensure HemoHIM multi-sets D00102 and D00104 have non-zero authentic pricing
            productRepository.findById("D00102").ifPresent(p -> {
                if (p.getPrice() == null || p.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                    p.setPrice(new BigDecimal("24700.00"));
                    p.setOriginalPrice(new BigDecimal("26000.00"));
                    p.setDiscountPercent(5);
                    p.setDpPrice(new BigDecimal("18375.00"));
                    p.setPv(160000L);
                    productRepository.save(p);
                }
            });
            productRepository.findById("D00104").ifPresent(p -> {
                if (p.getPrice() == null || p.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                    p.setPrice(new BigDecimal("48360.00"));
                    p.setOriginalPrice(new BigDecimal("52000.00"));
                    p.setDiscountPercent(7);
                    p.setDpPrice(new BigDecimal("35700.00"));
                    p.setPv(320000L);
                    productRepository.save(p);
                }
            });

            // 7. Reconcile single-item orders in customer_orders where item price did not match total amount
            List<CustomerOrder> allDbOrders = mongoTemplate.findAll(CustomerOrder.class);
            for (CustomerOrder o : allDbOrders) {
                if (o.getItems() != null && o.getItems().size() == 1 && o.getTotalAmount() != null) {
                    OrderItem it = o.getItems().get(0);
                    BigDecimal ship = o.getShippingFee() != null ? o.getShippingFee() : BigDecimal.ZERO;
                    BigDecimal expectedItemTotal = o.getTotalAmount().subtract(ship);
                    if (expectedItemTotal.compareTo(BigDecimal.ZERO) > 0 &&
                        (it.getPrice() == null || it.getPrice().compareTo(expectedItemTotal) != 0)) {
                        int qty = Math.max(1, it.getQuantity());
                        BigDecimal unitPrice = expectedItemTotal.divide(BigDecimal.valueOf(qty), 2, java.math.RoundingMode.HALF_UP);
                        it.setPrice(unitPrice);
                        it.setSubtotal(expectedItemTotal);
                        mongoTemplate.save(o);
                    }
                }
            }
        } catch (Exception ex) {
            System.err.println("Notice: error seeding pincodes/distributors: " + (ex.getMessage() != null ? ex.getMessage() : ex.toString()));
        }
    }

    private IndiaPincode createUnassignedPincode(String pin, String office, String district, String state, String division, String circle,
                                                 java.math.BigDecimal fee, Double comm) {
        IndiaPincode p = new IndiaPincode(pin, office, district, state, division, circle);
        p.setStatus("UNASSIGNED");
        p.setTerritoryFee(fee);
        p.setCommissionRate(comm);
        return p;
    }
}
