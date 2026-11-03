import React from 'react';
import { ChevronRight } from 'lucide-react';
import './GuidePage.css';

export default function GuidePage({ onNavigateHome }) {
  return (
    <div className="guide-page">
      {/* Breadcrumbs */}
      <div className="guide-breadcrumb-bar">
        <div className="guide-container">
          <button type="button" className="bread-link" onClick={onNavigateHome}>
            HOME
          </button>
          <ChevronRight size={14} className="bread-sep" />
          <span className="bread-active">Guide</span>
        </div>
      </div>

      {/* Empty Content Container */}
      <div className="guide-container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '50vh' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>User Guide</h1>
        <p style={{ fontSize: '15px', color: '#64748b' }}>No guide contents currently available.</p>
      </div>
    </div>
  );
}
