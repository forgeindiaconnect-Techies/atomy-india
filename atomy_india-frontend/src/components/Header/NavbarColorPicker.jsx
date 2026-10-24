import React, { useState, useRef, useEffect } from 'react';
import { Palette, X, RotateCcw, Check, Copy, Sparkles } from 'lucide-react';
import './NavbarColorPicker.css';

export const NAVBAR_COLOR_PRESETS = [
  // ✨ Glass Light Presets (True Translucent Glassmorphic Effects for Light Colors)
  { name: 'Glass Pale Yellow', hex: 'rgba(254, 249, 195, 0.45)', category: 'yellow', isGlass: true },
  { name: 'Glass Butter Yellow', hex: 'rgba(254, 240, 138, 0.48)', category: 'yellow', isGlass: true },
  { name: 'Glass Cornsilk', hex: 'rgba(255, 248, 220, 0.50)', category: 'yellow', isGlass: true },
  { name: 'Glass Lemon Ice', hex: 'rgba(255, 253, 231, 0.45)', category: 'yellow', isGlass: true },
  { name: 'Glass Dark Yellow', hex: 'rgba(234, 179, 8, 0.50)', category: 'yellow', isGlass: true },
  { name: 'Glass Amber Glow', hex: 'rgba(245, 158, 11, 0.45)', category: 'yellow', isGlass: true },

  { name: 'Glass Frosted White', hex: 'rgba(255, 255, 255, 0.40)', category: 'neutral', isGlass: true },
  { name: 'Pure Crystal Glass', hex: 'rgba(255, 255, 255, 0.22)', category: 'neutral', isGlass: true },
  { name: 'Glass Pearl Mist', hex: 'rgba(241, 245, 249, 0.45)', category: 'neutral', isGlass: true },
  { name: 'Glass Cool Ice', hex: 'rgba(226, 232, 240, 0.45)', category: 'neutral', isGlass: true },

  { name: 'Glass Ice Sky', hex: 'rgba(186, 230, 253, 0.42)', category: 'blue', isGlass: true },
  { name: 'Glass Soft Azure', hex: 'rgba(224, 242, 254, 0.45)', category: 'blue', isGlass: true },
  { name: 'Glass Atomy Cyan', hex: 'rgba(0, 163, 224, 0.45)', category: 'blue', isGlass: true },

  { name: 'Glass Soft Sage', hex: 'rgba(209, 250, 229, 0.45)', category: 'green', isGlass: true },
  { name: 'Glass Mint Chill', hex: 'rgba(167, 243, 208, 0.45)', category: 'green', isGlass: true },

  { name: 'Glass Lavender', hex: 'rgba(237, 233, 254, 0.45)', category: 'purple', isGlass: true },
  { name: 'Glass Peach Bloom', hex: 'rgba(254, 215, 170, 0.45)', category: 'warm', isGlass: true },

  // Solid Yellows & Golds
  { name: 'Dark Yellow', hex: '#EAB308', category: 'yellow' },
  { name: 'Pale Yellow', hex: '#FEF9C3', category: 'yellow' },
  { name: 'Amber Gold', hex: '#F59E0B', category: 'yellow' },
  { name: 'Mustard Gold', hex: '#CA8A04', category: 'yellow' },
  { name: 'Cornsilk Cream', hex: '#FFF8DC', category: 'yellow' },
  { name: 'Butter Yellow', hex: '#FEF08A', category: 'yellow' },
  { name: 'Canary Yellow', hex: '#FACC15', category: 'yellow' },
  { name: 'Goldenrod', hex: '#D97706', category: 'yellow' },
  { name: 'Warm Honey', hex: '#B45309', category: 'yellow' },
  { name: 'Lemon Chiffon', hex: '#FFFDE7', category: 'yellow' },

  // Blues & Cyans
  { name: 'Atomy Cyan', hex: '#00A3E0', category: 'blue' },
  { name: 'Deep Atomy Blue', hex: '#0082CD', category: 'blue' },
  { name: 'Royal Blue', hex: '#0048A7', category: 'blue' },
  { name: 'Navy Midnight', hex: '#0A2540', category: 'blue' },
  { name: 'Deep Navy', hex: '#001B3A', category: 'blue' },
  { name: 'Cobalt Blue', hex: '#1D4ED8', category: 'blue' },
  { name: 'Ocean Teal', hex: '#0D9488', category: 'blue' },
  { name: 'Ice Sky Blue', hex: '#BAE6FD', category: 'blue' },
  { name: 'Soft Azure', hex: '#E0F2FE', category: 'blue' },
  { name: 'Steel Blue', hex: '#2563EB', category: 'blue' },

  // Greens
  { name: 'Emerald Green', hex: '#059669', category: 'green' },
  { name: 'Mint Jade', hex: '#10B981', category: 'green' },
  { name: 'Forest Green', hex: '#065F46', category: 'green' },
  { name: 'Deep Pine', hex: '#064E3B', category: 'green' },
  { name: 'Olive Green', hex: '#4D7C0F', category: 'green' },
  { name: 'Soft Sage', hex: '#D1FAE5', category: 'green' },

  // Reds & Warm
  { name: 'Saffron Orange', hex: '#EA580C', category: 'warm' },
  { name: 'Bright Orange', hex: '#F97316', category: 'warm' },
  { name: 'Coral Peach', hex: '#FB923C', category: 'warm' },
  { name: 'Crimson Red', hex: '#DC2626', category: 'warm' },
  { name: 'Ruby Dark Red', hex: '#991B1B', category: 'warm' },
  { name: 'Deep Burgundy', hex: '#881337', category: 'warm' },
  { name: 'Rose Coral', hex: '#F43F5E', category: 'warm' },

  // Purples & Pinks
  { name: 'Royal Violet', hex: '#6D28D9', category: 'purple' },
  { name: 'Deep Indigo', hex: '#4338CA', category: 'purple' },
  { name: 'Electric Purple', hex: '#7C3AED', category: 'purple' },
  { name: 'Deep Plum', hex: '#581C87', category: 'purple' },
  { name: 'Soft Lavender', hex: '#EDE9FE', category: 'purple' },
  { name: 'Hot Pink', hex: '#DB2777', category: 'purple' },

  // Neutrals & Blacks
  { name: 'Crisp White', hex: '#FFFFFF', category: 'neutral' },
  { name: 'Snow Cream', hex: '#FAFAFA', category: 'neutral' },
  { name: 'Pearl Mist', hex: '#F1F5F9', category: 'neutral' },
  { name: 'Cool Silver', hex: '#E2E8F0', category: 'neutral' },
  { name: 'Slate Gray', hex: '#475569', category: 'neutral' },
  { name: 'Dark Slate', hex: '#334155', category: 'neutral' },
  { name: 'Deep Charcoal', hex: '#1E293B', category: 'neutral' },
  { name: 'Jet Black', hex: '#111827', category: 'neutral' },
  { name: 'Luxury Midnight', hex: '#0B0F19', category: 'neutral' },
  { name: 'Pure Black', hex: '#000000', category: 'neutral' }
];

export function hexToRgba(colorStr, alpha = 0.45) {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  let r = 0, g = 0, b = 0;
  if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      r = parseInt(match[1], 10) || 0;
      g = parseInt(match[2], 10) || 0;
      b = parseInt(match[3], 10) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  const cleanHex = colorStr.replace('#', '');
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
    g = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
    b = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rgbaToHex(rgba) {
  if (!rgba || typeof rgba !== 'string') return rgba;
  if (rgba.startsWith('#')) return rgba;
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgba;
  const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
  const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

export function isHexColorDark(colorStr) {
  if (!colorStr || typeof colorStr !== 'string') return false;
  let r = 0, g = 0, b = 0;
  if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      r = parseInt(match[1], 10) || 0;
      g = parseInt(match[2], 10) || 0;
      b = parseInt(match[3], 10) || 0;
    }
  } else {
    const hex = colorStr.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) || 0;
      g = parseInt(hex[1] + hex[1], 16) || 0;
      b = parseInt(hex[2] + hex[2], 16) || 0;
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16) || 0;
      g = parseInt(hex.substring(2, 4), 16) || 0;
      b = parseInt(hex.substring(4, 6), 16) || 0;
    }
  }
  // Formula for perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 155;
}

export function parseAndValidateColor(input) {
  if (!input || typeof input !== 'string') return null;
  let val = input.trim();
  if (!val) return null;

  // If 3, 6, or 8 hex characters without '#', add '#'
  if (/^[0-9A-Fa-f]{3}$/.test(val) || /^[0-9A-Fa-f]{6}$/.test(val) || /^[0-9A-Fa-f]{8}$/.test(val)) {
    val = '#' + val;
  }

  // If valid hex with '#'
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val)) {
    return val;
  }

  // If valid rgb or rgba
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+\s*)?\)$/i.test(val)) {
    return val;
  }

  // Check if valid CSS named color (e.g. yellow, navy, gold)
  if (typeof window !== 'undefined' && typeof Option !== 'undefined') {
    const s = new Option().style;
    s.color = val;
    if (s.color !== '') {
      return val;
    }
  }

  return null;
}

export default function NavbarColorPicker({
  currentColor = '#00A3E0',
  isGlass = false,
  opacity = 0.45,
  onChangeColor,
  onToggleGlass,
  onChangeOpacity,
  onReset
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customInputHex, setCustomInputHex] = useState(currentColor);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!isInputFocused) {
      setCustomInputHex(currentColor);
    }
  }, [currentColor, isInputFocused]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredPresets = selectedCategory === 'all'
    ? NAVBAR_COLOR_PRESETS
    : selectedCategory === 'glass'
      ? NAVBAR_COLOR_PRESETS.filter(p => p.isGlass)
      : NAVBAR_COLOR_PRESETS.filter(p => p.category === selectedCategory);

  const handleSelectPreset = (preset) => {
    if (onChangeColor) {
      onChangeColor(preset.hex, !!preset.isGlass);
    }
  };

  const handleApplyColor = (colorToApply) => {
    const target = colorToApply !== undefined ? colorToApply : customInputHex;
    const validColor = parseAndValidateColor(target);
    if (validColor) {
      onChangeColor && onChangeColor(validColor, isGlass);
      setCustomInputHex(validColor);
    }
  };

  const handleCustomHexChange = (e) => {
    const rawVal = e.target.value;
    setCustomInputHex(rawVal);
    // Instant live preview/application whenever a valid color is typed or pasted
    const validColor = parseAndValidateColor(rawVal);
    if (validColor) {
      onChangeColor && onChangeColor(validColor, isGlass);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyColor();
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(currentColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="navbar-color-picker-container" ref={pickerRef}>
      {/* Navbar Trigger Button */}
      <button
        type="button"
        className={`navbar-color-trigger-btn ${isOpen ? 'active' : ''} ${isGlass ? 'glass-active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        title="Test and choose Navbar background color and glass effects"
        aria-label="Choose Navbar Color"
      >
        <span
          className={`navbar-color-swatch-bubble ${isGlass ? 'glass-bubble' : ''}`}
          style={{ backgroundColor: currentColor }}
        />
        {isGlass ? (
          <Sparkles size={14} className="navbar-color-sparkle-trigger" />
        ) : (
          <Palette size={14} className="navbar-color-palette-icon" />
        )}
        <span className="navbar-color-label">{isGlass ? 'Glass Navbar' : 'Navbar Color'}</span>
      </button>

      {/* Popover Color Choosing Panel */}
      {isOpen && (
        <div className="navbar-color-panel" role="dialog" aria-label="Navbar Color Chooser">
          <div className="navbar-color-panel-header">
            <div className="navbar-color-panel-title">
              <Palette size={16} />
              <span>Navbar Color & Glass Effects</span>
            </div>
            <button
              type="button"
              className="navbar-color-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close color panel"
            >
              <X size={15} />
            </button>
          </div>

          {/* Frosted Glass Effect Global Toggle Row */}
          <div className="navbar-glass-toggle-row">
            <div className="navbar-glass-toggle-info">
              <Sparkles size={15} className={`navbar-glass-sparkle-icon ${isGlass ? 'active' : ''}`} />
              <div className="navbar-glass-toggle-text-group">
                <span className="navbar-glass-toggle-title">Glass Effect (Frosted Blur)</span>
                <span className="navbar-glass-toggle-sub">Translucent frosted glass for light colors</span>
              </div>
            </div>
            <button
              type="button"
              className={`navbar-glass-toggle-pill ${isGlass ? 'active' : ''}`}
              onClick={() => onToggleGlass && onToggleGlass(!isGlass)}
              title={isGlass ? 'Disable glass effect' : 'Enable frosted glass effect'}
            >
              <span className="navbar-glass-toggle-thumb" />
              <span className="navbar-glass-toggle-text">{isGlass ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Transparency Level Slider (Active when Glass is ON) */}
          {isGlass && (
            <div className="navbar-transparency-row">
              <div className="navbar-transparency-header">
                <span className="navbar-transparency-title">Glass Transparency</span>
                <span className="navbar-transparency-val">
                  {Math.round((1 - opacity) * 100)}% Transparent
                </span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.85"
                step="0.05"
                value={opacity}
                onChange={(e) => onChangeOpacity && onChangeOpacity(parseFloat(e.target.value))}
                className="navbar-opacity-slider"
              />
              <div className="navbar-opacity-presets">
                {[
                  { label: 'High (75%)', val: 0.25 },
                  { label: 'Medium (55%)', val: 0.45 },
                  { label: 'Soft (35%)', val: 0.65 }
                ].map(p => (
                  <button
                    key={p.val}
                    type="button"
                    className={`navbar-opacity-pill ${opacity === p.val ? 'active' : ''}`}
                    onClick={() => onChangeOpacity && onChangeOpacity(p.val)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Category Filter Tabs */}
          <div className="navbar-color-cat-tabs">
            {[
              { id: 'all', label: 'All' },
              { id: 'glass', label: '✨ Glass Light' },
              { id: 'yellow', label: 'Yellow' },
              { id: 'blue', label: 'Blue' },
              { id: 'green', label: 'Green' },
              { id: 'warm', label: 'Warm/Red' },
              { id: 'purple', label: 'Purple' },
              { id: 'neutral', label: 'Neutral' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`navbar-color-cat-tab ${selectedCategory === tab.id ? 'active' : ''} ${tab.id === 'glass' ? 'glass-tab-btn' : ''}`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preset Swatches Grid */}
          <div className="navbar-color-presets-grid">
            {filteredPresets.map(preset => {
              const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
              const isPresetDark = isHexColorDark(preset.hex);
              return (
                <button
                  key={preset.hex + preset.name}
                  type="button"
                  className={`navbar-color-preset-card ${isSelected ? 'selected' : ''} ${preset.isGlass ? 'glass-card' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                  title={`${preset.name} (${preset.hex})${preset.isGlass ? ' - Frosted Glass Effect' : ''}`}
                >
                  <span
                    className={`navbar-color-preset-preview ${preset.isGlass ? 'glass-preview' : ''}`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected ? (
                      <Check
                        size={13}
                        color={isPresetDark ? '#ffffff' : '#000000'}
                        strokeWidth={3}
                      />
                    ) : preset.isGlass ? (
                      <Sparkles size={9} color={isPresetDark ? '#ffffff' : '#b45309'} />
                    ) : null}
                  </span>
                  <span className="navbar-color-preset-name">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Color Input & Hex Code Area */}
          <div className="navbar-color-custom-area">
            <div className="navbar-color-custom-row">
              <label className="navbar-color-input-wrapper" title="Pick any custom color">
                <input
                  type="color"
                  value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#00A3E0'}
                  onChange={(e) => onChangeColor && onChangeColor(e.target.value, isGlass)}
                  className="navbar-native-color-input"
                />
                <span
                  className={`navbar-color-input-preview ${isGlass ? 'glass-preview' : ''}`}
                  style={{ backgroundColor: currentColor }}
                />
                <span className="navbar-color-custom-text">Pick Custom Color</span>
              </label>

              <div className="navbar-hex-copy-group">
                <span
                  className="navbar-hex-live-indicator"
                  style={{ backgroundColor: parseAndValidateColor(customInputHex) || currentColor }}
                  title="Live color preview"
                />
                <input
                  type="text"
                  value={customInputHex}
                  onChange={handleCustomHexChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => {
                    setIsInputFocused(false);
                    handleApplyColor();
                  }}
                  className="navbar-hex-input"
                  placeholder="#0A2540"
                  maxLength={30}
                  aria-label="Enter hex or color value"
                />
                <button
                  type="button"
                  className="navbar-apply-hex-btn"
                  onClick={() => handleApplyColor()}
                  title="Apply entered color (Enter)"
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="navbar-copy-hex-btn"
                  onClick={handleCopyHex}
                  title="Copy Color Code"
                >
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="navbar-color-footer-actions">
              <span className="navbar-current-mode-badge">
                {isGlass ? '✨ Glass Light Mode' : isHexColorDark(currentColor) ? 'Dark Mode (White Text)' : 'Light Mode (Navy Text)'}
              </span>
              <button
                type="button"
                className="navbar-reset-color-btn"
                onClick={() => {
                  if (onReset) onReset();
                  else if (onChangeColor) onChangeColor('#00A3E0', false);
                }}
                title="Reset to default Atomy blue"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
