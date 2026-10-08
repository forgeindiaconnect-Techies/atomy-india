package com.example.atomy_india.controller;

import com.example.atomy_india.model.PromotionSetting;
import com.example.atomy_india.repository.PromotionSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    @Autowired
    private PromotionSettingRepository promotionSettingRepository;

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllPromotions() {
        List<PromotionSetting> settings = promotionSettingRepository.findAll();
        Map<String, String> response = new HashMap<>();
        for (PromotionSetting s : settings) {
            response.put(s.getId(), s.getJsonContent());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> getPromotionById(@PathVariable String id) {
        return promotionSettingRepository.findById(id)
                .map(s -> ResponseEntity.ok(s.getJsonContent()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}")
    public ResponseEntity<PromotionSetting> savePromotion(
            @PathVariable String id,
            @RequestBody String rawJson) {
        PromotionSetting setting = promotionSettingRepository.findById(id)
                .orElse(new PromotionSetting(id, rawJson));

        setting.setJsonContent(rawJson);
        setting.setUpdatedAt(LocalDateTime.now());
        PromotionSetting saved = promotionSettingRepository.save(setting);
        return ResponseEntity.ok(saved);
    }
}
