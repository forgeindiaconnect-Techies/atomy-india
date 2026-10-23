package com.example.atomy_india.config;

import com.example.atomy_india.model.*;
import com.example.atomy_india.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

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
    private final MongoTemplate mongoTemplate;

    public DataInitializer(CustomerUserRepository customerUserRepository,
                           MembershipRepository membershipRepository,
                           AdminProfileRepository adminProfileRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository,
                           PromotionSettingRepository promotionSettingRepository,
                           MongoTemplate mongoTemplate) {
        this.customerUserRepository = customerUserRepository;
        this.membershipRepository = membershipRepository;
        this.adminProfileRepository = adminProfileRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.promotionSettingRepository = promotionSettingRepository;
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
                "admin_profiles"
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
    }
}
