import React from 'react';
import './NoticePage.css';

export default function NoticePage({ onNavigateHome, onNavigateView }) {
  return (
    <div className="atomy-official-notice-page">
      <div className="atomy-notice-center-container">
        {/* Page Header Title & Breadcrumb */}
        <div className="atomy-notice-top-row">
          <h1 className="atomy-notice-page-title">Notice</h1>
          <div className="atomy-notice-breadcrumb">
            <span
              className="crumb-gray"
              style={{ cursor: 'pointer' }}
              onClick={() => (onNavigateView ? onNavigateView('home') : onNavigateHome && onNavigateHome())}
            >
              Home
            </span>
            <span className="crumb-sep">&gt;</span>
            <span className="crumb-cyan">Notice</span>
          </div>
        </div>

        {/* Empty Content Container */}
        <div style={{ textAlign: 'center', padding: '90px 20px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '30px 0' }}>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>No notices currently published.</p>
        </div>
      </div>
    </div>
  );
}
