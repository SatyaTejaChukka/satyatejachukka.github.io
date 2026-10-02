import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, User, FolderKanban, Briefcase, Mail } from 'lucide-react';
import { hapticLight } from '../utils/mobile';
import { useIsMobileNav } from '../hooks/useMobile';

const sections = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'about', label: 'About', Icon: User },
  { id: 'projects', label: 'Projects', Icon: FolderKanban },
  { id: 'experience', label: 'Experience', Icon: Briefcase },
  { id: 'contact', label: 'Contact', Icon: Mail },
];

const MobileSectionNav = () => {
  const isMobile = useIsMobileNav();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (!isMobile) return undefined;

    let rafId = 0;
    const sectionIds = sections.map((s) => s.id);

    const updateActive = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollPosition = scrollY + 160;
      let current = sectionIds[0];

      for (let i = 0; i < sectionIds.length; i++) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && scrollPosition >= el.offsetTop) {
          current = id;
        }
      }

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

    if (window.__lenis) {
      window.__lenis.on('scroll', onScroll);
    }

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
  }, [isMobile]);

  if (!isMobile) return null;

  const handleNavClick = (e, sectionId) => {
    hapticLight();
    const target = document.getElementById(sectionId);
    if (target) {
      e.preventDefault();
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset: -20 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="mobile-section-nav" aria-label="Section navigation">
      <div className="mobile-section-nav-pill">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const SectionIcon = section.Icon;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`mobile-section-nav-item ${isActive ? 'active' : ''}`}
              aria-label={`Jump to ${section.label}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => handleNavClick(e, section.id)}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="mobile-section-nav-active-bg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <SectionIcon size={18} className="mobile-section-nav-icon" />
              <span className="mobile-section-nav-label">{section.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileSectionNav;
