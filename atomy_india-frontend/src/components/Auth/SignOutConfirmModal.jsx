import React, { useEffect } from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';
import './SignOutConfirmModal.css';

export default function SignOutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  userName = 'Customer'
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="signout-modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
    >
      <div
        className="signout-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="signout-modal-close-btn"
          onClick={onCancel}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="signout-modal-icon-wrap">
          <div className="signout-modal-icon-circle">
            <LogOut size={28} className="signout-icon-svg" />
          </div>
        </div>

        <h3 id="signout-modal-title" className="signout-modal-title">
          Sign Out of Your Account?
        </h3>

        <p className="signout-modal-message">
          Are you sure you want to sign out{userName ? `, ${userName}` : ''}? You will need to sign in again to access wholesale member pricing, order tracking, and your account details.
        </p>

        <div className="signout-modal-actions">
          <button
            type="button"
            className="signout-btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="signout-btn-confirm"
            onClick={onConfirm}
          >
            <LogOut size={16} />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

