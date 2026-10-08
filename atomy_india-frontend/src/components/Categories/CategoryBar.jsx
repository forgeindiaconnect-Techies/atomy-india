import React from 'react';
import { CATEGORIES } from '../../data/mockData';
import './CategoryBar.css';

export default function CategoryBar({ onSelectCategory }) {
  return (
    <section className="category-bar-section">
      <div className="container">
        <div className="category-items-grid">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="category-item-card"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            >
              <div className="category-icon-wrapper">
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="category-svg-icon"
                />
              </div>
              <span className="category-name-text">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
