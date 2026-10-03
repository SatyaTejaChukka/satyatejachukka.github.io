import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useIsTouchDevice } from '../hooks/useMobile';
import {
  hapticLight,
  hapticMedium,
  requestDeviceOrientation,
} from '../utils/mobile';

import NeuralCanvas from './NeuralCanvas';

const Hero = () => {
  const name = 'Satya Teja Chukka';
  const letters = name.split('');
  const [isWaving, setIsWaving] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const touchStartY = useRef(0);
  const neuralCanvasRef = useRef(null);
  const isTouch = useIsTouchDevice();
  const reduceMotion = useReducedMotion();

  // Framer Motion values for performance (avoids re-renders)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const pullOffset = useMotionValue(0);
  
  // Springs for smoothness
  const springTiltX = useSpring(tiltX, { stiffness: 150, damping: 25 });
  const springTiltY = useSpring(tiltY, { stiffness: 150, damping: 25 });
  const springPullOffset = useSpring(pullOffset, { stiffness: 300, damping: 28 });

  const enableTilt = useCallback(async () => {
    const granted = await requestDeviceOrientation();
    setTiltEnabled(granted);
    return granted;
  }, []);

  useEffect(() => {
    if (!tiltEnabled) {
      return undefined;
    }

    const handleDeviceOrientation = (event) => {
      const { gamma, beta } = event;
      if (gamma === null || beta === null) return;

      const maxTilt = 20;
      const xTilt = (Math.min(Math.max(gamma, -30), 30) / 30) * maxTilt;
      const yTilt = (Math.min(Math.max(beta - 45, -30), 30) / 30) * maxTilt;
      
      tiltX.set(xTilt);
      tiltY.set(yTilt);
    };

    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    return () =>
      window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
  }, [tiltEnabled, tiltX, tiltY]);

  useEffect(() => {
    if (!isTouch || tiltEnabled) return undefined;

    const tryEnable = () => {
      enableTilt();
    };

    window.addEventListener('touchstart', tryEnable, { once: true, passive: true });
    return () => window.removeEventListener('touchstart', tryEnable);
  }, [isTouch, tiltEnabled, enableTilt]);

  useEffect(() => {
    if (!isTouch || reduceMotion) return undefined;

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e) => {
      if (window.scrollY > 8) {
        pullOffset.set(0);
        return;
      }
      const currentY = e.touches[0]?.clientY ?? 0;
      const delta = currentY - touchStartY.current;
      if (delta > 0) {
        pullOffset.set(Math.min(delta * 0.35, 36));
      } else {
        pullOffset.set(0);
      }
    };

    const onTouchEnd = () => pullOffset.set(0);

    const hero = document.getElementById('home');
    if (!hero) return undefined;

    hero.addEventListener('touchstart', onTouchStart, { passive: true });
    hero.addEventListener('touchmove', onTouchMove, { passive: true });
    hero.addEventListener('touchend', onTouchEnd, { passive: true });
    hero.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      hero.removeEventListener('touchstart', onTouchStart);
      hero.removeEventListener('touchmove', onTouchMove);
      hero.removeEventListener('touchend', onTouchEnd);
      hero.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isTouch, reduceMotion, pullOffset]);

  const handleTap = (e) => {
    if (isWaving) return;
    hapticMedium();
    setIsWaving(true);
    enableTilt();

    // Trigger backpropagation shockwave from tap location
    if (neuralCanvasRef.current) {
      const clientX = e?.clientX ?? (e?.touches ? e.touches[0]?.clientX : undefined);
      const clientY = e?.clientY ?? (e?.touches ? e.touches[0]?.clientY : undefined);
      if (clientX !== undefined && clientY !== undefined) {
        const heroEl = document.getElementById('home');
        const rect = heroEl ? heroEl.getBoundingClientRect() : { left: 0, top: 0 };
        neuralCanvasRef.current.triggerBackprop(clientX - rect.left, clientY - rect.top);
      } else {
        neuralCanvasRef.current.triggerBackprop();
      }
    }

    window.setTimeout(() => setIsWaving(false), letters.length * 40 + 600);
  };

  return (
    <section id="home" className="hero overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        {/* Living Synaptic Neural Net & Constellation Canvas */}
        <NeuralCanvas
          ref={neuralCanvasRef}
          tiltX={tiltEnabled ? springTiltX : null}
          tiltY={tiltEnabled ? springTiltY : null}
        />
      </div>

      <motion.div
        className="container hero-content"
        style={{ y: springPullOffset }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl hero-greeting mb-4">Hello, I&apos;m</h2>
          <h1
            className="hero-title"
            onClick={handleTap}
            style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
            aria-label="Interactive name: tap for animation"
          >
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                animate={
                  isWaving
                    ? {
                        scale: [1, 1.25, 1],
                        textShadow: [
                          '0px 0px 0px transparent',
                          '0px 0px 12px rgb(0, 243, 255)',
                          '0px 0px 0px transparent',
                        ],
                        color: ['var(--text-main)', '#fff', 'var(--text-main)'],
                      }
                    : {}
                }
                transition={
                  isWaving
                    ? {
                        duration: 0.5,
                        delay: index * 0.035,
                        ease: 'easeInOut',
                      }
                    : { type: 'spring', stiffness: 300 }
                }
                whileHover={
                  !isTouch
                    ? {
                        scale: 1.2,
                        textShadow: '0px 0px 8px rgb(0, 243, 255)',
                      }
                    : undefined
                }
                whileTap={
                  isTouch
                    ? {
                        scale: 1.15,
                        textShadow: '0px 0px 10px rgb(0, 243, 255)',
                      }
                    : undefined
                }
                style={{ display: 'inline-block' }}
                className={`hero-title-letter ${letter === ' ' ? 'mr-4' : ''}`}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </h1>

          <h3 className="hero-subtitle">B.Tech CSE (AI & ML) Student</h3>
          <p className="hero-desc">
            Building backend APIs and machine-learning applications using Python,
            FastAPI, and core ML libraries.
          </p>

          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="hero-badge-dot" />
            Open to Software Engineering & ML Internships
          </motion.div>

          <div className="flex justify-center gap-4">
            <motion.a
              href="#projects"
              className="btn btn-primary"
              whileTap={{ scale: 0.96 }}
              onClick={() => hapticLight()}
            >
              View Work
            </motion.a>
            <motion.a
              href="#contact"
              className="btn btn-outline glass-panel"
              whileTap={{ scale: 0.96 }}
              onClick={() => hapticLight()}
            >
              Contact Me
            </motion.a>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="scroll-indicator"
      >
        <ArrowDown />
      </motion.div>
    </section>
  );
};

export default Hero;
