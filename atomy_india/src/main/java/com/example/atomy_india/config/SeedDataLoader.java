package com.example.atomy_india.config;

import com.example.atomy_india.model.Category;
import com.example.atomy_india.model.Inventory;
import com.example.atomy_india.model.Product;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SeedDataLoader {

    public static class SeedPayload {
        public List<Category> categories = new ArrayList<>();
        public List<Product> products = new ArrayList<>();
        public List<Inventory> inventory = new ArrayList<>();
    }

    public static SeedPayload load() {
        SeedPayload payload = new SeedPayload();
        try (InputStream is = SeedDataLoader.class.getResourceAsStream("/seed_data.json")) {
            if (is == null) {
                return payload;
            }
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
            }
            String text = sb.toString();

            int catIdx = text.indexOf("\"categories\"");
            int prodIdx = text.indexOf("\"products\"");
            int invIdx = text.indexOf("\"inventory\"");

            if (catIdx >= 0 && prodIdx > catIdx) {
                String catSection = text.substring(catIdx, prodIdx);
                for (Map<String, String> map : parseBlocks(catSection)) {
                    Category c = new Category(
                            map.get("id"),
                            map.get("name"),
                            map.get("dispCtgNo"),
                            map.get("subcategories")
                    );
                    payload.categories.add(c);
                }
            }

            if (prodIdx >= 0 && invIdx > prodIdx) {
                String prodSection = text.substring(prodIdx, invIdx);
                for (Map<String, String> map : parseBlocks(prodSection)) {
                    Product p = new Product();
                    p.setId(map.get("id"));
                    p.setName(map.get("name"));
                    if (map.containsKey("price")) p.setPrice(new BigDecimal(map.get("price")));
                    if (map.containsKey("originalPrice")) p.setOriginalPrice(new BigDecimal(map.get("originalPrice")));
                    p.setCategoryId(map.get("categoryId"));
                    p.setSubcategory(map.getOrDefault("subcategory", ""));
                    p.setImage(map.get("image"));
                    p.setGstReduced("true".equalsIgnoreCase(map.get("gstReduced")));
                    p.setIsVeg("true".equalsIgnoreCase(map.get("isVeg")));
                    p.setIsNonVeg("true".equalsIgnoreCase(map.get("isNonVeg")));
                    p.setLikesCount(map.containsKey("likesCount") ? Integer.parseInt(map.get("likesCount")) : 0);
                    p.setTags(map.getOrDefault("tags", ""));
                    p.setFreeDelivery("true".equalsIgnoreCase(map.get("freeDelivery")));
                    p.setActive(!"false".equalsIgnoreCase(map.get("active")));
                    if (map.containsKey("pv")) p.setPv(Long.parseLong(map.get("pv")));
                    if (map.containsKey("dpPrice")) p.setDpPrice(new BigDecimal(map.get("dpPrice")));
                    payload.products.add(p);
                }
            }

            if (invIdx >= 0) {
                String invSection = text.substring(invIdx);
                for (Map<String, String> map : parseBlocks(invSection)) {
                    int stock = map.containsKey("stockQuantity") ? Integer.parseInt(map.get("stockQuantity")) : 100;
                    int threshold = map.containsKey("lowStockThreshold") ? Integer.parseInt(map.get("lowStockThreshold")) : 10;
                    Inventory inv = new Inventory(
                            map.get("productId"),
                            map.get("productName"),
                            map.get("sku"),
                            stock,
                            threshold
                    );
                    if (map.containsKey("status")) {
                        try {
                            inv.setStatus(Inventory.StockStatus.valueOf(map.get("status")));
                        } catch (Exception ignored) {}
                    }
                    payload.inventory.add(inv);
                }
            }

        } catch (Exception e) {
            System.err.println("Notice: Could not parse seed_data.json: " + e.getMessage());
        }
        return payload;
    }

    private static List<Map<String, String>> parseBlocks(String section) {
        List<Map<String, String>> list = new ArrayList<>();
        Pattern pattern = Pattern.compile("\\{([^}]+)\\}");
        Matcher matcher = pattern.matcher(section);
        while (matcher.find()) {
            String block = matcher.group(1);
            Map<String, String> map = new HashMap<>();
            String[] lines = block.split("\n");
            for (String raw : lines) {
                String line = raw.trim();
                if (line.endsWith(",")) {
                    line = line.substring(0, line.length() - 1).trim();
                }
                int colon = line.indexOf(':');
                if (colon > 0) {
                    String k = line.substring(0, colon).trim().replaceAll("^\"|\"$", "");
                    String v = line.substring(colon + 1).trim();
                    if (v.startsWith("\"") && v.endsWith("\"") && v.length() >= 2) {
                        v = v.substring(1, v.length() - 1);
                    }
                    map.put(k, v);
                }
            }
            if (!map.isEmpty()) {
                list.add(map);
            }
        }
        return list;
    }
}
