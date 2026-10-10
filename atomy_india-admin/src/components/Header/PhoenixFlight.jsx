import React from 'react';
import './PhoenixFlight.css';

/**
 * PhoenixFlight Component
 * 1. The fiery background is physically locked directly to the bird with ZERO gap.
 *    As the bird flies left-to-right, the background extends from the left edge of the navbar
 *    all the way to the bird in real-time.
 * 2. It ONLY fades AFTER the bird hides completely offscreen, smoothly restoring the original blue navbar.
 * 3. Realistic flying fire sparks and crackling wind embers (NO candles/teardrop shapes).
 * 4. High-resolution majestic golden eagle Phoenix with wide spreading wings.
 */
export default function PhoenixFlight() {
  return (
    <div className="phoenix-flight-track" aria-hidden="true">
      {/* Moving Phoenix Carrier: Controls flight path across navbar */}
      <div className="phoenix-soarer-wrapper">
        {/* Dynamic Fiery Background:
            Physically anchored to the bird's body with ZERO gap!
            Extends 4500px across the navbar to the left edge of the screen.
            Fades ONLY after the bird exits and hides offscreen. */}
        <div className="phoenix-attached-fire-background"></div>
        <div className="phoenix-attached-fire-leading-glow"></div>

        {/* Heat Shockwave & Turbulence Wave */}
        <div className="phoenix-navbar-heat-shockwave"></div>
        <div className="phoenix-wind-turbulence"></div>

        {/* Flapping Phoenix Soarer with Realistic 3D Wing Motion */}
        <div className="phoenix-flapping-soarer">
          {/* REALISTIC FLYING FIRE SPARKS (NO candles!) */}
          <div className="phoenix-sparks-emitter">
            {/* 1. Fast glowing streak sparks shooting backward */}
            <span className="spark-streak strk-1"></span>
            <span className="spark-streak strk-2"></span>
            <span className="spark-streak strk-3"></span>
            <span className="spark-streak strk-4"></span>
            <span className="spark-streak strk-5"></span>
            <span className="spark-streak strk-6"></span>

            {/* 2. Radiant micro glowing spark points */}
            <span className="spark-dot dot-1"></span>
            <span className="spark-dot dot-2"></span>
            <span className="spark-dot dot-3"></span>
            <span className="spark-dot dot-4"></span>
            <span className="spark-dot dot-5"></span>
            <span className="spark-dot dot-6"></span>
            <span className="spark-dot dot-7"></span>
            <span className="spark-dot dot-8"></span>
            <span className="spark-dot dot-9"></span>
            <span className="spark-dot dot-10"></span>
            <span className="spark-dot dot-11"></span>
            <span className="spark-dot dot-12"></span>

            {/* 3. Crackling embers cooling as they fly */}
            <span className="spark-ember emb-1"></span>
            <span className="spark-ember emb-2"></span>
            <span className="spark-ember emb-3"></span>
            <span className="spark-ember emb-4"></span>
            <span className="spark-ember emb-5"></span>
            <span className="spark-ember emb-6"></span>
            <span className="spark-ember emb-7"></span>
            <span className="spark-ember emb-8"></span>
          </div>

          {/* Aerodynamic Wind Gust Lines whooshing backward */}
          <div className="phoenix-wind-gust-lines">
            <span className="gust gust-1"></span>
            <span className="gust gust-2"></span>
            <span className="gust gust-3"></span>
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
