import React, { useEffect, useState, useRef } from 'react';
import './VoroSplash.css';
import { voroMarkBase64, voroWordmarkBase64 } from '../lib/voroSplashData';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    // Animation timing logic matching the provided HTML script:
    // t0 = performance.now() + 1400ms, duration D = 2600ms
    const t0 = performance.now() + 1400;
    const D = 2600;

    const tick = (t) => {
      const p = Math.max(0, Math.min(1, (t - t0) / D));
      // Quad ease-in-out curve
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const pct = e * 100;
      setProgress(pct);

      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        // Animation finished, wait 1.2s then fade out
        setTimeout(() => {
          setIsFadingOut(true);
          // Wait for fade-out transition (700ms) then call onFinish
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 700);
        }, 1200);
      }
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [onFinish]);

  const displayNum = String(Math.round(progress)).padStart(3, '0');

  return (
    <div className={`voro-splash-stage run ${isFadingOut ? 'out' : ''}`}>
      {/* Corner crosshairs / brackets */}
      <span className="voro-c tl"></span>
      <span className="voro-c tr"></span>
      <span className="voro-c bl"></span>
      <span className="voro-c br"></span>

      {/* Main animated logo */}
      <div className="voro-logo-box">
        <div className="voro-mk">
          <img alt="VORO" src={voroMarkBase64} />
          <span className="voro-ring"></span>
          <span className="voro-ring r2"></span>
          <svg className="voro-tri" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ff6a3d" />
                <stop offset="1" stopColor="#b0457a" />
              </linearGradient>
            </defs>
            <polygon
              points="22,10 92,50 22,90"
              fill="url(#g)"
              stroke="url(#g)"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {voroWordmarkBase64 && (
          <img className="voro-wd" alt="VORO" src={voroWordmarkBase64} />
        )}
      </div>

      {/* Futuristic scanner / progress bar */}
      <div className="voro-sc">
        <div className="voro-line">
          <i className="voro-fill" style={{ width: `${progress}%` }}></i>
          <b className="voro-head" style={{ left: `${progress}%` }}></b>
        </div>
        <p>
          <span>PLAY</span>
          <span>{displayNum}</span>
        </p>
      </div>
    </div>
  );
}
