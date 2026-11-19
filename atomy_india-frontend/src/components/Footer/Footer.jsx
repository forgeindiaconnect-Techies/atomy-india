import React from 'react';
import { FOOTER_DATA } from '../../data/mockData';
import './Footer.css';

export default function Footer() {
  const { agreementLinks } = FOOTER_DATA;

  return (
    <footer className="footer-wrapper">
      {/* 1. Agreement & Policy Links Bar */}
      <div className="footer-agreements-bar">
        <div className="footer-container">
          <div className="footer-agreements-list">
            {agreementLinks.map((linkText, idx) => (
              <React.Fragment key={idx}>
                <a href={`#${linkText.toLowerCase().replace(/[\/\s]+/g, '-')}`}>
                  {linkText}
                </a>
                {idx < agreementLinks.length - 1 && (
                  <span className="footer-link-divider">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
