import React from 'react';
import './PhoenixFlight.css';

/**
 * PhoenixFlight Component
 * Renders the REAL magnificent Golden Eagle Phoenix with wings spread wide in mid-flight.
 * As it soars from left to right:
 * 1. The navbar background behind the bird transforms into the phoenix's fiery golden color.
 * 2. When the bird exits/hides, the fiery background smoothly fades out and the original
 *    Atomy blue navbar color returns seamlessly.
 * 3. The bird beats its wings, embers split into the wind, and a radiant heatwave illuminates the bar.
 */
export default function PhoenixFlight() {
  return (
    <div className="phoenix-flight-track" aria-hidden="true">
      {/* Dynamic Navbar Fiery Background Trail that sweeps behind the bird */}
      <div className="phoenix-navbar-fire-sweep"></div>
      <div className="phoenix-navbar-fire-shimmer"></div>

      <div className="phoenix-soarer-wrapper">
        {/* Moving Radiant Heatwave / Wind Shockwave accompanying the bird */}
        <div className="phoenix-navbar-heat-shockwave"></div>
        <div className="phoenix-wind-turbulence"></div>

        {/* Flapping Phoenix Soarer with Realistic 3D Wing Motion */}
        <div className="phoenix-flapping-soarer">
          {/* Trailing Flame Plume & Aerodynamic Wind Gust Lines */}
          <div className="phoenix-flame-tail-plume"></div>
          <div className="phoenix-wind-gust-lines">
            <span className="gust gust-1"></span>
            <span className="gust gust-2"></span>
            <span className="gust gust-3"></span>
          </div>

          {/* Splitting Flame Embers & Wind Sparks */}
          <div className="phoenix-wind-embers">
            <span className="ember ember-1"></span>
            <span className="ember ember-2"></span>
            <span className="ember ember-3"></span>
            <span className="ember ember-4"></span>
            <span className="ember ember-5"></span>
            <span className="ember ember-6"></span>
            <span className="ember ember-7"></span>
            <span className="ember ember-8"></span>
            <span className="ember ember-9"></span>
            <span className="ember ember-10"></span>
            <span className="ember ember-11"></span>
            <span className="ember ember-12"></span>
            <span className="ember ember-13"></span>
            <span className="ember ember-14"></span>
          </div>

          {/* The REAL Majestic Golden Phoenix Bird (High-res with Spread Wings) */}
          <div className="phoenix-real-bird-frame">
            <img
              src="/phoenix-real.png"
              alt=""
              className="phoenix-real-bird-img"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
