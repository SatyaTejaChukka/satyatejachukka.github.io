import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * High-Performance Hardware-Accelerated Custom Cursor
 * - Operates entirely outside the React render cycle (zero re-renders on mousemove).
 * - Dot follows pointer instantaneously with translate3d.
 * - Follower ring uses requestAnimationFrame linear interpolation (lerp = 0.20)
 *   for a buttery, fluid glide with zero sluggishness or rubber-banding.
 * - Hover scaling uses pure GPU transforms (scale) instead of layout-triggering width/height.
 * - Portaled to document.body with top-level z-index so it remains visible above all modals.
 */
const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, .project-card, .timeline-card, .case-study-close, .case-study-nav-tab, .arch-modal-node-card, .arch-node-chip';

const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Disable on mobile/touch devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return undefined;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    let rafId = 0;
    let isVisible = false;
    let isHovering = false;

    // Mouse coordinates (target)
    let mouseX = -100;
    let mouseY = -100;

    // Follower ring coordinates (current interpolated)
    let ringX = -100;
    let ringY = -100;

    // Fluid lerp factor: 0.20 gives a responsive, premium fluid glide
    const LERP_FACTOR = 0.20;

    const render = () => {
      if (isVisible) {
        // Linear interpolation for silky smooth following
        ringX += (mouseX - ringX) * LERP_FACTOR;
        ringY += (mouseY - ringY) * LERP_FACTOR;

        // Direct hardware-accelerated transform writes (zero reflow, compositor only)
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${isHovering ? 1.45 : 1})`;
      }

      rafId = requestAnimationFrame(render);
    };

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        dot.style.opacity = '1';
        ring.style.opacity = '0.7';
      }
    };

    const onMouseEnter = () => {
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '0.7';
    };

    const onMouseLeave = () => {
      isVisible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (target && target.closest(HOVER_SELECTOR)) {
        if (!isHovering) {
          isHovering = true;
          ring.classList.add('cursor-ring--hover');
          dot.classList.add('cursor-dot--hover');
        }
      }
    };

    const onMouseOut = (e) => {
      const target = e.target;
      if (target && target.closest(HOVER_SELECTOR)) {
        const related = e.relatedTarget;
        if (!related || !related.closest(HOVER_SELECTOR)) {
          isHovering = false;
          ring.classList.remove('cursor-ring--hover');
          dot.classList.remove('cursor-dot--hover');
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseenter', onMouseEnter, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });

    // Start RAF loop
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>,
    document.body
  );
};

export default Cursor;
