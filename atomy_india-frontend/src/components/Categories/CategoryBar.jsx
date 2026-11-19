import React from 'react';
import { CATEGORIES } from '../../data/mockData';
import personalCareIcon from '../../assets/category_icons/personal_care.svg';
import beautyIcon from '../../assets/category_icons/beauty.svg';
import foodIcon from '../../assets/category_icons/food.svg';
import homeIcon from '../../assets/category_icons/home.svg';
import healthIcon from '../../assets/category_icons/health.svg';
import hemohimIcon from '../../assets/category_icons/hemohim.svg';
import etcIcon from '../../assets/category_icons/etc.svg';
import allProductsIcon from '../../assets/category_icons/all_products.svg';
import './CategoryBar.css';

const CATEGORY_ICON_MAP = {
  personal_care: personalCareIcon,
  beauty: beautyIcon,
  food: foodIcon,
  home: homeIcon,
  health: healthIcon,
  hemohim: hemohimIcon,
  others: etcIcon,
  etc: etcIcon,
  all_products: allProductsIcon
};

export default function CategoryBar({ onSelectCategory }) {
  return (
    <section className="category-bar-section">
      <div className="container">
        <div className="category-items-grid">
          {CATEGORIES.map((cat) => {
            const iconSrc = CATEGORY_ICON_MAP[cat.id] || cat.icon;

            return (
              <div
                key={cat.id}
                className="category-item-card"
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              >
                <div className="category-icon-wrapper">
                  <img
                    src={iconSrc}
                    alt={cat.name}
                    className="category-svg-icon"
                  />
                </div>
                <span className="category-name-text">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
