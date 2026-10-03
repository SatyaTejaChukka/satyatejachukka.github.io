import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

/**
 * Helper to parse hex or rgb string into { r, g, b }
 */
function parseColorToRgb(colorStr, defaultColor = { r: 0, g: 243, b: 255 }) {
  if (!colorStr) return defaultColor;
  const trimmed = colorStr.trim();

  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const intVal = parseInt(hex, 16);
    if (Number.isNaN(intVal)) return defaultColor;
    return {
      r: (intVal >> 16) & 255,
      g: (intVal >> 8) & 255,
      b: intVal & 255,
    };
  }

  if (trimmed.startsWith('rgb')) {
    const parts = trimmed.match(/\d+/g);
    if (parts && parts.length >= 3) {
      return {
        r: parseInt(parts[0], 10),
        g: parseInt(parts[1], 10),
        b: parseInt(parts[2], 10),
      };
    }
  }

  return defaultColor;
}

const NeuralCanvas = forwardRef(({ tiltX, tiltY }, ref) => {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const isVisibleRef = useRef(true);
  const mouseRef = useRef({ x: -2000, y: -2000, active: false });
  const backpropWavesRef = useRef([]);

  // Expose triggerBackprop to parent
  useImperativeHandle(ref, () => ({
    triggerBackprop: (originX, originY) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = originX !== undefined ? originX : rect.width / 2;
      const y = originY !== undefined ? originY : rect.height / 2;
      backpropWavesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(rect.width, rect.height) * 1.4,
        speed: 16,
        intensity: 1.0,
      });
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;

    // Theme color cache
    let primaryRgb = { r: 0, g: 243, b: 255 };
    let secondaryRgb = { r: 189, g: 0, b: 255 };

    const updateThemeColors = () => {
      if (typeof window === 'undefined') return;
      const rootStyle = getComputedStyle(document.documentElement);
      const prim = rootStyle.getPropertyValue('--primary') || '#00f3ff';
      const sec = rootStyle.getPropertyValue('--secondary') || '#bd00ff';
      primaryRgb = parseColorToRgb(prim, { r: 0, g: 243, b: 255 });
      secondaryRgb = parseColorToRgb(sec, { r: 189, g: 0, b: 255 });
    };
    updateThemeColors();

    const themeObserver = new MutationObserver(() => {
      updateThemeColors();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    let nodes = [];
    let pulses = [];
    const MAX_PULSES = 60;
    let connectionDist = 180;

    const createNodes = () => {
      const isMobile = width < 768;
      const nodeCount = isMobile ? 38 : 72;
      connectionDist = isMobile ? 130 : 185;

      nodes = [];
      pulses = [];

      for (let i = 0; i < nodeCount; i += 1) {
        const depth = 0.5 + Math.random() * 0.9; // 0.5 to 1.4
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55 * depth,
          vy: (Math.random() - 0.5) * 0.55 * depth,
          depth,
          baseRadius: (2.0 + Math.random() * 2.2) * depth,
          activation: 0.15,
          isAccent: Math.random() > 0.72, // ~28% secondary accent
          lastSpontaneousFire: Math.random() * 4000,
        });
      }
    };

    const resize = () => {
      const heroSection = canvas.closest('#home') || canvas.parentElement;
      const rect = heroSection ? heroSection.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      width = Math.max(rect.width, window.innerWidth);
      height = Math.max(rect.height, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      createNodes();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Attach listeners to hero section
    const heroSection = canvas.closest('#home') || canvas.parentElement;

    const handleMouseMove = (e) => {
      if (!heroSection) return;
      const rect = heroSection.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0 || !heroSection) return;
      const rect = heroSection.getBoundingClientRect();
      mouseRef.current.x = e.touches[0].clientX - rect.left;
      mouseRef.current.y = e.touches[0].clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    const handleHeroClick = (e) => {
      if (e.target && e.target.closest('a, button')) return;
      if (!heroSection) return;
      const rect = heroSection.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      backpropWavesRef.current.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: Math.max(width, height) * 1.4,
        speed: 16,
        intensity: 1.0,
      });
    };

    if (heroSection) {
      heroSection.addEventListener('mousemove', handleMouseMove, { passive: true });
      heroSection.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      heroSection.addEventListener('touchmove', handleTouchMove, { passive: true });
      heroSection.addEventListener('touchend', handleTouchEnd, { passive: true });
      heroSection.addEventListener('click', handleHeroClick, { passive: true });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    if (heroSection) observer.observe(heroSection);

    const spawnPulse = (fromIdx, toIdx, colorRgb, speedMultiplier = 1.0) => {
      if (pulses.length >= MAX_PULSES) return;
      pulses.push({
        from: fromIdx,
        to: toIdx,
        progress: 0,
        speed: (0.018 + Math.random() * 0.02) * speedMultiplier,
        color: colorRgb,
      });
    };

    let lastTime = performance.now();

    const render = (time) => {
      animFrameId.current = requestAnimationFrame(render);

      if (!isVisibleRef.current) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Reduced motion static view
      if (prefersReducedMotion) {
        ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`;
        ctx.lineWidth = 1;
        nodes.forEach((n) => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.baseRadius, 0, Math.PI * 2);
          ctx.fillStyle = n.isAccent
            ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)`
            : `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)`;
          ctx.fill();
        });
        ctx.restore();
        return;
      }

      const rawTiltX = typeof tiltX?.get === 'function' ? tiltX.get() : (Number(tiltX) || 0);
      const rawTiltY = typeof tiltY?.get === 'function' ? tiltY.get() : (Number(tiltY) || 0);
      const targetParallaxX = rawTiltX * 1.8;
      const targetParallaxY = rawTiltY * 1.8;

      // 1. Backpropagation Shockwaves
      const activeWaves = backpropWavesRef.current;
      for (let w = activeWaves.length - 1; w >= 0; w -= 1) {
        const wave = activeWaves[w];
        wave.radius += wave.speed;
        const progress = wave.radius / wave.maxRadius;
        wave.intensity = Math.max(0, 1 - progress);

        if (wave.intensity <= 0) {
          activeWaves.splice(w, 1);
        } else {
          // Inner core shockwave
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${wave.intensity * 0.75})`;
          ctx.lineWidth = 3.5 * wave.intensity;
          ctx.shadowColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.9)`;
          ctx.shadowBlur = 15;
          ctx.stroke();

          // Outer secondary corona
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, Math.max(0, wave.radius - 8), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, ${wave.intensity * 0.6})`;
          ctx.lineWidth = 2 * wave.intensity;
          ctx.shadowColor = `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)`;
          ctx.shadowBlur = 20;
          ctx.stroke();

          ctx.shadowBlur = 0;
        }
      }

      // 2. Nodes Update
      const mouse = mouseRef.current;
      const nodeLen = nodes.length;

      for (let i = 0; i < nodeLen; i += 1) {
        const node = nodes[i];

        node.x += node.vx + targetParallaxX * 0.025 * node.depth;
        node.y += node.vy + targetParallaxY * 0.025 * node.depth;

        if (node.x < -40) node.x = width + 40;
        else if (node.x > width + 40) node.x = -40;
        if (node.y < -40) node.y = height + 40;
        else if (node.y > height + 40) node.y = -40;

        // Wave collision
        for (let w = 0; w < activeWaves.length; w += 1) {
          const wave = activeWaves[w];
          const dx = node.x - wave.x;
          const dy = node.y - wave.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (Math.abs(dist - wave.radius) < wave.speed * 1.6) {
            node.activation = 1.0;
            for (let j = 0; j < nodeLen; j += 1) {
              if (i !== j) {
                const nx = nodes[j].x - node.x;
                const ny = nodes[j].y - node.y;
                const ndist = Math.sqrt(nx * nx + ny * ny);
                if (ndist < connectionDist * 0.85 && Math.random() > 0.5) {
                  spawnPulse(i, j, secondaryRgb, 2.0);
                }
              }
            }
          }
        }

        // Mouse hover excitation & gentle fluid attraction
        if (mouse.active) {
          const mdx = node.x - mouse.x;
          const mdy = node.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          const mouseRadius = 190;

          if (mdist < mouseRadius) {
            const factor = 1 - mdist / mouseRadius;
            node.activation = Math.max(node.activation, factor);

            const push = (1 - mdist / mouseRadius) * 0.9;
            node.x += (mdx / (mdist || 1)) * push;
            node.y += (mdy / (mdist || 1)) * push;

            if (Math.random() < 0.08) {
              for (let j = 0; j < nodeLen; j += 1) {
                if (i !== j) {
                  const ddx = nodes[j].x - node.x;
                  const ddy = nodes[j].y - node.y;
                  const d = Math.sqrt(ddx * ddx + ddy * ddy);
                  if (d < connectionDist) {
                    spawnPulse(i, j, primaryRgb, 1.4);
                    break;
                  }
                }
              }
            }
          }
        }

        // Spontaneous pulse firing
        if (time - node.lastSpontaneousFire > 3200 + Math.random() * 5000) {
          node.lastSpontaneousFire = time;
          node.activation = Math.max(node.activation, 0.55);
          for (let j = 0; j < nodeLen; j += 1) {
            if (i !== j) {
              const ddx = nodes[j].x - node.x;
              const ddy = nodes[j].y - node.y;
              const d = Math.sqrt(ddx * ddx + ddy * ddy);
              if (d < connectionDist * 0.75) {
                spawnPulse(i, j, node.isAccent ? secondaryRgb : primaryRgb, 1.0);
                break;
              }
            }
          }
        }

        node.activation *= 0.96;
      }

      // 3. Synapses with smooth bi-color gradients
      for (let i = 0; i < nodeLen; i += 1) {
        const na = nodes[i];
        for (let j = i + 1; j < nodeLen; j += 1) {
          const nb = nodes[j];
          const dx = nb.x - na.x;
          const dy = nb.y - na.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const distRatio = 1 - dist / connectionDist;
            const avgActivation = (na.activation + nb.activation) * 0.5;
            const alpha = (distRatio * 0.24 + avgActivation * 0.36) * ((na.depth + nb.depth) * 0.5);

            const colorA = na.isAccent ? secondaryRgb : primaryRgb;
            const colorB = nb.isAccent ? secondaryRgb : primaryRgb;

            const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
            const lineAlpha = Math.min(alpha, 0.45);
            grad.addColorStop(0, `rgba(${colorA.r}, ${colorA.g}, ${colorA.b}, ${lineAlpha})`);
            grad.addColorStop(1, `rgba(${colorB.r}, ${colorB.g}, ${colorB.b}, ${lineAlpha})`);

            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = (0.7 + avgActivation * 1.3) * na.depth;
            ctx.stroke();
          }
        }
      }

      // 4. Action Potential Pulses with streaming comet tail
      for (let p = pulses.length - 1; p >= 0; p -= 1) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1.0) {
          if (nodes[pulse.to]) {
            nodes[pulse.to].activation = Math.min(1.0, nodes[pulse.to].activation + 0.45);
          }
          pulses.splice(p, 1);
        } else {
          const fromNode = nodes[pulse.from];
          const toNode = nodes[pulse.to];

          if (fromNode && toNode) {
            const tailProgress = Math.max(0, pulse.progress - 0.08);
            const tailX = fromNode.x + (toNode.x - fromNode.x) * tailProgress;
            const tailY = fromNode.y + (toNode.y - fromNode.y) * tailProgress;
            const headX = fromNode.x + (toNode.x - fromNode.x) * pulse.progress;
            const headY = fromNode.y + (toNode.y - fromNode.y) * pulse.progress;
            const pdepth = (fromNode.depth + toNode.depth) * 0.5;

            // Comet tail
            const pulseGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
            pulseGrad.addColorStop(0, `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0)`);
            pulseGrad.addColorStop(1, `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0.95)`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(headX, headY);
            ctx.strokeStyle = pulseGrad;
            ctx.lineWidth = 2.4 * pdepth;
            ctx.stroke();

            // Glowing spark head
            ctx.beginPath();
            ctx.arc(headX, headY, 2.4 * pdepth, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0.9)`;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // 5. Neurons (Nodes)
      for (let i = 0; i < nodeLen; i += 1) {
        const node = nodes[i];
        const color = node.isAccent ? secondaryRgb : primaryRgb;
        const radius = node.baseRadius + node.activation * 3.0;
        const alpha = Math.min(0.85, 0.4 + node.activation * 0.45) * node.depth;

        // Outer glow corona (only visible when stimulated)
        if (node.activation > 0.1) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * (1.6 + node.activation * 1.2), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${node.activation * 0.22})`;
          ctx.fill();
        }

        // Main colored body
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.7)`;
        ctx.shadowBlur = node.activation * 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Subtle bright center core
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(1, radius * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + node.activation * 0.4})`;
        ctx.fill();
      }

      ctx.restore();
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      window.removeEventListener('resize', resize);
      if (heroSection) {
        heroSection.removeEventListener('mousemove', handleMouseMove);
        heroSection.removeEventListener('mouseleave', handleMouseLeave);
        heroSection.removeEventListener('touchmove', handleTouchMove);
        heroSection.removeEventListener('touchend', handleTouchEnd);
        heroSection.removeEventListener('click', handleHeroClick);
        observer.disconnect();
      }
      themeObserver.disconnect();
    };
  }, [tiltX, tiltY]);

  return (
    <canvas
      ref={canvasRef}
      className="neural-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
});

NeuralCanvas.displayName = 'NeuralCanvas';

export default NeuralCanvas;
