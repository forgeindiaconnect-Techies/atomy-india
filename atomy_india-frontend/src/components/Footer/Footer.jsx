import React from 'react';
import { Mail, Send } from 'lucide-react';
import { FOOTER_DATA } from '../../data/mockData';
import './Footer.css';

export default function Footer() {
  const { agreementLinks, grievance, company, support } = FOOTER_DATA;

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

      {/* 2. Main Footer Content */}
      <div className="footer-container footer-main-container">
        <div className="footer-columns-grid">
          {/* Left Column: Grievance Officer, Corporate Address, Tax Details */}
          <div className="footer-left-col">
            <div className="footer-contact-block">
              For Queries and Grievance, please contact {grievance.contactPerson}<br />
              Email ID - {grievance.email}&nbsp;Mobile No.: {grievance.mobile}<br />
              Nodal Officer Name - {grievance.nodalOfficer}<br />
              Telephone No.:{grievance.nodalTel}
            </div>

            <div className="footer-company-name">{company.name}</div>

            <div className="footer-address-block">
              Corporate Address : {company.corpAddress}<br />
              Registered Address : {company.regAddress}<br />
              CEO : {company.ceo}<br />
              CIN : {company.cin}<br />
              GSTIN : {company.gstin} PAN : {company.pan}
            </div>

            <div className="footer-copyright">{company.copyright}</div>
          </div>

          {/* Right Column: Customer Support, Socials & Inquiry */}
          <div className="footer-right-col">
            <div className="cs-top-row">
              <div className="cs-phone-cluster">
                <span className="cs-header-title">Customer Support </span>
                <span className="cs-phone-number">{support.phone}</span>
              </div>

              {/* Colorful Social Icons matching screenshot */}
              <div className="footer-social-row">
                <a
                  href="https://www.facebook.com/atomyindiapark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn fb"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  f
                </a>
                <a
                  href="https://www.youtube.com/channel/UC-rPEnjVmDAmLpUJukl6jMw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn yt"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  ▶
                </a>
                <a
                  href="https://www.instagram.com/atomyindia_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn ig"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/atomy-enterprise-india-pvt-ltd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn li"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  in
                </a>
                <a
                  href="https://t.me/atomy_india_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn tg"
                  title="Telegram"
                  aria-label="Telegram"
                >
                  <Send size={12} />
                </a>
              </div>
            </div>

            <div className="cs-details">
              Fax Number : {support.fax}<br />
              {support.hours}<br />
              <span className="cs-holidays">{support.holidays}</span>
            </div>

            <div className="cs-email-row">
              E-mail : <a href={`mailto:${support.email}`}>{support.email}</a>
            </div>

            <a href={`mailto:${support.email}`} className="cs-inquiry-btn">
              <Mail size={14} />
              <span>Inquiry</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
