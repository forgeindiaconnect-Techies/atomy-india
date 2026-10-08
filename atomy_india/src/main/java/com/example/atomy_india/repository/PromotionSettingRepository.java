package com.example.atomy_india.repository;

import com.example.atomy_india.model.PromotionSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionSettingRepository extends JpaRepository<PromotionSetting, String> {
}
