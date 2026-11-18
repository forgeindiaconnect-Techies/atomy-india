import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  className = '',
  style = {},
  menuStyle = {},
  triggerStyle = {},
  disabled = false,
  fullWidth = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options: support string[], number[], or object options
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value !== undefined ? opt.value : (opt.id || opt.label),
      label: opt.label !== undefined ? opt.label : opt.value,
      sublabel: opt.sublabel,
      icon: opt.icon,
      color: opt.color,
      bg: opt.bg,
      badge: opt.badge
    };
  });

  const selectedOpt = normalizedOptions.find(opt => String(opt.value) === String(value)) || null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={`custom-dropdown-container ${className}`}
      style={{
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        maxWidth: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className="custom-dropdown-trigger"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '9px 12px',
          background: disabled ? '#f1f5f9' : '#ffffff',
          color: selectedOpt ? '#0f172a' : '#94a3b8',
          border: isOpen ? '1.5px solid #00A3E0' : '1.5px solid #cbd5e1',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          boxSizing: 'border-box',
          boxShadow: isOpen ? '0 0 0 3px rgba(0, 163, 224, 0.12)' : 'none',
          transition: 'all 0.15s ease',
          ...triggerStyle
        }}
      >
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selectedOpt ? (
            <>
              {selectedOpt.icon && <span>{selectedOpt.icon}</span>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedOpt.label}
              </span>
              {selectedOpt.sublabel && (
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ({selectedOpt.sublabel})
                </span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          size={15}
          color="#64748b"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }}
        />
      </button>

      {isOpen && (
        <div
          className="custom-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: '100%',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            maxHeight: '240px',
            overflowY: 'auto',
            boxSizing: 'border-box',
            ...menuStyle
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div style={{ padding: '12px', fontSize: '12.5px', color: '#94a3b8', textAlign: 'center' }}>
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt, idx) => {
              const isSelected = selectedOpt && String(selectedOpt.value) === String(opt.value);
              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  className={`custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    boxSizing: 'border-box',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    border: 'none',
                    borderBottom: idx < normalizedOptions.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#00A3E0' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {opt.icon && <span>{opt.icon}</span>}
                      {opt.badge ? (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: opt.bg || '#e0f2fe',
                          color: opt.color || '#0284c7'
                        }}>
                          {opt.label}
                        </span>
                      ) : (
                        <span>{opt.label}</span>
                      )}
                    </div>
                    {opt.sublabel && (
                      <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                  {isSelected && <Check size={14} color="#00A3E0" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
