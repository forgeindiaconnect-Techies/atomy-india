import React from 'react';
import './PhoenixFlight.css';

/**
 * PhoenixFlight Component
 * Renders an articulated, realistic Golden Phoenix with spreading and flapping wings.
 * As it flies from left to right, its wings beat the air, fire embers split through
 * the wind, and a radiant heatwave/wind shockwave impacts the master navbar background.
 */
export default function PhoenixFlight() {
  return (
    <div className="phoenix-flight-track" aria-hidden="true">
      {/* 1. Navbar Environmental Impact Shockwave (moving heat & light wave) */}
      <div className="phoenix-soarer-wrapper">
        <div className="phoenix-navbar-heat-shockwave"></div>
        <div className="phoenix-wind-turbulence"></div>

        <div className="phoenix-flapping-soarer">
          {/* 2. Trailing Wind Streaks & Flame Plumes */}
          <div className="phoenix-flame-tail-plume"></div>
          <div className="phoenix-wind-gust-lines">
            <span className="gust gust-1"></span>
            <span className="gust gust-2"></span>
            <span className="gust gust-3"></span>
          </div>

          {/* 3. Splitting Flame Embers & Wind Sparks */}
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

          {/* 4. Articulated Majestic Golden Phoenix SVG with Realistic Flapping Wings */}
          <svg
            className="phoenix-svg"
            viewBox="0 0 200 95"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Rich Golden Fiery Gradients matching User Reference Image */}
              <linearGradient id="phxBodyGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#bf360c" />
                <stop offset="30%" stopColor="#e65100" />
                <stop offset="65%" stopColor="#ffb300" />
                <stop offset="90%" stopColor="#ffe082" />
                <stop offset="100%" stopColor="#fff9c4" />
              </linearGradient>

              <linearGradient id="phxWingGrad" x1="0%" y1="100%" x2="70%" y2="0%">
                <stop offset="0%" stopColor="#4e1700" />
                <stop offset="25%" stopColor="#d84315" />
                <stop offset="55%" stopColor="#ff8f00" />
                <stop offset="85%" stopColor="#ffca28" />
                <stop offset="100%" stopColor="#fff59d" />
              </linearGradient>

              <linearGradient id="phxBackWingGrad" x1="0%" y1="100%" x2="60%" y2="0%">
                <stop offset="0%" stopColor="#2e0d00" />
                <stop offset="35%" stopColor="#b71c1c" />
                <stop offset="70%" stopColor="#f57c00" />
                <stop offset="100%" stopColor="#ffb74d" />
              </linearGradient>

              <linearGradient id="phxTailGrad1" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="rgba(216, 67, 21, 0)" />
                <stop offset="30%" stopColor="#ff3d00" />
                <stop offset="70%" stopColor="#ff9100" />
                <stop offset="100%" stopColor="#ffd54f" />
              </linearGradient>

              <linearGradient id="phxTailGrad2" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="rgba(191, 54, 12, 0)" />
                <stop offset="40%" stopColor="#ff6d00" />
                <stop offset="85%" stopColor="#ffab00" />
                <stop offset="100%" stopColor="#ffe57f" />
              </linearGradient>

              {/* Fiery Eye & Beak Highlights */}
              <linearGradient id="phxBeakGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#ffb300" />
                <stop offset="80%" stopColor="#fff176" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              {/* Golden Fire Glow Filter */}
              <filter id="phxFireAura" x="-25%" y="-25%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Back Wing (Flapping in realistic 3D perspective) */}
            <g className="phx-back-wing-group">
              <path
                className="phx-back-wing"
                d="M 100 42 C 90 28, 80 12, 68 2 C 78 12, 85 24, 88 36 C 82 26, 74 15, 60 8 C 72 20, 80 32, 82 42 Z"
                fill="url(#phxBackWingGrad)"
                opacity="0.9"
              />
            </g>

            {/* Streaming Flame Tail Ribbons (Undulating with wind drag) */}
            <g className="phx-tail-group">
              <path
                className="phx-tail-streamer streamer-top"
                d="M 58 49 C 45 42, 28 36, 6 42 C 22 47, 36 50, 52 50 Z"
                fill="url(#phxTailGrad1)"
              />
              <path
                className="phx-tail-streamer streamer-mid"
                d="M 56 52 C 40 50, 18 52, 0 62 C 20 59, 36 57, 50 54 Z"
                fill="url(#phxTailGrad2)"
              />
              <path
                className="phx-tail-streamer streamer-bottom"
                d="M 60 55 C 44 57, 26 63, 10 74 C 26 67, 42 62, 54 58 Z"
                fill="url(#phxTailGrad1)"
              />
            </g>

            {/* Main Phoenix Body, Head, Crest & Breast */}
            <g className="phx-body-group" filter="url(#phxFireAura)">
              {/* Lower belly & feather tufts */}
              <path
                d="M 60 52 C 72 58, 88 64, 106 63 C 122 62, 134 56, 142 49 C 128 53, 110 54, 94 51 C 78 48, 66 49, 60 52 Z"
                fill="#a82d06"
              />

              {/* Main glowing torso & neck arch */}
              <path
                d="M 58 50 C 72 48, 92 46, 114 48 C 130 49, 144 47, 154 41 C 158 37, 160 30, 162 24 C 160 27, 156 31, 150 33 C 146 27, 144 20, 140 15 C 145 22, 148 27, 148 34 C 140 37, 128 38, 112 38 C 94 38, 76 43, 58 50 Z"
                fill="url(#phxBodyGrad)"
              />

              {/* Fierce Phoenix Head & Crown Crest */}
              <path
                d="M 152 32 C 158 28, 164 22, 166 14 C 163 19, 159 23, 154 26 C 160 21, 166 17, 172 10 C 168 18, 164 23, 160 27 C 167 25, 176 23, 182 17 C 176 24, 170 29, 164 32 C 172 32, 180 33, 186 35 C 179 38, 172 40, 165 40 C 162 44, 156 46, 150 46 C 144 46, 140 43, 142 39 C 146 38, 150 35, 152 32 Z"
                fill="url(#phxBodyGrad)"
              />

              {/* Sharp Golden Beak */}
              <path
                d="M 168 34 Q 182 36 188 38 Q 179 42 166 40 Z"
                fill="url(#phxBeakGrad)"
              />

              {/* Burning Ruby / Amber Eye */}
              <circle cx="162" cy="32" r="2.2" fill="#ffd600" />
              <circle cx="162.6" cy="31.8" r="1.1" fill="#3e1300" />
            </g>

            {/* Front Main Spreading Wing (Articulated Wide Wingspan Flap) */}
            <g className="phx-front-wing-group" filter="url(#phxFireAura)">
              {/* Primary & secondary feather layers spreading wide */}
              <path
                className="phx-front-wing"
                d="M 116 46 
                   C 106 32, 95 14, 82 0 
                   C 95 10, 106 24, 110 36 
                   C 98 24, 86 11, 70 3 
                   C 86 16, 96 30, 100 42 
                   C 88 32, 74 20, 58 12 
                   C 76 25, 88 38, 92 48 
                   C 80 40, 68 32, 52 26 
                   C 70 38, 80 48, 85 54 
                   C 95 52, 108 50, 116 46 Z"
                fill="url(#phxWingGrad)"
              />

              {/* Layered Golden Feather Rib Highlights */}
              <path
                d="M 112 44 C 104 32, 94 18, 82 4 C 92 14, 102 26, 106 37 Z"
                fill="#fff9c4"
                opacity="0.7"
              />
              <path
                d="M 104 45 C 94 34, 82 22, 70 8 C 82 20, 92 31, 96 41 Z"
                fill="#ffe082"
                opacity="0.6"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
