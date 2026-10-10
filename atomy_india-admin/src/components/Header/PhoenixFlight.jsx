import React from 'react';
import './PhoenixFlight.css';

/**
 * PhoenixFlight Component
 * Renders the golden fiery Phoenix bird soaring from left to right
 * in the background of the Master Navbar, trailing splitting flame embers into the wind.
 */
export default function PhoenixFlight() {
  return (
    <div className="phoenix-flight-track" aria-hidden="true">
      <div className="phoenix-soarer">
        {/* Trailing Flame Plume trailing backward into the wind */}
        <div className="phoenix-flame-plume"></div>
        <div className="phoenix-heat-haze"></div>

        {/* Dynamic flame embers splitting through the wind */}
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
        </div>

        {/* Phoenix Bird Image (Transparent PNG, fiery gold feathers) */}
        <img
          src="/phoenix-bird.png"
          alt=""
          className="phoenix-bird-img"
          loading="eager"
        />
      </div>
    </div>
  );
}
