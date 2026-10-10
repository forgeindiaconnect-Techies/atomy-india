import React from 'react';
import './PhoenixFlight.css';

/**
 * PhoenixFlight Component
 * Renders the REAL magnificent Golden Eagle Phoenix with wings spread wide in mid-flight.
 * As it soars from left to right, its wings beat the air, fire embers split through
 * the wind, and a radiant heatwave/wind shockwave impacts the master navbar background.
 */
export default function PhoenixFlight() {
  return (
    <div className="phoenix-flight-track" aria-hidden="true">
      <div className="phoenix-soarer-wrapper">
        {/* 1. Navbar Environmental Impact Shockwave (moving heat & light wave) */}
        <div className="phoenix-navbar-heat-shockwave"></div>
        <div className="phoenix-wind-turbulence"></div>

        {/* 2. Flapping Phoenix Soarer with Realistic Wing Motion */}
        <div className="phoenix-flapping-soarer">
          {/* Trailing Flame Plume & Wind Gusts */}
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
