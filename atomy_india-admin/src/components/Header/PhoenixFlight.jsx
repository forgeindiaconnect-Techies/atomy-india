import React from 'react';
import './PhoenixFlight.css';

/**
 * PhoenixFlight Component
 * 1. The background turns into the phoenix's fire color in real-time along with the bird.
 * 2. It ONLY fades AFTER the bird completely hides offscreen, restoring the original blue color.
 * 3. Includes realistic small small flickering fire flames dancing in the wind wake and on the tail.
 */
export default function PhoenixFlight() {
  return (
    <div className="phoenix-flight-track" aria-hidden="true">
      {/* 1. Dynamic Navbar Fire Background: Sweeps along with bird, fades ONLY after bird hides */}
      <div className="phoenix-navbar-fire-sweep"></div>
      <div className="phoenix-navbar-fire-shimmer"></div>

      {/* 2. Soaring Phoenix Group */}
      <div className="phoenix-soarer-wrapper">
        {/* Heat Shockwave & Turbulence Wave */}
        <div className="phoenix-navbar-heat-shockwave"></div>
        <div className="phoenix-wind-turbulence"></div>

        {/* 3. Flapping Phoenix with Small Realistic Flames */}
        <div className="phoenix-flapping-soarer">
          {/* Realistic Small Small Flickering Fire Flames */}
          <div className="phoenix-small-flames-cluster">
            <div className="mini-flame flame-1">
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
            </div>
            <div className="mini-flame flame-2">
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
            </div>
            <div className="mini-flame flame-3">
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
            </div>
            <div className="mini-flame flame-4">
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
            </div>
            <div className="mini-flame flame-5">
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
            </div>
            <div className="mini-flame flame-6">
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
            </div>
            <div className="mini-flame flame-7">
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
            </div>
            <div className="mini-flame flame-8">
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
            </div>
          </div>

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
