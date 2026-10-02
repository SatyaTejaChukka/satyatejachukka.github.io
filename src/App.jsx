import React, { Suspense, lazy, useEffect, useState } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary, { SectionErrorBoundary } from './components/ErrorBoundary';
import { registerServiceWorker, isOffline, onOnlineStatusChange } from './utils/registerSW';
import Cursor from './components/Cursor';
import TouchRipple from './components/TouchRipple';
import MobileSectionNav from './components/MobileSectionNav';

// Lazy load components for code splitting
const About = lazy(() => import('./components/About'));
const Projects = lazy(() => import('./components/Projects'));
const Experience = lazy(() => import('./components/Experience'));
const Contact = lazy(() => import('./components/Contact'));

// Loading fallback component
const SectionLoader = () => (
  <div className="section-loader">
    <div className="loader-spinner" />
  </div>
);

function App() {
  const [isOnline, setIsOnline] = useState(!isOffline());

  // Initialize Lenis Smooth Scrolling for buttery 60/120fps motion
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    window.__lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const cleanup = onOnlineStatusChange(setIsOnline);
    return cleanup;
  }, []);

  // Scroll to top on page load/reload
  useEffect(() => {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Scroll to top
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        <Cursor />
        <TouchRipple />
        <Navbar />
        <main id="main-content" tabIndex="-1">
          <SectionErrorBoundary sectionName="Hero">
            <Hero />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="About">
            <Suspense fallback={<SectionLoader />}>
              <About />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Projects">
            <Suspense fallback={<SectionLoader />}>
              <Projects />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Experience">
            <Suspense fallback={<SectionLoader />}>
              <Experience />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Contact">
            <Suspense fallback={<SectionLoader />}>
              <Contact />
            </Suspense>
          </SectionErrorBoundary>
        </main>
        <Footer />
        <MobileSectionNav />
        <ScrollToTop />
        {!isOnline && (
          <div className="offline-indicator" role="status" aria-live="polite">
            You&apos;re offline. Some features may be unavailable.
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
