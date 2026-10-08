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
        <div className="container">
          <div className="footer-agreements-list">
            {agreementLinks.map((linkText, idx) => (
              <React.Fragment key={idx}>
                <a href={`#${linkText.toLowerCase().replace(/[\/\s]+/g, '-')}`}>
                  {linkText}
                </a>
                {idx < agreementLinks.length - 1 && (
                  <span className="footer-link-divider"></span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="container footer-main-container">
        <div className="footer-columns-grid">
          {/* Left Column: Grievance Officer, Address, Tax Details */}
          <div className="footer-left-col">
            <div className="footer-contact-block">
              For Queries and Grievance, please contact {grievance.contactPerson}<br />
              Email ID - <strong>{grievance.email}</strong> Mobile No.: <strong>{grievance.mobile}</strong><br />
              Nodal Officer Name - {grievance.nodalOfficer}<br />
              Telephone No.: <strong>{grievance.nodalTel}</strong>
            </div>

            <div className="footer-company-name">{company.name}</div>

            <div className="footer-address-block">
              <strong>Corporate Address :</strong> {company.corpAddress}<br />
              <strong>Registered Address :</strong> {company.regAddress}<br />
              <strong>CEO :</strong> {company.ceo}
            </div>

            <div className="footer-tax-info">
              CIN : {company.cin} &nbsp;|&nbsp; GSTIN : {company.gstin} &nbsp;|&nbsp; PAN : {company.pan}
            </div>

            <div className="footer-copyright">{company.copyright}</div>
          </div>

          {/* Right Column: Customer Support, Hours & Socials */}
          <div className="footer-right-col">
            <span className="cs-header-title">Customer Support</span>
            <div className="cs-phone-number">{support.phone}</div>

            <div className="cs-details">
              Fax Number : {support.fax}<br />
              {support.hours}<br />
              {support.holidays}<br />
              <strong>E-mail :</strong> {support.email}
            </div>

            <a href={`mailto:${support.email}`} className="cs-inquiry-btn">
              <Mail size={15} />
              <span>Inquiry</span>
            </a>

            {/* Social Icons */}
            <div className="footer-social-row">
              <a href="#facebook" className="social-icon-btn fb" title="Facebook" aria-label="Facebook">
                f
              </a>
              <a href="#youtube" className="social-icon-btn yt" title="YouTube" aria-label="YouTube">
                ▶
              </a>
              <a href="#instagram" className="social-icon-btn ig" title="Instagram" aria-label="Instagram">
                ig
              </a>
              <a href="#linkedin" className="social-icon-btn li" title="LinkedIn" aria-label="LinkedIn">
                in
              </a>
              <a href="#telegram" className="social-icon-btn tg" title="Telegram" aria-label="Telegram">
                <Send size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
