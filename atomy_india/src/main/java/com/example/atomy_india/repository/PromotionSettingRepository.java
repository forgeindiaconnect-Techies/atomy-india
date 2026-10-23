package com.example.atomy_india.repository;

import com.example.atomy_india.model.PromotionSetting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionSettingRepository extends MongoRepository<PromotionSetting, String> {
}
