import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const THEME_STORAGE_KEY = 'theme-preference';
const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
];

const getSystemTheme = () => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialThemePreference = () => {
    if (typeof window === 'undefined') {
        return 'system';
    }
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
    }
    return 'system';
};

const ThemeToggle = ({ resolvedTheme, themePreference, themeLabel, onToggle }) => (
    <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
        className="theme-toggle"
        title={`Theme: ${themeLabel}`}
        aria-label={`Theme: ${themeLabel}. Click to change`}
        data-tooltip={`Theme: ${themeLabel}`}
    >
        {resolvedTheme === 'dark' ? (
            <Sun size={20} className="text-yellow-400" />
        ) : (
            <Moon size={20} className="text-[var(--primary)]" />
        )}
        {themePreference === 'system' && (
            <span className="theme-toggle-system">
                <Monitor size={14} />
            </span>
        )}
    </motion.button>
);

const Navbar = () => {
    const initialThemePreference = getInitialThemePreference();
    const [isScrolled, setIsScrolled] = useState(false);
    const [themePreference, setThemePreference] = useState(initialThemePreference);
    const [resolvedTheme, setResolvedTheme] = useState(
        initialThemePreference === 'system'
            ? getSystemTheme()
            : initialThemePreference
    );
    const [activeSection, setActiveSection] = useState('home');

    const themeLabel = themePreference === 'system'
        ? 'System'
        : themePreference === 'dark'
            ? 'Dark'
            : 'Light';

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    useEffect(() => {
        if (themePreference !== 'system' || !window.matchMedia) {
            return undefined;
        }
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event) => {
            const next = event.matches ? 'dark' : 'light';
            setResolvedTheme(next);
            document.documentElement.setAttribute('data-theme', next);
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, [themePreference]);

    useEffect(() => {
        let rafId = 0;
        const sectionIds = navLinks.map((l) => l.href.replace('#', ''));

        const updateActive = () => {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            setIsScrolled(scrollY > 50);

            // Active section threshold: 220px below top of viewport
            const scrollPosition = scrollY + 220;
            let current = sectionIds[0];

            for (let i = 0; i < sectionIds.length; i++) {
                const id = sectionIds[i];
                const el = document.getElementById(id);
                if (el && scrollPosition >= el.offsetTop) {
                    current = id;
                }
            }

            // Snap to contact if at bottom of page
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            if (winHeight + scrollY >= docHeight - 40) {
                current = sectionIds[sectionIds.length - 1];
            }

            setActiveSection((prev) => (prev !== current ? current : prev));
        };

        const onScroll = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = 0;
                updateActive();
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // Subscribe to Lenis scroll if available
        if (window.__lenis) {
            window.__lenis.on('scroll', onScroll);
        }

        // Initial check and retries for lazy-loaded sections
        updateActive();
        const t1 = setTimeout(updateActive, 150);
        const t2 = setTimeout(updateActive, 600);
        const t3 = setTimeout(updateActive, 1200);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (window.__lenis) {
                window.__lenis.off('scroll', onScroll);
            }
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    const handleNavClick = (e, href) => {
        if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                if (window.__lenis) {
                    window.__lenis.scrollTo(target, { offset: -70 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    const toggleTheme = () => {
        const order = ['dark', 'light', 'system'];
        const currentIndex = order.indexOf(themePreference);
        const nextTheme = order[(currentIndex + 1) % order.length];
        const nextResolved = nextTheme === 'system' ? getSystemTheme() : nextTheme;
        setThemePreference(nextTheme);
        setResolvedTheme(nextResolved);
        document.documentElement.setAttribute('data-theme', nextResolved);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container nav-container">
                <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="nav-logo text-gradient">
                    SatyaTeja
                </a>

                {/* Desktop Nav Links + Theme Toggle */}
                <div className="nav-links">
                    {navLinks.map((link) => {
                        const isActive = activeSection === link.href.replace('#', '');
                        return (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                aria-current={isActive ? 'page' : undefined}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {link.name}
                            </motion.a>
                        );
                    })}
                    <ThemeToggle
                        resolvedTheme={resolvedTheme}
                        themePreference={themePreference}
                        themeLabel={themeLabel}
                        onToggle={toggleTheme}
                    />
                </div>

                {/* Resume button — desktop only */}
                <div className="nav-right">
                    <motion.a
                        href={`${import.meta.env.BASE_URL}Satya_Teja_Latest_Resume.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resume-button-wrapper"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="resume-button-content">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="resume-icon">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span className="resume-text">View Resume</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="resume-arrow">
                                <path d="M7 7h10v10"></path>
                                <path d="M7 17 17 7"></path>
                            </svg>
                        </div>
                    </motion.a>
                </div>

                {/* Mobile: theme toggle only — navigation lives in bottom pill bar */}
                <div className="nav-mobile-actions">
                    <ThemeToggle
                        resolvedTheme={resolvedTheme}
                        themePreference={themePreference}
                        themeLabel={themeLabel}
                        onToggle={toggleTheme}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
