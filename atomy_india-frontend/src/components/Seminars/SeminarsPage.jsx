import React from 'react';
import { ChevronRight } from 'lucide-react';
import './SeminarsPage.css';

export default function SeminarsPage({ onNavigateHome }) {
  return (
    <div className="seminars-page" style={{ minHeight: '60vh', padding: '30px 0' }}>
      <div className="seminars-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Breadcrumb & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0 }}>Seminars</h1>
          <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ cursor: 'pointer' }} onClick={onNavigateHome}>Home</span>
            <ChevronRight size={14} />
            <span style={{ color: '#00A3E0', fontWeight: 600 }}>Seminars</span>
          </div>
        </div>

        {/* Empty Content Container */}
        <div style={{ textAlign: 'center', padding: '90px 20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', margin: '30px 0' }}>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>No seminars currently scheduled.</p>
        </div>
      </div>
    </div>
  );
}
