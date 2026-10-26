import { useEffect, useRef } from 'react';

const STAR_SETTINGS = {
  count: 500,
  minRadius: 0.25,
  radiusRange: 0.75,
  minDuration: 2,
  durationRange: 5,
  color: '#e2edff',
  minOpacity: 0.2,
  maxOpacity: 0.95,
  stillOpacity: 0.65,
};

const MOON_SETTINGS = {
  x: 0.8,
  y: 0.28,
  maxRadius: 19,
  radiusRatio: 0.042,
  colors: ['#fff9dc', '#ffe7a3', '#f4c65e'],
  glowColors: ['#ffe7a324', '#ffe7a300'],
  shadowColor: '#ffe7a380',
  shadowBlur: 12,
};

const FRAME_INTERVAL = 1000 / 30;
const MAX_PIXEL_RATIO = 2;

const NightSky = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Normalized positions stay stable when the mobile viewport changes height.
    const stars = Array.from({ length: STAR_SETTINGS.count }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: STAR_SETTINGS.minRadius + Math.random() * STAR_SETTINGS.radiusRange,
      duration: STAR_SETTINGS.minDuration + Math.random() * STAR_SETTINGS.durationRange,
      phase: Math.random() * Math.PI * 2,
    }));
    let width = 0;
    let height = 0;
    let pixelRatio = 0;
    let moon;
    let frame = 0;
    let lastDraw = -Infinity;

    const drawStars = (time) => {
      context.fillStyle = STAR_SETTINGS.color;
      stars.forEach((star) => {
        const wave = Math.sin((time / 1000 / star.duration) * Math.PI * 2 + star.phase);
        context.globalAlpha = motion.matches
          ? STAR_SETTINGS.stillOpacity
          : STAR_SETTINGS.minOpacity + ((wave + 1) / 2) * (STAR_SETTINGS.maxOpacity - STAR_SETTINGS.minOpacity);
        context.beginPath();
        context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        context.fill();
      });
    };

    const drawMoon = () => {
      const { x, y, radius, glow, surface } = moon;
      context.globalAlpha = 1;
      context.fillStyle = glow;
      context.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8);
      context.fillStyle = surface;
      context.shadowColor = MOON_SETTINGS.shadowColor;
      context.shadowBlur = MOON_SETTINGS.shadowBlur;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    };

    const draw = (time) => {
      context.clearRect(0, 0, width, height);
      drawStars(time);
      drawMoon();
    };

    const animate = (time) => {
      // Limit repainting to 30 fps; React never rerenders for animation frames.
      if (time - lastDraw >= FRAME_INTERVAL) {
        draw(time);
        lastDraw = time - ((time - lastDraw) % FRAME_INTERVAL);
      }
      frame = window.requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      window.cancelAnimationFrame(frame);
      if (!moon || document.hidden) return;
      lastDraw = performance.now();
      draw(lastDraw);
      if (!motion.matches) frame = window.requestAnimationFrame(animate);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      if (bounds.width === width && bounds.height === height && ratio === pixelRatio) return;
      width = bounds.width;
      height = bounds.height;
      pixelRatio = ratio;
      if (!width || !height) {
        window.cancelAnimationFrame(frame);
        moon = undefined;
        return;
      }
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Cache size-dependent gradients; animation frames only paint them.
      const x = width * MOON_SETTINGS.x;
      const y = height * MOON_SETTINGS.y;
      const radius = Math.min(MOON_SETTINGS.maxRadius, width * MOON_SETTINGS.radiusRatio);
      const glow = context.createRadialGradient(x, y, radius * 0.4, x, y, radius * 4);
      glow.addColorStop(0, MOON_SETTINGS.glowColors[0]);
      glow.addColorStop(1, MOON_SETTINGS.glowColors[1]);
      const surface = context.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      MOON_SETTINGS.colors.forEach((color, index) => surface.addColorStop(index / 2, color));
      moon = { x, y, radius, glow, surface };
      syncAnimation();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    motion.addEventListener('change', syncAnimation);
    document.addEventListener('visibilitychange', syncAnimation);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      motion.removeEventListener('change', syncAnimation);
      document.removeEventListener('visibilitychange', syncAnimation);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" aria-hidden="true" />
  );
};

export default NightSky;
