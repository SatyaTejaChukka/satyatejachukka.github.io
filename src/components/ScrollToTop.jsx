import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let rafId = 0;

        const updateProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const nextProgress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
            setProgress(nextProgress);
            setVisible(scrollTop > 240);
        };

        const handleScroll = () => {
            if (rafId) {
                return;
            }
            rafId = window.requestAnimationFrame(() => {
                rafId = 0;
                updateProgress();
            });
        };

        updateProgress();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        if (window.__lenis) {
            window.__lenis.scrollTo(0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);

    return (
        <button
            type="button"
            className={`scroll-progress-btn ${visible ? 'show' : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <svg
                className="scroll-progress-ring"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                aria-hidden="true"
            >
                <circle
                    className="scroll-progress-bg"
                    cx="24"
                    cy="24"
                    r={radius}
                />
                <circle
                    className="scroll-progress-bar"
                    cx="24"
                    cy="24"
                    r={radius}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: dashOffset,
                    }}
                />
            </svg>
            <ArrowUp size={18} className="scroll-progress-icon" />
        </button>
    );
};

export default ScrollToTop;
