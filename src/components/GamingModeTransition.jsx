import React, { useEffect, useRef } from 'react';
import './GamingModeHex.css';

export default function GamingModeTransition({ active, mode = 'enter', palette, onSwitch, onDone }) {
  const canvasRef = useRef(null);
  const blurRef = useRef(null);
  const iconRef = useRef(null);
  const flashRef = useRef(null);
  const animRef = useRef(null);
  const audioCtxRef = useRef(null);
  const callbacksRef = useRef({ onSwitch, onDone });

  useEffect(() => {
    callbacksRef.current = { onSwitch, onDone };
  }, [onSwitch, onDone]);

  useEffect(() => {
    if (!active) return;

    const cv = canvasRef.current;
    const bl = blurRef.current;
    const ic = iconRef.current;
    const fl = flashRef.current;
    if (!cv || !bl || !ic) return;

    const c = cv.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let R = Math.max(26, Math.min(W, H) / 8);
    let HX = [];
    let t0 = -1;
    let switched = false;
    let finished = false;
    const TOUT = 1.75;

    // Use palette RGB if provided, otherwise default to crimson
    const prgb = palette?.rgb || { co: [217, 24, 75], cp: [115, 20, 45], cc: [60, 60, 60] };
    const CO = mode === 'enter' ? prgb.co : prgb.cc;
    const CP = prgb.cp;
    const CC = mode === 'enter' ? prgb.cc : prgb.co;

    function mix(a, b, t) {
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }

    function cl(v) {
      return Math.max(0, Math.min(1, v));
    }

    function col(t) {
      const m = t < 0.5 ? mix(CO, CP, t * 2) : mix(CP, CC, (t - 0.5) * 2);
      return m.map(Math.round);
    }

    function build() {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr;
      cv.height = H * dpr;
      R = Math.max(26, Math.min(W, H) / 8);
      const w = Math.sqrt(3) * R;
      const mx = Math.hypot(W / 2, H / 2);
      HX = [];
      for (let r = -1; r < H / (1.5 * R) + 2; r++) {
        for (let q = -1; q < W / w + 2; q++) {
          const x = q * w + (r & 1 ? w / 2 : 0);
          const y = r * 1.5 * R;
          const d = Math.hypot(x - W / 2, y - H / 2) / mx;
          HX.push({
            x,
            y,
            d,
            j: Math.random() * 0.08,
            c: col(cl((x / W + y / H) / 2 + (Math.random() - 0.5) * 0.12)),
          });
        }
      }
    }

    function eo(x) {
      return 1 - Math.pow(1 - x, 3);
    }

    function eio(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function hexStr(x, y, r, a) {
      let o = '';
      for (let i = 0; i < 6; i++) {
        const an = a + Math.PI / 6 + (i * Math.PI) / 3;
        o += (i ? 'L' : 'M') + (x + r * Math.cos(an)).toFixed(1) + ' ' + (y + r * Math.sin(an)).toFixed(1);
      }
      return o + 'Z';
    }

    function hexPath(x, y, r, a) {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const an = a + Math.PI / 6 + (i * Math.PI) / 3;
        c.lineTo(x + r * Math.cos(an), y + r * Math.sin(an));
      }
      c.closePath();
    }

    function beep(f1, f2, d, ty, v, at) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime + (at || 0);
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = ty;
        o.frequency.setValueAtTime(f1, t);
        o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(v, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + d);
      } catch (e) {}
    }

    function draw(t) {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      const wv = (t - 0.95) / 0.8;
      const L = [];

      for (let i = 0; i < HX.length; i++) {
        const h = HX[i];
        const a = eo(cl((t - h.d * 0.5 - h.j) / 0.38));
        const b = eio(cl((t - TOUT - h.d * 0.5 - h.j) / 0.38));
        const s = a * (1 - b);
        if (s < 0.01) continue;
        const lit = wv > 0 && wv < 1.25 ? Math.exp(-Math.pow((h.d - wv) * 6, 2)) : 0;
        L.push([h, s, lit]);
      }

      c.globalCompositeOperation = 'lighter';
      c.lineJoin = 'round';
      L.forEach((e) => {
        const h = e[0];
        const s = e[1];
        c.strokeStyle = 'rgba(' + h.c + ',' + (0.18 + e[2] * 0.35) + ')';
        c.lineWidth = 7;
        hexPath(h.x, h.y, R * s * 0.95, (1 - s) * 1.05);
        c.stroke();
      });

      c.globalCompositeOperation = 'source-over';
      let P = '';
      L.forEach((e) => {
        const h = e[0];
        const s = e[1];
        const lit = e[2];
        hexPath(h.x, h.y, R * s * 0.95, (1 - s) * 1.05);
        P += hexStr(h.x, h.y, R * s * 0.95, (1 - s) * 1.05);
        
        // Deep obsidian crimson frosted glass fill
        c.fillStyle =
          'rgba(' +
          Math.round(25 + (h.c[0] - 25) * lit * 0.5) +
          ',' +
          Math.round(20 + (h.c[1] - 20) * lit * 0.5) +
          ',' +
          Math.round(24 + (h.c[2] - 24) * lit * 0.5) +
          ',' +
          (0.40 + lit * 0.40) +
          ')';
        c.fill();
        c.strokeStyle = 'rgba(' + h.c + ',' + (0.65 + lit * 0.35) + ')';
        c.lineWidth = 1.5;
        c.stroke();
      });

      const cp = P ? 'path("' + P + '")' : 'path("M0 0")';
      bl.style.clipPath = bl.style.webkitClipPath = cp;
    }

    function frame(now) {
      if (t0 < 0 || finished) return;
      const t = (now - t0) / 1000;
      draw(t);

      // Transition peak: swap theme underneath when screen is fully covered by frosted hexes
      if (t > 1.7 && !switched) {
        switched = true;
        if (callbacksRef.current.onSwitch) {
          callbacksRef.current.onSwitch();
        }
        if (fl) {
          fl.classList.remove('go');
          void fl.offsetWidth;
          fl.classList.add('go');
        }
        if (mode === 'enter') {
          beep(520, 1040, 0.12, 'square', 0.05);
          beep(780, 1560, 0.25, 'square', 0.05, 0.12);
        } else {
          beep(1200, 600, 0.15, 'triangle', 0.05);
          beep(800, 400, 0.22, 'triangle', 0.05, 0.12);
        }
      }

      // Finish cleanly once
      if (t > 2.85 && !finished) {
        finished = true;
        t0 = -1;
        c.clearRect(0, 0, W, H);
        bl.style.clipPath = bl.style.webkitClipPath = 'path("M0 0")';
        if (callbacksRef.current.onDone) {
          callbacksRef.current.onDone();
        }
        return;
      }

      animRef.current = requestAnimationFrame(frame);
    }

    build();
    window.addEventListener('resize', build);

    // Trigger animation once
    ic.classList.remove('go');
    void ic.getBoundingClientRect();
    ic.classList.add('go');

    if (mode === 'enter') {
      beep(110, 820, 0.8, 'sawtooth', 0.04);
    } else {
      beep(700, 150, 0.8, 'sine', 0.04);
    }

    t0 = performance.now();
    animRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', build);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, mode]);

  if (!active) return null;

  return (
    <>
      <div id="bl" ref={blurRef} className="hex-overlay-blur" />
      <canvas id="hx" ref={canvasRef} className="hex-canvas" />
      <svg id="ic" ref={iconRef} className="hex-icon" viewBox="0 0 24 24">
        <path
          className="d"
          pathLength="1"
          d="M6 8h12a4 4 0 014 4v3a3 3 0 01-5.2 2L15 15H9l-1.8 2A3 3 0 012 15v-3a4 4 0 014-4z"
        />
        <path className="d" pathLength="1" d="M8 10.5v3M6.5 12h3" />
        <circle className="b" cx="15.5" cy="11.5" r="0.9" />
        <circle className="b" cx="17.8" cy="13.2" r="0.9" />
      </svg>
      <div id="fl" ref={flashRef} className="hex-flash" />
    </>
  );
}
